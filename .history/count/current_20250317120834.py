import pandas as pd

# Load the CSV file
data = pd.read_csv(r'C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\pat.csv')

# Replace NaN (empty) values with "NULL" for Leave_Date and Leave_Time
data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')

current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]


current_patients.to_csv(r'C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\list.csv', index=False)

print(current_patients)
