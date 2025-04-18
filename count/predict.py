import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

# Step 1: Load dataset
df = pd.read_csv('smart-er2/count/entry.csv')

# Clean up column names (strip spaces if any)
df.columns = df.columns.str.strip()

# Step 2: Convert Entry_Date and Leave_Date to datetime
df['Entry_Date'] = pd.to_datetime(df['Entry_Date'], errors='coerce')
df['Leave_Date'] = pd.to_datetime(df['Leave_Date'], errors='coerce')

# Step 3: Drop rows with missing Entry_Date
df = df.dropna(subset=['Entry_Date'])

# Step 4: Create date-based features
df['Entry_Day'] = df['Entry_Date'].dt.day
df['Entry_Month'] = df['Entry_Date'].dt.month
df['Entry_Weekday'] = df['Entry_Date'].dt.weekday

# Step 5: Get daily patient counts
daily_patients = df.groupby(['Entry_Date']).size().reset_index(name='patient_count')

# Step 6: Merge daily counts back to original
df = df.merge(daily_patients, on='Entry_Date', how='left')

# Step 7: Drop unnecessary columns
df = df.drop(['Patient_ID', 'Hospital_ID', 'Entry_Date', 'Leave_Date', 'Entry_Time', 'Leave_Time'], axis=1)

# Step 8: One-hot encode categorical variables
df = pd.get_dummies(df)

# Step 9: Separate features and target
X = df.drop('patient_count', axis=1)
y = df['patient_count']

# ✅ Save the feature names for later use in prediction
joblib.dump(X.columns.tolist(), 'smart-er2/count/model_columns.pkl')

# Step 10: Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 11: Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Step 12: Predict and evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

# Step 13: Save model
joblib.dump(model, 'smart-er2/count/model.pkl')

# Step 14: Print results
print(f"✅ Model saved successfully.")
print(f"📊 Mean Squared Error: {mse}")
print(f"📊 RMSE: {rmse}")
print(f"📊 R² Score: {r2}")
