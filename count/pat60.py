from flask import Flask, jsonify
import pandas as pd
from datetime import datetime, timedelta
import threading
import time

app = Flask(__name__)

# Global variable to store graph data
graph_data = {
    "hours": [],
    "patient_counts": [],
    "date_today": ""
}

# Function to update graph data
def update_graph_data():
    global graph_data
    while True:
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

        # Update global graph data
        graph_data = {
            "hours": hours,
            "patient_counts": patient_counts,
            "date_today": str(date_today)
        }

        # Wait for 5 seconds before the next update
        time.sleep(5)

# Start the background thread
thread = threading.Thread(target=update_graph_data)
thread.daemon = True
thread.start()

# API endpoint to serve graph data
@app.route('/graph-data', methods=['GET'])
def get_graph_data():
    return jsonify(graph_data)


# Run the Flask app
if __name__ == '__main__':
    app.run(port=5001)