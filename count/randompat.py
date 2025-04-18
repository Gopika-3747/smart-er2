import csv
import random
from datetime import datetime, timedelta
import os

# Define possible values for each field
PATIENT_IDS = [f"P{str(i).zfill(6)}" for i in range(1, 1_000_000)]  # Generate patient IDs like P000001, P000002, ...
HOSPITAL_IDS = ["H001", "H002", "H003"]  # Example hospital IDs
URBAN_RURAL = ["Urban", "Rural"]
GENDERS = ["Male", "Female", "Other"]
AGES = list(range(1, 100))  # Age range from 1 to 99
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
TRIAGE_LEVELS = ["Critical", "High", "Medium", "Low"]
FACTORS = ["Crime", "Event", "Epidemic", "Lifestyle", "Weather", "Traffic", "Accident", "Festival"]

# Function to generate a random date and time between 2023 and 2025
def random_datetime():
    start_date = datetime(2022, 1, 1)
    end_date = datetime(2024, 12, 31)
    random_days = random.randint(0, (end_date - start_date).days)
    random_seconds = random.randint(0, 86400)  # 86400 seconds in a day
    return start_date + timedelta(days=random_days, seconds=random_seconds)

# Function to generate a random record
def generate_random_record():
    patient_id = random.choice(PATIENT_IDS)
    hospital_id = random.choice(HOSPITAL_IDS)
    urban_rural = random.choice(URBAN_RURAL)
    gender = random.choice(GENDERS)
    age = random.choice(AGES)
    blood_group = random.choice(BLOOD_GROUPS)
    triage_level = random.choice(TRIAGE_LEVELS)
    factor = random.choice(FACTORS)
    
    entry_datetime = random_datetime()
    leave_datetime = None
    if random.random() > 0.5:  # 50% chance of having a leave date/time
        leave_datetime = entry_datetime + timedelta(days=random.randint(1, 10), hours=random.randint(1, 24))
    
    # Format dates and times
    entry_date = entry_datetime.strftime("%Y-%m-%d")
    entry_time = entry_datetime.strftime("%H:%M")
    leave_date = leave_datetime.strftime("%Y-%m-%d") if leave_datetime else "NULL"
    leave_time = leave_datetime.strftime("%H:%M:%S") if leave_datetime else "NULL"
    
    return [
        patient_id, hospital_id, urban_rural, gender, age, blood_group,
        triage_level, factor, entry_date, entry_time, leave_date, leave_time
    ]

# Main function to generate and write records to CSV
def generate_csv(filename="entry.csv", num_records=100_000):
    # Ensure the directory exists
    directory = os.path.dirname(filename)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)
    
    header = [
        "Patient_ID", "Hospital_ID", "Urban_Rural", "Gender", "Age",
        "Blood_Group", "Triage_Level", "Factor", "Entry_Date", "Entry_Time",
        "Leave_Date", "Leave_Time"
    ]
    
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(header)  # Write header row
        
        # Generate and write records in batches for efficiency
        batch_size = 10_000
        for i in range(0, num_records, batch_size):
            batch = [generate_random_record() for _ in range(batch_size)]
            writer.writerows(batch)
            print(f"Generated {i + len(batch)} records...")
    
    print(f"Successfully generated {num_records} records and saved to {filename}")

# Run the script to generate 1 lakh random records
if __name__ == "__main__":
    # Specify the full path to the file
    file_path = "smart-er2/count/entry.csv"
    generate_csv(file_path, num_records=100_000)