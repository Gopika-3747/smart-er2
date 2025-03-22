from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

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
@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello from Flask!"})
if __name__ == '__main__':
    app.run(port=5002)  