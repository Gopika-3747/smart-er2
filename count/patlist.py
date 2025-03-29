from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/list', methods=['GET'])
def list_patients():  # Changed from 'list' to avoid shadowing built-in
    try:
        data = pd.read_csv("pat.csv")
        
        # Fill NaN values
        data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')
        
        # Get current patients
        current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]
        
        # Convert to dictionary for JSON response
        patients_list = current_patients.to_dict(orient='records')
        
        # Save to CSV
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

if __name__ == '__main__':
    app.run(port=5004, debug=True)  # Added debug for development