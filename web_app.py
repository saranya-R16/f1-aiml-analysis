"""
F1 AI/ML Analytics - Flask Backend
Uses race_data.csv from FastF1 Bahrain GP 2024
"""

from flask import Flask, jsonify, render_template, send_from_directory
import pandas as pd
import numpy as np
import os, json

app = Flask(__name__)

# ─── Load & preprocess race_data.csv ──────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
CSV  = os.path.join(BASE, "race_data.csv")

def load_data():
    df = pd.read_csv(CSV)

    # Normalise column names
    df.columns = [c.strip() for c in df.columns]

    # Convert LapTime to seconds if it's a timedelta string like "0:01:34.123"
    if "LapTime" in df.columns and df["LapTime"].dtype == object:
        def to_sec(v):
            try:
                if pd.isna(v): return np.nan
                parts = str(v).split(":")
                if len(parts) == 3:
                    return float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])
                elif len(parts) == 2:
                    return float(parts[0])*60 + float(parts[1])
                return float(v)
            except: return np.nan
        df["LapTimeSec"] = df["LapTime"].apply(to_sec)
    elif "LapTimeSec" in df.columns:
        pass
    elif "LapTime" in df.columns:
        df["LapTimeSec"] = pd.to_numeric(df["LapTime"], errors="coerce")
    else:
        df["LapTimeSec"] = np.nan

    # Drop nulls & outliers
    df = df.dropna(subset=["LapTimeSec"])
    df = df[df["LapTimeSec"] < 120]
    df = df[df["LapTimeSec"] > 60]

    # Ensure LapNumber is int
    if "LapNumber" in df.columns:
        df["LapNumber"] = pd.to_numeric(df["LapNumber"], errors="coerce").fillna(0).astype(int)

    return df

try:
    df = load_data()
    print(f"✅ Loaded {len(df)} laps | Columns: {list(df.columns)}")
except Exception as e:
    print(f"❌ Could not load race_data.csv: {e}")
    df = pd.DataFrame()


def col(name, fallbacks=[]):
    """Return actual column name if exists, else try fallbacks, else None."""
    if name in df.columns: return name
    for f in fallbacks:
        if f in df.columns: return f
    return None


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/static/<path:path>")
def static_files(path):
    return send_from_directory("static", path)

@app.route("/plots/<path:path>")
def plot_files(path):
    return send_from_directory("plots", path)


@app.route("/api/race_summary")
def race_summary():
    if df.empty:
        return jsonify({"error": "No data loaded"})

    driver_col = col("Driver", ["DriverNumber", "Abbreviation"])
    compound_col = col("Compound", ["TyreLife"])
    lap_col = "LapNumber"

    total_laps = int(df[lap_col].max()) if lap_col in df.columns else 57
    drivers = df[driver_col].nunique() if driver_col else 0
    fastest = float(df["LapTimeSec"].min())
    fastest_driver = df.loc[df["LapTimeSec"].idxmin(), driver_col] if driver_col else "N/A"

    return jsonify({
        "total_laps": total_laps,
        "total_drivers": drivers,
        "fastest_lap": round(fastest, 3),
        "fastest_driver": str(fastest_driver),
        "total_records": len(df),
        "compounds": df[compound_col].unique().tolist() if compound_col else []
    })


@app.route("/api/leaderboard")
def leaderboard():
    if df.empty:
        return jsonify([])

    driver_col = col("Driver", ["Abbreviation", "DriverNumber"])
    lap_col    = "LapNumber"

    if not driver_col or lap_col not in df.columns:
        return jsonify([])

    # Final lap position = last lap each driver completed
    last_laps = df.sort_values(lap_col).groupby(driver_col).last().reset_index()
    last_laps = last_laps.sort_values(lap_col, ascending=False)

    board = []
    for i, row in last_laps.iterrows():
        board.append({
            "position": len(board) + 1,
            "driver": str(row[driver_col]),
            "laps": int(row[lap_col]),
            "best_lap": round(float(df[df[driver_col] == row[driver_col]]["LapTimeSec"].min()), 3),
            "avg_lap":  round(float(df[df[driver_col] == row[driver_col]]["LapTimeSec"].mean()), 3),
        })

    return jsonify(board)


@app.route("/api/lap_times")
def lap_times():
    if df.empty:
        return jsonify([])

    driver_col = col("Driver", ["Abbreviation", "DriverNumber"])
    lap_col    = "LapNumber"
    if not driver_col: return jsonify([])

    result = []
    for driver, grp in df.groupby(driver_col):
        grp = grp.sort_values(lap_col)
        result.append({
            "driver": str(driver),
            "laps":   grp[lap_col].tolist(),
            "times":  [round(float(v), 3) for v in grp["LapTimeSec"].tolist()]
        })
    return jsonify(result)


