import pandas as pd

data = pd.read_csv('C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\pat.csv')

current_patients = data[data['Leave_Date'].isnull() & data['Leave_Time'].isnull()]

current_patients.to_csv('list.csv', index=True)

print(current_patients)
