import pandas as pd

# Correcting the file path with escaped backslashes
data = pd.read_csv('C:\\Users\\g4gam\\OneDrive\\Desktop\\smarter2\\smart-er2\\count\\pat.csv')

current_patients = data[data['Leave_Date'].isnull() & data['Leave_Time'].isnull()]

# Saving the result to 'list.csv'
current_patients.to_csv('C:\\Users\\g4gam\\OneDrive\\Desktop\\smarter2\\smart-er2\\count\\list.csv', index=True)

print(current_patients)