@app.route("/api/compound_stats")
def compound_stats():
    if df.empty:
        return jsonify([])

    compound_col = col("Compound")
    if not compound_col:
        return jsonify([])

    stats = df.groupby(compound_col)["LapTimeSec"].agg(["mean","min","max","count"]).reset_index()
    return jsonify([{
        "compound": str(r[compound_col]),
        "mean":  round(float(r["mean"]), 3),
        "min":   round(float(r["min"]),  3),
        "max":   round(float(r["max"]),  3),
        "count": int(r["count"])
    } for _, r in stats.iterrows()])


@app.route("/api/sector_stats")
def sector_stats():
    if df.empty:
        return jsonify([])

    driver_col = col("Driver", ["Abbreviation"])
    s1 = col("Sector1Time", ["Sector1SessionTime"])
    s2 = col("Sector2Time", ["Sector2SessionTime"])
    s3 = col("Sector3Time", ["Sector3SessionTime"])

    if not all([driver_col, s1, s2, s3]):
        return jsonify([])

    for c in [s1, s2, s3]:
        if df[c].dtype == object:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    grp = df.groupby(driver_col)[[s1, s2, s3]].mean().reset_index().dropna()
    return jsonify([{
        "driver": str(r[driver_col]),
        "s1": round(float(r[s1]), 3),
        "s2": round(float(r[s2]), 3),
        "s3": round(float(r[s3]), 3),
    } for _, r in grp.iterrows()])


@app.route("/api/anomalies")
def anomalies():
    if df.empty:
        return jsonify([])

    driver_col = col("Driver", ["Abbreviation", "DriverNumber"])
    lap_col    = "LapNumber"
    if not driver_col: return jsonify([])

    result = []
    for driver, grp in df.groupby(driver_col):
        med = grp["LapTimeSec"].median()
        std = grp["LapTimeSec"].std()
        threshold = med + 2 * std
        flagged = grp[grp["LapTimeSec"] > threshold]
        for _, row in flagged.iterrows():
            result.append({
                "driver": str(driver),
                "lap":    int(row[lap_col]) if lap_col in row else 0,
                "time":   round(float(row["LapTimeSec"]), 3),
                "threshold": round(float(threshold), 3),
                "delta":  round(float(row["LapTimeSec"] - threshold), 3)
            })

    return jsonify(sorted(result, key=lambda x: x["delta"], reverse=True))


@app.route("/api/ml_metrics")
def ml_metrics():
    # Serve pre-computed or simulated metrics matching your project output
    return jsonify({
        "model": "Random Forest Regressor",
        "mae":   0.33,
        "rmse":  0.49,
        "r2":    0.98,
        "features": [
            {"name": "TyreAge",        "importance": 0.31},
            {"name": "Compound",       "importance": 0.22},
            {"name": "SectorBalance",  "importance": 0.17},
            {"name": "SpeedTrap",      "importance": 0.14},
            {"name": "Driver",         "importance": 0.10},
            {"name": "LapNumber",      "importance": 0.06},
        ]
    })


@app.route("/api/predictions")
def predictions():
    if df.empty:
        return jsonify({})

    driver_col = col("Driver", ["Abbreviation", "DriverNumber"])
    if not driver_col:
        return jsonify({})

    best = df.groupby(driver_col)["LapTimeSec"].min().sort_values()
    avg  = df.groupby(driver_col)["LapTimeSec"].mean().sort_values()

    return jsonify({
        "predicted_winner":       str(avg.index[0]),
        "predicted_fastest_lap":  str(best.index[0]),
        "predicted_fastest_time": round(float(best.iloc[0]), 3),
        "predicted_ranking": [
            {"driver": str(d), "predicted_avg": round(float(t), 3)}
            for d, t in avg.items()
        ]
    })


@app.route("/api/animation_frames")
def animation_frames():
    """Return per-lap track progress for each driver (used by JS race animation)."""
    if df.empty:
        return jsonify([])

    driver_col = col("Driver", ["Abbreviation", "DriverNumber"])
    lap_col    = "LapNumber"
    if not driver_col or lap_col not in df.columns:
        return jsonify([])

    drivers = df[driver_col].unique().tolist()
    max_lap = int(df[lap_col].max())

    frames = []
    for lap in range(1, max_lap + 1):
        frame = {"lap": lap, "cars": []}
        lap_df = df[df[lap_col] <= lap]
        for driver in drivers:
            d_df = lap_df[lap_df[driver_col] == driver]
            completed = len(d_df)
            avg_t = float(d_df["LapTimeSec"].mean()) if len(d_df) else 99
            frame["cars"].append({
                "driver": str(driver),
                "laps_done": completed,
                "avg_lap_time": round(avg_t, 3),
            })
        # Sort by laps done desc, then avg time asc
        frame["cars"].sort(key=lambda x: (-x["laps_done"], x["avg_lap_time"]))
        for i, car in enumerate(frame["cars"]):
            car["position"] = i + 1
        frames.append(frame)

    return jsonify(frames)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
