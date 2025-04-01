from flask import Flask, send_file, jsonify, request
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from flask_cors import CORS
import io
import os

# Set the Matplotlib backend to 'Agg'
import matplotlib
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)  # Allow all origins

CSV_FILE = "pat.csv"
if not os.path.exists("pat.csv"):
    with open("pat.csv", 'w') as f:
        f.write("Patient_ID,Hospital_ID,Urban_Rural,Gender,Age,Blood_Group,Triage_Level,Factor,Entry_Date,Entry_Time,Leave_Date,Leave_Time\n")

# ---------------------- Graph Generation Endpoint (Original port 5003) ----------------------
def generate_hourly_graph():
    # Load dataset
    df = pd.read_csv("pat.csv")

    # Replace 'NULL' values with NaN
    df.replace("NULL", pd.NA, inplace=True)

    # Convert date and time columns to datetime
    df["Entry_Datetime"] = pd.to_datetime(df["Entry_Date"] + " " + df["Entry_Time"], errors="coerce")
    df["Leave_Datetime"] = pd.to_datetime(df["Leave_Date"] + " " + df["Leave_Time"], errors="coerce")

    # Get current date and time
    now = datetime.now()
    date_today = now.date()
    current_hour = now.hour

    # Step 1: Get initial patient count at 12 AM (previous day's patients still admitted)
    prev_day_entries = df[df["Entry_Datetime"].dt.date == date_today - timedelta(days=1)]  # Yesterday's entries
    prev_day_leaves = df[df["Leave_Datetime"].dt.date == date_today - timedelta(days=1)]  # Yesterday's leaves before 12 AM

    # Calculate patients still admitted at 12 AM
    prevc = len(prev_day_entries) - len(prev_day_leaves[prev_day_leaves["Leave_Datetime"].dt.hour < 24])

    # Step 2: Get today's patient entries and exits
    today_entries = df[df["Entry_Datetime"].dt.date == date_today]  # Patients entering today
    today_leaves = df[df["Leave_Datetime"].dt.date == date_today]  # Patients leaving today

    # Step 3: Compute patient count hour by hour
    hours = list(range(0, 25))  # Full day from 0 to 24
    patient_counts = [prevc]  # Store initial count at 12 AM

    for hour in range(1, current_hour + 1):
        # Count new entries from last hour to current hour
        entry_count = today_entries[(today_entries["Entry_Datetime"].dt.hour >= hour - 1) & 
                                    (today_entries["Entry_Datetime"].dt.hour < hour)].shape[0]

        # Count leaves from last hour to current hour
        leave_count = today_leaves[(today_leaves["Leave_Datetime"].dt.hour >= hour - 1) & 
                                   (today_leaves["Leave_Datetime"].dt.hour < hour)].shape[0]

        # Update patient count
        prevc += entry_count - leave_count
        patient_counts.append(prevc)

    # Fill remaining hours till 24 with the last patient count
    while len(patient_counts) < 25:
        patient_counts.append(prevc)

    # Step 4: Plot the graph
    plt.clf()  # Clear previous plot
    plt.figure(figsize=(12, 5))
    plt.plot(hours, patient_counts, linestyle="-", color="b", linewidth=2, marker="o", markersize=5)  # Consistent thickness

    # Labels and title
    plt.xlabel("Time (Hours)", fontsize=12)
    plt.ylabel("Number of Patients", fontsize=12)
    plt.title(f"Patient Count Over Time - {date_today}", fontsize=14)

    # Ensure Y-axis has whole numbers (with a max of 20 for readability)
    plt.yticks(range(0, max(max(patient_counts), 20) + 1)) 

    # Ensure X-axis shows full hours only (0 to 24)
    plt.xticks(hours)

    # Grid for better readability
    plt.grid(True, linestyle="--", alpha=0.5)

    # Save the plot to a BytesIO object
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()

    return buf

@app.route('/graph')
def get_graph():
    # Generate the graph and return it as an image response
    buf = generate_hourly_graph()
    return send_file(buf, mimetype='image/png')

# ---------------------- Patient Management Endpoints (Original port 5004) ----------------------
@app.route('/list', methods=['GET'])
def list_patients():
    try:
        # Read the CSV file
        data = pd.read_csv("pat.csv")
        
        # Fill NaN values for Leave_Date and Leave_Time with 'NULL'
        data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')
        
        # Filter for current patients (those with Leave_Date and Leave_Time as 'NULL')
        current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]
        
        # Convert to dictionary for JSON response
        patients_list = current_patients.to_dict(orient='records')
        
        # Save the filtered data to a separate CSV file
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
        # Read the CSV file
        data = pd.read_csv("pat.csv")
        
        # Fill NaN values for Leave_Date and Leave_Time with 'NULL'
        data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')
        
        # Check if the patient exists and is currently admitted
        patient = data[data['Patient_ID'] == patient_id]  # Compare as string
        if patient.empty:
            print(f"Patient {patient_id} not found")  # Debugging log
            return jsonify({"error": "Patient not found"}), 404
        
        if patient.iloc[0]['Leave_Date'] != 'NULL' or patient.iloc[0]['Leave_Time'] != 'NULL':
            print(f"Patient {patient_id} is already discharged")  # Debugging log
            return jsonify({"error": "Patient is already discharged"}), 400
        
        # Update Leave_Date and Leave_Time for the patient
        current_time = datetime.now()
        leave_date = current_time.strftime('%Y-%m-%d')  # Format: YYYY-MM-DD
        leave_time = current_time.strftime('%H:%M:%S')  # Format: HH:MM:SS
        
        data.loc[data['Patient_ID'] == patient_id, 'Leave_Date'] = leave_date
        data.loc[data['Patient_ID'] == patient_id, 'Leave_Time'] = leave_time
        
        # Save the updated data back to the CSV file
        data.to_csv("pat.csv", index=False)
        
        print(f"Patient {patient_id} discharged successfully")  # Debugging log
        return jsonify({
            "status": "success",
            "message": f"Patient {patient_id} discharged successfully",
            "Leave_Date": leave_date,
            "Leave_Time": leave_time
        }), 200
    
    except FileNotFoundError:
        print("Patient data file not found")  # Debugging log
        return jsonify({"error": "Patient data file not found"}), 404
    except Exception as e:
        print(f"Error discharging patient: {str(e)}")  # Debugging log
        return jsonify({"error": str(e)}), 500

# ---------------------- Admitted Patients Count Endpoint (Original port 5002) ----------------------
@app.route('/admitted-patients', methods=['GET'])
def get_admitted_patients():
    try:
        # Load the CSV file
        df = pd.read_csv("pat.csv")

        # Replace 'NULL' with NaN for easier filtering
        df.replace("NULL", pd.NA, inplace=True)

        # Filter patients who are still admitted
        admitted_patients = df[df["Leave_Date"].isna() & df["Leave_Time"].isna()]

        # Get the number of admitted patients
        num_admitted_patients = admitted_patients.shape[0]

        # Return the result as JSON
        return jsonify({"num_admitted_patients": num_admitted_patients})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/add-patient', methods=['POST'])
def add_patient():
    try:
        # Get data from request
        patient_data = request.json
        
        # Create a DataFrame from the new patient data
        new_patient_df = pd.DataFrame([patient_data])
        
        # Append to existing CSV
        new_patient_df.to_csv("pat.csv", mode='a', header=False, index=False)
        
        return jsonify({"status": "success", "message": "Patient added successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)  # You can choose any port you prefer