from flask import Flask, send_file, jsonify, request
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from flask_cors import CORS
import io
import os
import matplotlib
import csv
from pymongo import MongoClient
from bson import ObjectId

# MongoDB setup
client = MongoClient('mongodb+srv://shaheem2:Er9RHzQvT2Lhedzi@smart-er.s39qc.mongodb.net/smart-er?retryWrites=true&w=majority&appName=smart-er')
db = client['smart-er']
notifications_collection = db['notifications']
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)

CSV_FILE = "../pat.csv"
CSV_FILE2 = "../list.csv"
current_day_initial_count = None
last_midnight_count = None
notifications = []


if not os.path.exists("../../pat.csv"):
    with open(CSV_FILE, 'w') as f:
        f.write("Patient_ID,Hospital_ID,Urban_Rural,Gender,Age,Blood_Group,Triage_Level,Factor,Entry_Date,Entry_Time,Leave_Date,Leave_Time\n")

def generate_hourly_graph():
    global current_day_initial_count, last_midnight_count

    df = pd.read_csv(CSV_FILE)
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
        data = pd.read_csv(CSV_FILE)
        data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')
        current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]
        patients_list = current_patients.to_dict(orient='records')
        current_patients.to_csv(CSV_FILE2, index=False)
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
            print(f"Patient {patient_id} not found")  
            return jsonify({"error": "Patient not found"}), 404
        if patient.iloc[0]['Leave_Date'] != 'NULL' or patient.iloc[0]['Leave_Time'] != 'NULL':
            print(f"Patient {patient_id} is already discharged")  
            return jsonify({"error": "Patient is already discharged"}), 400

        current_time = datetime.now()
        leave_date = current_time.strftime('%Y-%m-%d')  
        leave_time = current_time.strftime('%H:%M:%S')  
        data.loc[data['Patient_ID'] == patient_id, 'Leave_Date'] = leave_date
        data.loc[data['Patient_ID'] == patient_id, 'Leave_Time'] = leave_time

        data.to_csv(CSV_FILE, index=False)
        print(f"Patient {patient_id} discharged successfully")
        notification = {
    # "hospital_id": patient.iloc[0]['Hospital_ID'],  # Remove if not needed
        "type": "discharge",
        "patient_id": patient_id,
        "message": f"Patient discharged: {patient_id}",
        "timestamp": datetime.utcnow(),
        "read": False
        }
        notifications_collection.insert_one(notification)
        return jsonify({
            "graph":"buf",
            "status": "success",
            "message": f"Patient {patient_id} discharged successfully",
            "Leave_Date": leave_date,
            "Leave_Time": leave_time,
            "notification_id": str(notification['_id'])
        }), 200
        
    except FileNotFoundError:
        print("Patient data file not found")
        return jsonify({"error": "Patient data file not found"}), 404
    except Exception as e:
        print(f"Error discharging patient: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/admitted-patients', methods=['GET'])
def get_admitted_patients():
    try:
        df = pd.read_csv(CSV_FILE)
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
        
        notification = {  # Remove if not needed
        "type": "admission",
        "patient_id": patient_data.get("Patient_ID"),
        "message": f"New patient admitted: {patient_data.get('Patient_ID')}",
        "timestamp": datetime.utcnow(),
        "read": False
        }
        notifications_collection.insert_one(notification)


        return jsonify({"status": "success", "message": "Patient added successfully","notification_id": str(notification['_id'])}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
from datetime import timedelta

import os

@app.route('/notifications', methods=['GET'])
def get_notifications():
    try:
        # Get all unread notifications without hospital ID filtering
        notifications = list(notifications_collection.find({
            "read": False
        }).sort("timestamp", -1).limit(50))
        
        # Convert ObjectId to string
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
        
        return jsonify({"notifications": notifications}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/notifications/mark-read', methods=['POST'])
def mark_notification_read():
    try:
        notification_id = request.json.get('notification_id')
        if not notification_id:
            return jsonify({"error": "notification_id is required"}), 400
        
        result = notifications_collection.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Notification not found"}), 404
        
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
