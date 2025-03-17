import pandas as pd

data = pd.read_csv(r'C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\pat.csv')

data[['Leave_Date', 'Leave_Time']] = data[['Leave_Date', 'Leave_Time']].fillna('NULL')

current_patients = data[(data['Leave_Date'] == 'NULL') & (data['Leave_Time'] == 'NULL')]


current_patients.to_csv(r'C:\Users\g4gam\OneDrive\Desktop\smarter2\smart-er2\count\list.csv', index=False)

print(current_patients)
