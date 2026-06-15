import fastf1
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score
# Enable cache
fastf1.Cache.enable_cache('f1_cache')

# Load Bahrain GP 2024 Race
session = fastf1.get_session(2024, 'Bahrain', 'R')
session.load()

laps = session.laps

# Columns needed
columns = [
    'Driver',
    'Team',
    'LapNumber',
    'LapTime',
    'Sector1Time',
    'Sector2Time',
    'Sector3Time',
    'Compound',
    'TyreLife',
    'SpeedI1',
    'SpeedI2',
    'SpeedFL',
    'SpeedST'
]

laps = laps[columns].copy()

# Shape before cleaning
print("Before Cleaning:", laps.shape)

# Convert timedelta to seconds
laps['LapTime'] = laps['LapTime'].dt.total_seconds()
laps['Sector1Time'] = laps['Sector1Time'].dt.total_seconds()
laps['Sector2Time'] = laps['Sector2Time'].dt.total_seconds()
laps['Sector3Time'] = laps['Sector3Time'].dt.total_seconds()

# Remove null laptimes
laps = laps[laps['LapTime'].notna()]

# Remove outliers
laps = laps[laps['LapTime'] <= 120]

# Remove rows with null sector times
laps = laps.dropna(
    subset=[
        'Sector1Time',
        'Sector2Time',
        'Sector3Time'
    ]
)

# Reset index
laps = laps.reset_index(drop=True)

# Shape after cleaning
print("After Cleaning:", laps.shape)

print("\nFirst 5 Clean Rows:")
print(laps.head())

sns.set_theme(style="darkgrid")

mean_lap = laps["LapTime"].mean()
median_lap = laps["LapTime"].median()

plt.figure(figsize=(10, 6))

sns.histplot(laps["LapTime"], bins=30)

plt.axvline(mean_lap, color="gold", linestyle="--", label="Mean")
plt.axvline(median_lap, color="teal", linestyle="--", label="Median")

plt.title("Lap Time Distribution")
plt.xlabel("Lap Time (seconds)")
plt.ylabel("Count")
plt.legend()

plt.savefig("plots/lap_distribution.png")

plt.close()

print("lap_distribution.png created successfully")

plt.figure(figsize=(8,6))

sns.boxplot(
    data=laps,
    x="Compound",
    y="LapTime"
)

plt.title("Lap Time by Tyre Compound")
plt.xlabel("Compound")
plt.ylabel("Lap Time (seconds)")

plt.savefig("plots/compound_boxplot.png")

plt.close()

print("compound_boxplot.png created successfully")

top5 = laps.groupby("Driver")["LapTime"].mean()

top5 = top5.sort_values().head(5)

print("\nTop 5 Fastest Drivers:")
print(top5)

sector_avg = laps.groupby("Driver")[
    ["Sector1Time", "Sector2Time", "Sector3Time"]
].mean()

sector_avg["Total"] = (
    sector_avg["Sector1Time"]
    + sector_avg["Sector2Time"]
    + sector_avg["Sector3Time"]
)

sector_avg = sector_avg.sort_values("Total")

sector_avg[
    ["Sector1Time", "Sector2Time", "Sector3Time"]
].plot(
    kind="bar",
    figsize=(12,6)
)

plt.title("Average Sector Times by Driver")
plt.xlabel("Driver")
plt.ylabel("Seconds")

plt.tight_layout()

plt.savefig("plots/sector_comparison.png")

plt.close()

print("sector_comparison.png created successfully")

correlation = laps["SpeedST"].corr(laps["LapTime"])

print("\nSpeedST vs LapTime Correlation:")
print(correlation)

plt.figure(figsize=(10,6))

sns.scatterplot(
    data=laps,
    x="SpeedST",
    y="LapTime",
    hue="Compound"
)

sns.regplot(
    data=laps,
    x="SpeedST",
    y="LapTime",
    scatter=False
)

plt.title("SpeedST vs LapTime")

plt.savefig("plots/speed_correlation.png")

plt.close()

print("speed_correlation.png created successfully")

# Feature Engineering

laps["SectorBalance"] = (
    laps["Sector1Time"] - laps["Sector3Time"]
)

def tyre_bucket(x):
    if x <= 10:
        return "Fresh"
    elif x <= 25:
        return "Used"
    else:
        return "Old"

laps["TyreAge_Bucket"] = laps["TyreLife"].apply(tyre_bucket)

