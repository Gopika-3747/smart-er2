from flask import Flask, send_file, jsonify, request
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')  
from matplotlib import pyplot as plt
import matplotlib.pyplot as plt
from calendar import monthrange
import datetime
from flask_cors import CORS
import io
import seaborn as sns
sns.set_theme()  # Better default styles

app = Flask(__name__)
CORS(app)

def predict_graph(month):
    """Generate a prediction graph for the given month."""
    try:
        model = joblib.load('model.pkl')
        model_columns = joblib.load('model_columns.pkl')

        # Validate month
        month = int(month)
        if month < 1 or month > 12:
            raise ValueError("Month must be between 1 and 12")

        days_in_month = monthrange(2025, month)[1]

        # Prepare input data for each day
        data = []
        for day in range(1, days_in_month + 1):
            weekday = datetime.date(2025, month, day).weekday()
            entry = {
                'Entry_Day': day,
                'Entry_Month': month,
                'Entry_Weekday': weekday,
            }
            data.append(entry)

        df = pd.DataFrame(data)

        # Add missing columns (if any)
        for col in model_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[model_columns]

        # Predict
        predicted = model.predict(df)

        # Plot
        plt.figure(figsize=(10, 5))
        plt.plot(range(1, days_in_month + 1), predicted, marker='o', linestyle='-', color='skyblue')
        plt.title(f'Predicted Daily ER Patient Count - Month {month:02d}')
        plt.xlabel('Day of Month')
        plt.ylabel('Predicted Patient Count')
        plt.xticks(range(1, days_in_month + 1))
        plt.grid(True)

        # Save plot to a BytesIO buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()

        return buf

    except Exception as e:
        print(f"Error generating graph: {e}")
        return None

@app.route('/predict-graph')
def get_graph():
    """API endpoint to fetch the prediction graph."""
    import matplotlib
    matplotlib.use('Agg')  # Set non-interactive backend before importing pyplot
    from matplotlib import pyplot as plt
    
    month = request.args.get('month', default=datetime.datetime.now().month, type=int)
    buf = predict_graph(month)
    
    if buf is None:
        return jsonify({"error": "Failed to generate graph. Check logs."}), 500
    
    # Close the figure explicitly to prevent memory leaks
    plt.close('all')
    return send_file(buf, mimetype='image/png')
if __name__ == '__main__':
    app.run(port=5005, debug=True)