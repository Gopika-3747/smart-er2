from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Route to list current patients
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


# Route to discharge a patient
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

if __name__ == '__main__':
    app.run(port=5004, debug=True)  # Added debug for development