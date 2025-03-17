import pandas as pd

# Load the CSV data
data = pd.read_csv(r'C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\pat.csv')

# Replace empty values with NULL for correct filtering
data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')

# Filter patients whose leave date and time are NULL
current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]

# Save the result to list.csv including index
current_patients.to_csv('list.csv', index=True)

# Display the result
print(current_patients)
