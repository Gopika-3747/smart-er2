from flask import Flask, send_file
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from flask_cors import CORS
  # Allow all origins
import io

# Set the Matplotlib backend to 'Agg'
import matplotlib
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)
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

if __name__ == '__main__':
    app.run(port=5003)