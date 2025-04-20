from flask import Flask, send_file, jsonify, request
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from flask_cors import CORS
import io
import os
import matplotlib
from flask_socketio import SocketIO, emit
from collections import defaultdict
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
CSV_FILE = "pat.csv"
current_day_initial_count = None
last_midnight_count = None
hospital_connections = defaultdict(set)

# Initialize CSV file if not exists
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w') as f:
        f.write("Patient_ID,Hospital_ID,Urban_Rural,Gender,Age,Blood_Group,Triage_Level,Factor,Entry_Date,Entry_Time,Leave_Date,Leave_Time\n")

def broadcast_patient_update(hospital_id, action, patient_data=None):
    """Broadcast patient updates to all connected clients of the same hospital"""
    if hospital_id in hospital_connections:
        for sid in list(hospital_connections[hospital_id]):
            try:
                emit('patient_update', {
                    'action': action,
                    'patient': patient_data,
                    'timestamp': datetime.now().isoformat(),
                    'hospital_id': hospital_id
                }, room=sid)
            except:
                hospital_connections[hospital_id].remove(sid)

def get_current_patients(hospital_id=None):
    """Get current patients with optional hospital filter"""
    df = pd.read_csv(CSV_FILE)
    df.replace("NULL", pd.NA, inplace=True)
    if hospital_id:
        return df[df['Hospital_ID'] == hospital_id].to_dict('records')
    return df.to_dict('records')

def generate_hourly_graph():
    global current_day_initial_count, last_midnight_count

    df = pd.read_csv("pat.csv")
    df.replace("NULL", pd.NA, inplace=True)
    
    def parse_datetime(date_col, time_col):
        combined = df[date_col].astype(str).str.strip() + ' ' + df[time_col].astype(str).str.strip()
        return pd.to_datetime(
            combined,
            format='%Y-%m-%d %H:%M:%S',
            errors='coerce'
        ).fillna(
            pd.to_datetime(combined, format='%Y-%m-%d %H:%M', errors='coerce')
        )

    df["Entry_Datetime"] = parse_datetime("Entry_Date", "Entry_Time")
    df["Leave_Datetime"] = parse_datetime("Leave_Date", "Leave_Time")
    now = datetime.now()
    date_today = now.date()
    current_hour = now.hour

    if current_day_initial_count is None:
        current_day_initial_count = df[df["Leave_Date"].isna() & df["Leave_Time"].isna()].shape[0] + get_current_day_discharge_count(df)
        prevc = current_day_initial_count
    else:
        prevc = current_day_initial_count

    today_entries = df[df["Entry_Datetime"].dt.date == date_today]
    today_leaves = df[df["Leave_Datetime"].dt.date == date_today]

    hours = list(range(0, 25))
    patient_counts = [prevc]
    for hour in range(1, current_hour + 1):
        entry_count = today_entries[(today_entries["Entry_Datetime"].dt.hour >= hour - 1) & 
                                    (today_entries["Entry_Datetime"].dt.hour < hour)].shape[0]
        leave_count = today_leaves[(today_leaves["Leave_Datetime"].dt.hour >= hour - 1) & 
                                   (today_leaves["Leave_Datetime"].dt.hour < hour)].shape[0]
        prevc += entry_count - leave_count
        patient_counts.append(prevc)

    while len(patient_counts) < 25:
        patient_counts.append(prevc)

    if current_hour == 23:
        last_midnight_count = prevc
        current_day_initial_count = None

    plt.clf()
    plt.figure(figsize=(12, 5))
    plt.plot(hours, patient_counts, linestyle="-", color="b", linewidth=2, marker="o", markersize=5)

    plt.xlabel("Time (Hours)", fontsize=12)
    plt.ylabel("Number of Patients", fontsize=12)
    plt.title(f"Patient Count Over Time - {date_today}", fontsize=14)
    plt.yticks(range(0, max(max(patient_counts), 20) + 1))
    plt.xticks(hours)
    plt.grid(True, linestyle="--", alpha=0.5)

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()

    return buf

def get_current_day_discharge_count(df):
    today_leaves = df[df["Leave_Datetime"].dt.date == datetime.now().date()]
    return today_leaves.shape[0]

