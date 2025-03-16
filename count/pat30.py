import pandas as pd
import matplotlib.pyplot as plt
import time
from datetime import datetime, timedelta

def update_graph():
    plt.ion()  # Turn on interactive mode for live updating

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
        current_time = now.hour * 60 + now.minute  # Convert current time to minutes (since 00:00)

        # Step 1: Get initial patient count at 12 AM (previous day's patients still admitted)
        prev_day_entries = df[df["Entry_Datetime"].dt.date == date_today - timedelta(days=1)]  # Yesterday's entries
        prev_day_leaves = df[df["Leave_Datetime"].dt.date == date_today - timedelta(days=1)]  # Yesterday's leaves

        # Calculate patients still admitted at 12 AM
        prevc = len(prev_day_entries) - len(prev_day_leaves[prev_day_leaves["Leave_Datetime"].dt.hour < 24])

        # Step 2: Get today's patient entries and exits
        today_entries = df[df["Entry_Datetime"].dt.date == date_today]  # Patients entering today
        today_leaves = df[df["Leave_Datetime"].dt.date == date_today]  # Patients leaving today

        # Step 3: Compute patient count every 30 minutes
        time_intervals = list(range(0, 1441, 30))  # Minutes from 0 to 1440 (24 hours) in 30-minute intervals
        patient_counts = [prevc]  # Store initial count at 12 AM

        for minute in time_intervals[1:]:  # Skip the first interval (00:00)
            # Count new entries from last interval to this interval
            entry_count = today_entries[
                (today_entries["Entry_Datetime"].dt.hour * 60 + today_entries["Entry_Datetime"].dt.minute >= minute - 30) &
                (today_entries["Entry_Datetime"].dt.hour * 60 + today_entries["Entry_Datetime"].dt.minute < minute)
            ].shape[0]

            # Count leaves from last interval to this interval
            leave_count = today_leaves[
                (today_leaves["Leave_Datetime"].dt.hour * 60 + today_leaves["Leave_Datetime"].dt.minute >= minute - 30) &
                (today_leaves["Leave_Datetime"].dt.hour * 60 + today_leaves["Leave_Datetime"].dt.minute < minute)
            ].shape[0]

            # Update patient count
            prevc += entry_count - leave_count
            patient_counts.append(prevc)

        # Convert minutes to time labels for the X-axis (HH:MM format)
        time_labels = [f"{t//60:02d}:{t%60:02d}" for t in time_intervals]

        # Step 4: Plot the graph
        plt.clf()  # Clear the previous plot
        plt.plot(time_labels, patient_counts, linestyle="-", color="b", linewidth=2, marker="o", markersize=5)  # Consistent thickness

        # Labels and title
        plt.xlabel("Time (HH:MM)", fontsize=12)
        plt.ylabel("Number of Patients", fontsize=12)
        plt.title(f"Patient Count Over Time - {date_today}", fontsize=14)

        # Ensure Y-axis has whole numbers (with a max of 20 for readability)
        plt.yticks(range(0, max(max(patient_counts), 20) + 1))

        # X-axis: Show every 1-hour interval for readability
        plt.xticks(time_labels[::2], rotation=90)

        # Grid for better readability
        plt.grid(True, linestyle="--", alpha=0.5)

        plt.draw()  # Redraw the updated plot
        plt.pause(3)  # Pause for 3 seconds before the next update

# Run the function
update_graph()
