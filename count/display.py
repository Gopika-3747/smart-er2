import pandas as pd
import joblib
import matplotlib.pyplot as plt
from calendar import monthrange
import datetime

# Load the trained model and column list
model = joblib.load('smart-er2/count/model.pkl')
model_columns = joblib.load('smart-er2/count/model_columns.pkl')

# --- Step 1: User Input ---
month = int(input("Enter the month (1-12): "))
days_in_month = monthrange(2025, month)[1]  # Use current year for consistency

# --- Step 2: Prepare input data for each day ---
data = []
for day in range(1, days_in_month + 1):
    weekday = datetime.date(2025, month, day).weekday()  # Real weekday calculation without dummy year
    entry = {
        'Entry_Day': day,
        'Entry_Month': month,
        'Entry_Weekday': weekday,
    }
    data.append(entry)

df = pd.DataFrame(data)

# --- Step 3: Add missing columns to match the training model ---
for col in model_columns:
    if col not in df.columns:
        df[col] = 0  # Fill missing expected columns with 0

# Reorder columns to match training data
df = df[model_columns]

# --- Step 4: Predict ---
predicted = model.predict(df)

# --- Step 5: Plot the graph ---
plt.figure(figsize=(10, 5))
plt.plot(range(1, days_in_month + 1), predicted, marker='o', linestyle='-', color='skyblue')
plt.title(f'Predicted Daily ER Patient Count - Month {month:02d}')
plt.xlabel('Day of Month')
plt.ylabel('Predicted Patient Count')
plt.xticks(range(1, days_in_month + 1))
plt.grid(True)
plt.tight_layout()
plt.show()
