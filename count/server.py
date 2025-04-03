import csv
import os
import time
import shutil
from datetime import datetime, timedelta
from pymongo import MongoClient
from tempfile import NamedTemporaryFile
import zipfile

class DischargedPatientProcessor:
    def __init__(self):
        # Configuration
        self.csv_file = 'pat.csv'
        self.local_backup_dir = 'csv_backups'
        
        # Field names configuration
        self.patient_id_field = 'Patient_ID'
        self.admission_date_field = 'Entry_Date'
        self.discharge_date_field = 'Leave_Date'  # Update to match your CSV
        self.discharge_time_field = 'Leave_Time'  # Update to match your CSV
        
        # MongoDB Setup
        self.db_uri = 'mongodb+srv://shaheem2:Er9RHzQvT2Lhedzi@smart-er.s39qc.mongodb.net/smart-er?retryWrites=true&w=majority&appName=smart-er'
        self.db_name = 'smart-er'
        self.collection_name = 'patients'
        
        # Backup Configuration
        self.backup_methods = ['local', 'zip']
        self.max_local_backups = 30
        
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
        
        # Validate CSV structure
        if not self.validate_csv():
            raise ValueError("CSV validation failed")
        
        print("System initialized successfully")

    def validate_csv(self):
        """Validate that CSV has required fields"""
        try:
            with open(self.csv_file, 'r') as f:
                reader = csv.DictReader(f)
                if not reader.fieldnames:
                    print("Error: CSV file is empty")
                    return False
                
                required_fields = {
                    self.patient_id_field,
                    self.admission_date_field,
                    self.discharge_date_field,
                    self.discharge_time_field
                }
                
                missing_fields = required_fields - set(reader.fieldnames)
                if missing_fields:
                    print(f"Error: CSV missing required fields: {missing_fields}")
                    return False
                    
            return True
        except Exception as e:
            print(f"CSV validation error: {str(e)}")
            return False

    def backup_data(self):
        """Handle all backup methods"""
        success = False
        
        for method in self.backup_methods:
            try:
                if method == 'local':
                    success = self.create_local_backup()
                elif method == 'zip':
                    success = self.create_zip_backup()
                
                if success:
                    print(f"Backup succeeded via {method}")
                    self.last_backup_time = datetime.now()
                    break
            except Exception as e:
                print(f"Backup method {method} failed: {str(e)}")
        
        return success

    def create_local_backup(self):
        """Simple local file backup"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{timestamp}.csv"
        backup_path = os.path.join(self.local_backup_dir, backup_name)
        
        try:
            shutil.copy2(self.csv_file, backup_path)
            self.cleanup_old_backups()
            return True
        except Exception as e:
            print(f"Local backup failed: {str(e)}")
            return False

    def create_zip_backup(self):
        """Create compressed zip archive of backups"""
        timestamp = datetime.now().strftime('%Y%m%d')
        zip_name = f"backups_{timestamp}.zip"
        zip_path = os.path.join(self.local_backup_dir, zip_name)
        
        try:
            with zipfile.ZipFile(zip_path, 'a') as zipf:
                for file in os.listdir(self.local_backup_dir):
                    if file.endswith('.csv') and not file.startswith('backups_'):
                        file_path = os.path.join(self.local_backup_dir, file)
                        zipf.write(file_path, os.path.basename(file_path))
            return True
        except Exception as e:
            print(f"Zip backup failed: {str(e)}")
            return False

    def cleanup_old_backups(self):
        """Keep only recent backups to save space"""
        try:
            backups = sorted(os.listdir(self.local_backup_dir), 
                           key=lambda x: os.path.getmtime(os.path.join(self.local_backup_dir, x)))
            
            while len(backups) > self.max_local_backups:
                oldest = backups.pop(0)
                os.remove(os.path.join(self.local_backup_dir, oldest))
        except Exception as e:
            print(f"Backup cleanup failed: {str(e)}")

    def process_discharged_patients(self):
        """Process and remove discharged patients with robust null handling"""
        start_time = datetime.now()
        end_time = start_time + timedelta(hours=24)
        processed_in_batch = 0
        
        print(f"Starting patient processing at {start_time}")
        
        # Create temp file for non-discharged patients
        temp_file = NamedTemporaryFile(mode='w', delete=False, newline='')
        temp_path = temp_file.name
        
        try:
            with open(self.csv_file, 'r') as infile, temp_file:
                reader = csv.DictReader(infile)
                writer = csv.DictWriter(temp_file, fieldnames=reader.fieldnames)
                writer.writeheader()
                
                for row_idx, row in enumerate(reader, 1):
                    if datetime.now() >= end_time:
                        print("24-hour processing window reached")
                        break
                    
                    # Get discharge fields
                    leave_date = row.get(self.discharge_date_field, '').strip()
                    leave_time = row.get(self.discharge_time_field, '').strip()
                    
                    # Check if patient is properly discharged (non-empty values)
                    if leave_date and leave_time:
                        try:
                            patient_id = row.get(self.patient_id_field, 'UNKNOWN')
                            print(f"Processing discharged patient #{row_idx}: {patient_id}")
                            
                            # Clean and prepare data for MongoDB
                            clean_row = {
                                k: (v if v and str(v).strip() else None)
                                for k, v in row.items()
                            }
                            
                            # Insert to MongoDB
                            self.collection.insert_one(clean_row)
                            self.processed_count += 1
                            processed_in_batch += 1
                            
                            # Delete from backup (if exists)
                            self.delete_from_backups(row)
                        except Exception as e:
                            print(f"Insert failed for patient {patient_id}, keeping in CSV: {str(e)}")
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
        return (str(row1.get(self.patient_id_field)) == str(row2.get(self.patient_id_field)) and
                str(row1.get(self.admission_date_field)) == str(row2.get(self.admission_date_field)))

    def run_continuously(self):
        """Main processing loop with improved error handling"""
        print("Starting continuous processing...")
        
        # Initial backup attempt
        if not self.backup_data():
            print("Warning: Initial backup failed")
        
        while True:
            try:
                # Check if 24 hours passed since last backup
                if (self.last_backup_time is None or 
                    (datetime.now() - self.last_backup_time) >= timedelta(hours=24)):
                    self.backup_data()
                
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
    try:
        processor = DischargedPatientProcessor()
        processor.run_continuously()
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        exit(1)