# 🏎️ F1 AI/ML Analysis Project

## 🌐 Live Demo

https://f1-aiml-analysis-npqby4dg2tvdqq9hpjc4bs.streamlit.app

---

## 📂 GitHub Repository

https://github.com/saranya-R16/f1-aiml-analysis

---

# Overview

This project is an end-to-end Formula 1 Data Analysis and Machine Learning pipeline built using Python and FastF1.

The objective is to analyze race performance from the 2024 Bahrain Grand Prix, engineer meaningful racing features, build predictive machine learning models, and identify unusual driver performance patterns through anomaly detection.

The project demonstrates a complete AI/ML workflow including:

- Data Collection
- Data Cleaning & Preprocessing
- Exploratory Data Analysis (EDA)
- Feature Engineering
- Machine Learning Modeling
- Model Evaluation
- Anomaly Detection
- Data Visualization
- Interactive Dashboard Development
- Cloud Deployment using Streamlit

---

# 🎯 Project Objectives

The main goals of this project are:

- Collect official Formula 1 timing data using FastF1
- Clean and prepare race telemetry and lap timing data
- Analyze lap-time distributions and tyre performance
- Investigate relationships between sector times, speed traps, and lap times
- Engineer racing-specific features for machine learning
- Build a Random Forest Regression model to predict lap times
- Evaluate model performance using industry-standard metrics
- Detect anomalous laps that significantly deviate from normal driver performance
- Present findings using professional visualizations

---

# 📊 Dataset

## Source

Official Formula 1 timing data obtained through the FastF1 Python library.

## Session Used

| Field | Value |
|---------|---------|
| Season | 2024 |
| Grand Prix | Bahrain Grand Prix |
| Session Type | Race |

## Data Includes

- Driver Information
- Team Information
- Lap Times
- Sector Times
- Tyre Compounds
- Tyre Life
- Speed Trap Data
- Position Data
- Race Timing Information

---

# 🛠️ Technologies Used

## Programming Language

- Python 3.x

## Libraries

- FastF1
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Scikit-Learn
- Streamlit

---

# 📁 Project Structure

```text
f1-aiml-analysis/
│
├── app.py
├── f1_analysis.py
├── README.md
├── requirements.txt
├── .gitignore
│
├── plots/
│   ├── lap_distribution.png
│   ├── compound_boxplot.png
│   ├── sector_comparison.png
│   ├── speed_correlation.png
│   ├── predicted_vs_actual.png
│   ├── feature_importance.png
│   └── anomaly_detection.png
│
└── f1_cache/
```

---

# 🧹 Data Cleaning Process

The raw Formula 1 race dataset was cleaned using the following steps:

- Selected only relevant analysis columns
- Converted lap and sector times from timedelta format to seconds
- Removed rows with missing lap times
- Removed outlier laps greater than 120 seconds
- Removed rows with missing sector information
- Reset dataframe indexing after cleaning

## Results

| Stage | Rows |
|---------|---------|
| Before Cleaning | 1129 |
| After Cleaning | 1101 |

---

# 📈 Exploratory Data Analysis

## 1. Lap Time Distribution

Visualizes the overall distribution of lap times across the race.

**Output:**

- lap_distribution.png

---

## 2. Tyre Compound Performance

Compares lap-time performance across tyre compounds.

**Output:**

- compound_boxplot.png

---

## 3. Sector Performance Analysis

Compares average Sector 1, Sector 2 and Sector 3 times for each driver.

**Output:**

- sector_comparison.png

---

## 4. Speed Trap Correlation Analysis

Investigates the relationship between SpeedST and overall lap performance.

**Output:**

- speed_correlation.png

---

# ⚙️ Feature Engineering

The following custom features were created:

## Sector Balance

```python
SectorBalance = Sector1Time - Sector3Time
```

Measures balance between opening and closing sectors.

## Tyre Age Categories

Tyre life was categorized into:

- Fresh (1–10 laps)
- Used (11–25 laps)
- Old (26+ laps)

## Encoding

Applied encoding to:

- Driver
- Compound
- TyreAge_Bucket

---

# 🤖 Machine Learning Model

## Algorithm

Random Forest Regressor

```python
RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
```

## Target Variable

```python
LapTime
```

## Features Used

- LapNumber
- TyreLife
- SectorBalance
- SpeedI1
- SpeedI2
- SpeedFL
- SpeedST
- Encoded Driver Information
- Encoded Compound Information
- Encoded Tyre Categories

---

# 📊 Model Evaluation

## Metrics

| Metric | Score |
|----------|----------|
| MAE | 0.336 |
| RMSE | 0.491 |
| R² Score | 0.986 |

## Interpretation

The model achieved an R² score of approximately **0.986**, indicating that it explains over **98% of lap-time variance** and provides highly accurate predictions.

### Outputs

- predicted_vs_actual.png
- feature_importance.png

---

# 🚨 Anomaly Detection

A statistical anomaly detection approach was implemented.

## Method

For each driver:

```python
Threshold = Median Lap Time + (2 × Standard Deviation)
```

Laps exceeding this threshold were flagged as anomalies.

## Purpose

Useful for identifying:

- Driver mistakes
- Tyre degradation
- Mechanical issues
- Traffic effects
- Race incidents

### Output

- anomaly_detection.png

---

# 🌐 Interactive Dashboard

A professional Streamlit dashboard was developed to present the analysis interactively.

### Dashboard Features

- Project Overview
- Exploratory Data Analysis
- Machine Learning Results
- Feature Importance Visualization
- Anomaly Detection Dashboard
- Interactive Plot Viewing
- Professional Analytics Interface

### Dashboard Link

https://f1-aiml-analysis-npqby4dg2tvdqq9hpjc4bs.streamlit.app

---

# 🔍 Key Findings

- Max Verstappen recorded the fastest average race pace.
- Speed trap performance showed a strong relationship with lap times.
- Tyre condition significantly influenced race pace.
- The Random Forest model achieved excellent predictive performance.
- Multiple anomalous laps were successfully identified for each driver.

---

# ▶️ How to Run

## Clone Repository

```bash
git clone https://github.com/saranya-R16/f1-aiml-analysis.git
cd f1-aiml-analysis
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Analysis Script

```bash
python f1_analysis.py
```

## Run Dashboard

```bash
streamlit run app.py
```

---

# 📂 Outputs Generated

The project automatically generates:

- lap_distribution.png
- compound_boxplot.png
- sector_comparison.png
- speed_correlation.png
- predicted_vs_actual.png
- feature_importance.png
- anomaly_detection.png

All outputs are saved inside the `plots/` directory.

---

# 🎓 Learning Outcomes

- Data Collection from APIs
- Data Cleaning & Preprocessing
- Exploratory Data Analysis
- Feature Engineering
- Machine Learning Modelling
- Model Evaluation
- Statistical Anomaly Detection
- Interactive Dashboard Development
- GitHub Project Management
- Streamlit Cloud Deployment

---

# 👨‍💻 Author

**Saranya R**

AI/ML Engineering Internship Project

Formula 1 Race Performance Analytics

Bahrain Grand Prix 2024

GitHub Repository:

https://github.com/saranya-R16/f1-aiml-analysis

Live Dashboard:

https://f1-aiml-analysis-npqby4dg2tvdqq9hpjc4bs.streamlit.app

---

# 📜 License

This project is created for educational and internship evaluation purposes.
