import csv
import os
import time
import shutil
import paramiko
from datetime import datetime, timedelta
from pymongo import MongoClient
from tempfile import NamedTemporaryFile

class DischargedPatientProcessor:
    def __init__(self):
        # Configuration
        self.csv_file = 'pat.csv'
        self.local_backup_dir = 'csv_backups'
        self.remote_backup_dir = '/remote/backup/path'  # Update this
        
        # MongoDB Setup
        self.db_uri = 'mongodb+srv://shaheem2:Er9RHzQvT2Lhedzi@smart-er.s39qc.mongodb.net/smart-er?retryWrites=true&w=majority&appName=smart-er'
        self.db_name = 'smart-er'
        self.collection_name = 'patients'
        
        # SFTP Setup (Update these)
        self.sftp_host = 'your.backup.server'
        self.sftp_username = 'username'
        self.sftp_password = 'password'
        self.sftp_port = 22
        
        # State tracking
        self.last_backup_time = None
        self.last_processing_time = None
        self.processed_count = 0
        self.deleted_count = 0
        
        self.initialize()

    def initialize(self):
        """Initialize directories and connections"""
        os.makedirs(self.local_backup_dir, exist_ok=True)
        self.mongo_client = MongoClient(self.db_uri)
        self.collection = self.mongo_client[self.db_name][self.collection_name]
        print("System initialized")

    def backup_to_server(self):
        """Backup CSV to remote server via SFTP"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{timestamp}.csv"
        local_path = os.path.join(self.local_backup_dir, backup_name)
        remote_path = f"{self.remote_backup_dir}/{backup_name}"
        
        try:
            # Create local backup
            shutil.copy2(self.csv_file, local_path)
            
            # SFTP transfer
            with paramiko.Transport((self.sftp_host, self.sftp_port)) as transport:
                transport.connect(username=self.sftp_username, password=self.sftp_password)
                with paramiko.SFTPClient.from_transport(transport) as sftp:
                    sftp.put(local_path, remote_path)
            
            print(f"Backup completed: {remote_path}")
            self.last_backup_time = datetime.now()
            return True
        except Exception as e:
            print(f"Backup failed: {str(e)}")
            return False

    def process_discharged_patients(self):
        """Process and remove discharged patients"""
        start_time = datetime.now()
        end_time = start_time + timedelta(hours=24)
        processed_in_batch = 0
        
        # Create temp file for non-discharged patients
        temp_file = NamedTemporaryFile(mode='w', delete=False, newline='')
        temp_path = temp_file.name
        
        try:
            with open(self.csv_file, 'r') as infile, temp_file:
                reader = csv.DictReader(infile)
                writer = csv.DictWriter(temp_file, fieldnames=reader.fieldnames)
                writer.writeheader()
                
                for row in reader:
                    if datetime.now() >= end_time:
                        print("24-hour processing window reached")
                        break
                        
                    # Check if patient is discharged
                    if row.get('leave_date') and row.get('leave_time'):
                        try:
                            # Insert to MongoDB
                            clean_row = {k: v if v != '' else None for k, v in row.items()}
                            self.collection.insert_one(clean_row)
                            self.processed_count += 1
                            processed_in_batch += 1
                            
                            # Delete from backup (if exists)
                            self.delete_from_backups(row)
                        except Exception as e:
                            print(f"Insert failed, keeping in CSV: {str(e)}")
                            writer.writerow(row)
                    else:
                        writer.writerow(row)
                    
                    # Throttle processing
                    time_elapsed = (datetime.now() - start_time).total_seconds()
                    remaining_time = max(0, (24*3600) - time_elapsed)
                    sleep_time = remaining_time / 1000  # Spread remaining processing
                    time.sleep(min(sleep_time, 5))  # Max 5 seconds sleep
                
            # Replace original file
            shutil.move(temp_path, self.csv_file)
            print(f"Processed {processed_in_batch} discharged patients in this batch")
            self.last_processing_time = datetime.now()
            return True
            
        except Exception as e:
            print(f"Processing failed: {str(e)}")
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            return False

    def delete_from_backups(self, patient_record):
        """Delete patient record from all backup files"""
        try:
            for backup_file in os.listdir(self.local_backup_dir):
                if backup_file.endswith('.csv'):
                    backup_path = os.path.join(self.local_backup_dir, backup_file)
                    self.remove_patient_from_file(backup_path, patient_record)
                    self.deleted_count += 1
        except Exception as e:
            print(f"Backup cleanup error: {str(e)}")

    def remove_patient_from_file(self, file_path, patient_to_remove):
        """Remove specific patient record from a CSV file"""
        temp_file = NamedTemporaryFile(mode='w', delete=False, newline='')
        temp_path = temp_file.name
        
        try:
            with open(file_path, 'r') as infile, temp_file:
                reader = csv.DictReader(infile)
                writer = csv.DictWriter(temp_file, fieldnames=reader.fieldnames)
                writer.writeheader()
                
                for row in reader:
                    # Only write rows that don't match the patient to remove
                    if not self.patients_match(row, patient_to_remove):
                        writer.writerow(row)
            
            # Replace original backup
            shutil.move(temp_path, file_path)
        except Exception as e:
            print(f"Error cleaning backup {file_path}: {str(e)}")
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    def patients_match(self, row1, row2):
        """Compare patient records for matching identifiers"""
        # Customize this based on your patient identifier fields
        return (row1.get('patient_id') == row2.get('patient_id') and
                row1.get('admission_date') == row2.get('admission_date'))

    def run_continuously(self):
        """Main processing loop"""
        print("Starting continuous processing...")
        
        # Initial backup
        self.backup_to_server()
        
        while True:
            try:
                # Check if 24 hours passed since last backup
                if (self.last_backup_time is None or 
                    (datetime.now() - self.last_backup_time) >= timedelta(hours=24)):
                    self.backup_to_server()
                
                # Process discharged patients
                if (self.last_processing_time is None or 
                    (datetime.now() - self.last_processing_time) >= timedelta(hours=24)):
                    self.process_discharged_patients()
                
                # Sleep before next check
                time.sleep(3600)  # Check hourly
                
            except KeyboardInterrupt:
                print("\nShutting down gracefully...")
                break
            except Exception as e:
                print(f"Unexpected error: {str(e)}")
                time.sleep(60)  # Wait before retrying
        
        self.mongo_client.close()
        print(f"Final stats - Processed: {self.processed_count}, Deleted from backups: {self.deleted_count}")

if __name__ == "__main__":
    processor = DischargedPatientProcessor()
    processor.run_continuously()