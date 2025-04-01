import csv
import os
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
from tempfile import NamedTemporaryFile
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class CSVProcessor:
    def __init__(self):
        # MongoDB configuration
        self.db_uri = 'mongodb+srv://shaheem2:Er9RHzQvT2Lhedzi@smart-er.s39qc.mongodb.net/smart-er?retryWrites=true&w=majority&appName=smart-er'
        self.db_name = 'smart-er'
        self.collection_name = 'patients'
        self.client = None
        self.collection = None
        
        # File processing
        self.csv_file = 'pat.csv'
        self.processing = False
        self.last_processed_time = None
        self.current_batch_start = None
        
        # Statistics
        self.total_inserted = 0
        self.total_skipped = 0
        self.total_batches = 0
        
        self.connect_mongodb()
        
    def connect_mongodb(self):
        try:
            self.client = MongoClient(
                self.db_uri,
                connectTimeoutMS=30000,
                socketTimeoutMS=None,
                connect=False,
                maxPoolSize=1
            )
            self.collection = self.client[self.db_name][self.collection_name]
            self.client.admin.command('ping')
            print("Successfully connected to MongoDB")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def process_file(self):
        if self.processing:
            return
            
        self.processing = True
        self.current_batch_start = datetime.now()
        batch_end_time = self.current_batch_start + timedelta(hours=24)
        
        try:
            # Create temporary file for non-discharged patients
            temp_file = NamedTemporaryFile(mode='w', delete=False, newline='')
            temp_file_path = temp_file.name
            
            with open(self.csv_file, 'r') as infile, temp_file:
                reader = csv.DictReader(infile)
                writer = csv.DictWriter(temp_file, fieldnames=reader.fieldnames)
                writer.writeheader()
                
                # Count total rows for progress
                infile.seek(0)
                total_rows = sum(1 for _ in csv.DictReader(infile))
                infile.seek(0)
                reader = csv.DictReader(infile)
                
                print(f"\nStarting new processing batch at {datetime.now()}")
                print(f"Total records in CSV: {total_rows}")
                
                batch_inserted = 0
                batch_skipped = 0
                
                for row in reader:
                    if datetime.now() >= batch_end_time:
                        print("Batch time limit reached, pausing until next batch")
                        break
                        
                    # Process discharged patients
                    if row.get('Leave_Date') and row.get('Leave_Time'):
                        try:
                            processed_row = {k: v if v != '' else None for k, v in row.items()}
                            self.collection.insert_one(processed_row)
                            batch_inserted += 1
                            self.total_inserted += 1
                        except Exception as e:
                            print(f"Error inserting document: {str(e)}")
                            writer.writerow(row)  # Keep problematic records
                            batch_skipped += 1
                    else:
                        writer.writerow(row)
                        batch_skipped += 1
                        self.total_skipped += 1
                    
                    # Print progress periodically
                    processed = batch_inserted + batch_skipped
                    if processed % 100 == 0 or processed == total_rows:
                        progress = processed / total_rows * 100
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] Processed {processed}/{total_rows} "
                              f"({progress:.1f}%) | Batch: +{batch_inserted}")
                    
                    # Dynamic sleep to spread processing
                    time_elapsed = (datetime.now() - self.current_batch_start).total_seconds()
                    remaining_time = max(0, (24 * 3600) - time_elapsed)
                    if remaining_time > 0 and processed < total_rows:
                        sleep_time = remaining_time / (total_rows - processed)
                        sleep_time = min(sleep_time, 5)  # Cap at 5 seconds
                        time.sleep(sleep_time)
                
                # Update file only if we processed all records
                if (batch_inserted + batch_skipped) >= total_rows:
                    # Backup and replace original file
                    backup_file = f"{self.csv_file}.bak.{datetime.now().strftime('%Y%m%d%H%M%S')}"
                    os.replace(self.csv_file, backup_file)
                    os.replace(temp_file_path, self.csv_file)
                    print(f"Batch completed. Original file backed up as {backup_file}")
                else:
                    os.unlink(temp_file_path)
                
                self.total_batches += 1
                print(f"Batch summary - Inserted: {batch_inserted}, Skipped: {batch_skipped}")
                print(f"Totals since start - Batches: {self.total_batches}, "
                      f"Inserted: {self.total_inserted}, Skipped: {self.total_skipped}")
                
        except Exception as e:
            print(f"Error during processing: {str(e)}")
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        finally:
            self.processing = False
            self.last_processed_time = datetime.now()

class CSVHandler(FileSystemEventHandler):
    def __init__(self, processor):
        self.processor = processor
    
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.csv'):
            print(f"\nDetected change in CSV file at {datetime.now()}")
            self.processor.process_file()

def main():
    processor = CSVProcessor()
    
    # Initial processing
    processor.process_file()
    
    # Set up file monitoring
    event_handler = CSVHandler(processor)
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()
    
    print("\nMonitoring for CSV file changes...")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            # Periodic processing in case watchdog misses events
            if not processor.processing and (processor.last_processed_time is None or 
                                           (datetime.now() - processor.last_processed_time) > timedelta(hours=24)):
                processor.process_file()
            time.sleep(60)
    except KeyboardInterrupt:
        observer.stop()
        print("\nStopping monitor...")
    
    observer.join()
    if processor.client:
        processor.client.close()

if __name__ == "__main__":
    main()