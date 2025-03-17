import pandas as pd

data = pd.read_csv('patients.csv')

current_patients = data[data['Leave_Date'].isnull() & data['Leave_Time'].isnull()]

current_patients.to_csv('list.csv', index=True)

# Display the result (optional)
print(current_patients)
