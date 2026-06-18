# F1 AI/ML Analytics — Bahrain GP 2024
## Live Race Animation + ML Dashboard

### Project Structure
```
f1-aiml-analysis/
├── web_app.py              ← Flask backend (entry point)
├── race_data.csv           ← Your FastF1 data (place here)
├── requirements.txt
│
├── templates/
│   └── index.html          ← Main UI
│
├── static/
│   ├── style.css
│   └── script.js
│
├── plots/                  ← Your existing PNG plots
│   ├── lap_distribution.png
│   ├── compound_boxplot.png
│   ├── sector_comparison.png
│   ├── speed_correlation.png
│   ├── predicted_vs_actual.png
│   ├── feature_importance.png
│   └── anomaly_detection.png
│
└── f1_analysis.py          ← Your existing ML pipeline
```

### Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Make sure race_data.csv is in the root folder

# 3. Run the app
python web_app.py

# 4. Open browser
# http://localhost:5000
```

### Expected race_data.csv columns
The backend auto-detects column names. It works best with:
- `Driver` or `Abbreviation` — driver identifier
- `LapNumber` — lap number (int)
- `LapTime` — lap time (timedelta string like "0:01:34.123" or float seconds)
- `Compound` — tyre compound (SOFT/MEDIUM/HARD)
- `Sector1Time`, `Sector2Time`, `Sector3Time` — optional sector times

### Features
| Tab | What you get |
|-----|-------------|
| 🏎 Race Animation | Animated Bahrain circuit with real lap-by-lap car positions driven from your CSV |
| 📡 Telemetry | Lap time traces for all drivers, tyre compound comparison, sector chart |
| 🤖 AI/ML | R²=0.98 metrics, feature importance bar chart, predicted winner & ranking |
| ⚠️ Anomalies | Per-driver anomalous laps (median + 2σ threshold), scatter + log table |

### ML Metrics (pre-computed from your pipeline)
- MAE  ≈ 0.33 s
- RMSE ≈ 0.49 s
- R²   ≈ 0.98

To update metrics dynamically, save them to a `ml_results.json` file and
point the `/api/ml_metrics` endpoint at it.