print("\nFeature Engineering Completed")
print(laps[["SectorBalance", "TyreAge_Bucket"]].head())

# Encoding categorical columns

laps_encoded = pd.get_dummies(
    laps,
    columns=[
        "Compound",
        "TyreAge_Bucket",
        "Driver"
    ],
    drop_first=True
)

print("\nEncoding Completed")
print(laps_encoded.shape)

features = [
    "LapNumber",
    "TyreLife",
    "SectorBalance",
    "SpeedI1",
    "SpeedI2",
    "SpeedFL",
    "SpeedST"
]

dummy_cols = [
    col for col in laps_encoded.columns
    if col.startswith("Compound_")
    or col.startswith("TyreAge_Bucket_")
    or col.startswith("Driver_")
]

features.extend(dummy_cols)

X = laps_encoded[features]

y = laps_encoded["LapTime"]

print("\nX Shape:", X.shape)
print("y Shape:", y.shape)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTrain Shape:", X_train.shape)
print("Test Shape:", X_test.shape)

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

print("\nModel Training Completed")

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5

r2 = r2_score(
    y_test,
    y_pred
)

print("\nModel Evaluation")
print("MAE:", mae)
print("RMSE:", rmse)
print("R2 Score:", r2)

plt.figure(figsize=(8,6))

plt.scatter(
    y_test,
    y_pred
)

plt.xlabel("Actual Lap Time")
plt.ylabel("Predicted Lap Time")

# Predicted vs Actual Plot
plt.figure(figsize=(8,6))

plt.scatter(
    y_test,
    y_pred,
    alpha=0.6
)

plt.plot(
    [y_test.min(), y_test.max()],
    [y_test.min(), y_test.max()],
    color="gold",
    linewidth=2,
    label="Perfect Prediction"
)

plt.xlabel("Actual Lap Time")
plt.ylabel("Predicted Lap Time")
plt.title("Predicted vs Actual Lap Times")
plt.legend()

plt.savefig(
    "plots/predicted_vs_actual.png"
)

plt.close()

print("predicted_vs_actual.png created successfully")



importance = pd.Series(
    model.feature_importances_,
    index=X.columns
)

importance = importance.sort_values(
    ascending=False
).head(10)

plt.figure(figsize=(10,6))

importance.plot(kind="bar")

plt.title("Top 10 Feature Importance")

plt.tight_layout()

plt.savefig(
    "plots/feature_importance.png"
)

plt.close()

print("feature_importance.png created successfully")


importance = pd.Series(
    model.feature_importances_,
    index=X.columns
)

importance = importance.sort_values(
    ascending=False
).head(10)

plt.figure(figsize=(10,6))

importance.plot(kind="bar")

plt.title("Top 10 Feature Importance")

plt.tight_layout()

plt.savefig(
    "plots/feature_importance.png"
)

plt.close()

print("feature_importance.png created successfully")

# ==========================
# ANOMALY DETECTION
# ==========================

laps["IsAnomaly"] = False

for driver in laps["Driver"].unique():

    driver_data = laps[laps["Driver"] == driver]

    median_time = driver_data["LapTime"].median()
    std_time = driver_data["LapTime"].std()

    threshold = median_time + (2 * std_time)

    laps.loc[
        (laps["Driver"] == driver)
        & (laps["LapTime"] > threshold),
        "IsAnomaly"
    ] = True

print("\nAnomaly Count By Driver")
print(
    laps.groupby("Driver")["IsAnomaly"].sum()
)

# Top 3 fastest drivers
top3_drivers = (
    laps.groupby("Driver")["LapTime"]
    .mean()
    .sort_values()
    .head(3)
    .index
)

plt.figure(figsize=(12, 6))

for driver in top3_drivers:

    driver_data = laps[laps["Driver"] == driver]

    plt.plot(
        driver_data["LapNumber"],
        driver_data["LapTime"],
        label=driver
    )

    anomalies = driver_data[
        driver_data["IsAnomaly"]
    ]

    plt.scatter(
        anomalies["LapNumber"],
        anomalies["LapTime"],
        color="red",
        marker="x",
        s=100,
        label="Anomaly Lap"
    )
    plt.legend()

plt.title("Anomaly Detection - Top 3 Drivers")
plt.xlabel("Lap Number")
plt.ylabel("Lap Time (seconds)")
plt.legend()

plt.tight_layout()

plt.savefig(
    "plots/anomaly_detection.png"
)

plt.close()

print("anomaly_detection.png created successfully")