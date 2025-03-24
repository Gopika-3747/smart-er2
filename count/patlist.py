from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/list',methods=['GET'])
def list():
  data = pd.read_csv("pat.csv")

  data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')

  current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]

  current_patients.to_csv("list.csv", index=False)
  try:
    return jsonify({"current_patients": current_patients})
  except Exception as e:
    return jsonify({"error":str(e)}),500
if __name__ == '__main__':
  app.run(port=5004)