import pandas as pd

# Using a raw string for the file path
data = pd.read_csv(r'C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\pat.csv')

current_patients = data[data['Leave_Date'].isnull() & data['Leave_Time'].isnull()]

# Saving the result to 'list.csv'
current_patients.to_csv('list.csv', index=True)

print(current_patients)