@app.route('/graph')
def get_graph():
    buf = generate_hourly_graph()
    return send_file(buf, mimetype='image/png')

@app.route('/list', methods=['GET'])
def list_patients():
    try:
        data = pd.read_csv("pat.csv")
        data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')
        current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]
        patients_list = current_patients.to_dict(orient='records')
        current_patients.to_csv("list.csv", index=False)
        return jsonify({
            "status": "success",
            "count": len(patients_list),
            "current_patients": patients_list
        })
    except FileNotFoundError:
        return jsonify({"error": "Patient data file not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/discharge/<patient_id>', methods=['POST'])
def discharge_patient(patient_id):
    try:
        data = pd.read_csv(CSV_FILE)
        data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')
    
        patient = data[data['Patient_ID'] == patient_id]
        if patient.empty:
            return jsonify({"error": "Patient not found"}), 404
        if patient.iloc[0]['Leave_Date'] != 'NULL' or patient.iloc[0]['Leave_Time'] != 'NULL':
            return jsonify({"error": "Patient is already discharged"}), 400

        current_time = datetime.now()
        leave_date = current_time.strftime('%Y-%m-%d')
        leave_time = current_time.strftime('%H:%M:%S')
        data.loc[data['Patient_ID'] == patient_id, 'Leave_Date'] = leave_date
        data.loc[data['Patient_ID'] == patient_id, 'Leave_Time'] = leave_time

        data.to_csv(CSV_FILE, index=False)
        
        # Broadcast discharge to all hospital users
        hospital_id = patient.iloc[0]['Hospital_ID']
        broadcast_patient_update(
            hospital_id,
            'discharge',
            {
                'Patient_ID': patient_id,
                'Leave_Date': leave_date,
                'Leave_Time': leave_time
            }
        )
        
        return jsonify({
            "status": "success",
            "message": f"Patient {patient_id} discharged successfully",
            "Leave_Date": leave_date,
            "Leave_Time": leave_time
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/admitted-patients', methods=['GET'])
def get_admitted_patients():
    try:
        df = pd.read_csv("pat.csv")
        df.replace("NULL", pd.NA, inplace=True)
        admitted_patients = df[df["Leave_Date"].isna() & df["Leave_Time"].isna()]
        num_admitted_patients = admitted_patients.shape[0]
        return jsonify({"num_admitted_patients": num_admitted_patients})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/add-patient', methods=['POST'])
def add_patient():
    try:
        patient_data = request.json
        new_patient_df = pd.DataFrame([patient_data])
        new_patient_df.to_csv(CSV_FILE, mode='a', header=False, index=False)
        
        hospital_id = patient_data.get('Hospital_ID')
        if hospital_id:
            # Broadcast new patient to all hospital users
            broadcast_patient_update(hospital_id, 'add', patient_data)
            
            # Also update the graph data in real-time
            socketio.emit('graph_update', {
                'hospital_id': hospital_id,
                'timestamp': datetime.now().isoformat()
            }, room=hospital_id)
        
        return jsonify({
            "status": "success",
            "message": "Patient added successfully",
            "patient": patient_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/sync-patients', methods=['GET'])
def sync_patients():
    try:
        hospital_id = request.args.get('hospital_id')
        patients = get_current_patients(hospital_id)
        return jsonify({
            "status": "success",
            "patients": patients,
            "count": len(patients)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('register')
def handle_register(data):
    hospital_id = data.get('hospital_id')
    if hospital_id:
        hospital_connections[hospital_id].add(request.sid)
        print(f"User registered for hospital {hospital_id}")
        # Send current patient list on registration
        patients = get_current_patients(hospital_id)
        emit('initial_data', {
            'patients': patients,
            'hospital_id': hospital_id
        })

@socketio.on('request_update')
def handle_request_update(data):
    hospital_id = data.get('hospital_id')
    if hospital_id and hospital_id in hospital_connections:
        patients = get_current_patients(hospital_id)
        emit('data_update', {
            'patients': patients,
            'hospital_id': hospital_id
        }, room=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    for hospital_id, sockets in hospital_connections.items():
        if request.sid in sockets:
            sockets.remove(request.sid)
            print(f"User disconnected from hospital {hospital_id}")
            break

if __name__ == '__main__':
    socketio.run(app, port=5001, debug=True)