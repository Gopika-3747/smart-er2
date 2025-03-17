import pandas as pd


data = pd.read_csv('patients.csv')

# Filter patients whose leave date and time are NULL
current_patients = data[data['Leave_Date'].isnull() & data['Leave_Time'].isnull()]

# Save the result to list.csv including the index
current_patients.to_csv('list.csv', index=True)

# Display the result (optional)
print(current_patients)
