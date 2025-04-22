import os
import time
import pandas as pd
from flask import Flask, request
from flask_socketio import SocketIO, emit
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store connected clients and their hospital IDs
connected_clients = {}

# Path to your CSV file
CSV_FILE = '../pat.csv'
last_modified = 0

class CSVFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        global last_modified
        if event.src_path.endswith('../pat.csv'):
            current_modified = os.path.getmtime(CSV_FILE)
            if current_modified != last_modified:
                last_modified = current_modified
                process_csv_update()

def process_csv_update():
    try:
        df = pd.read_csv(CSV_FILE)
        print("CSV file updated. Broadcasting changes...")
        
        # Group by Hospital_ID and send updates to relevant clients
        for hospital_id, group in df.groupby('Hospital_ID'):
            hospital_data = group.to_dict('records')
            socketio.emit('patient_update', {
                'hospital_id': hospital_id,
                'patients': hospital_data
            }, room=hospital_id)
            
    except Exception as e:
        print(f"Error processing CSV update: {e}")

@socketio.on('connect')
def handle_connect():
    hospital_id = request.args.get('hospital_id')
    if hospital_id:
        connected_clients[request.sid] = hospital_id
        socketio.enter_room(request.sid, hospital_id)
        print(f"Client {request.sid} connected for hospital {hospital_id}")

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in connected_clients:
        hospital_id = connected_clients.pop(request.sid)
        socketio.leave_room(request.sid, hospital_id)
        print(f"Client {request.sid} disconnected from hospital {hospital_id}")

def start_file_watcher():
    event_handler = CSVFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()
    print("File watcher started")
    return observer

if __name__ == '__main__':
    # Initial CSV read
    last_modified = os.path.getmtime(CSV_FILE) if os.path.exists(CSV_FILE) else 0
    
    # Start file watcher
    observer = start_file_watcher()
    
    try:
        socketio.run(app, port=5002, debug=True)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()