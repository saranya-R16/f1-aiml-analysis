import streamlit as st
import os

st.set_page_config(
    page_title="F1 AI/ML Dashboard",
    page_icon="🏎️",
    layout="wide"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLOTS_DIR = os.path.join(BASE_DIR, "plots")

st.title("🏎️ Formula 1 AI/ML Race Analytics Dashboard")
st.subheader("Bahrain Grand Prix 2024")

st.markdown("---")

page = st.sidebar.selectbox(
    "Choose Section",
    [
        "Overview",
        "EDA",
        "Machine Learning",
        "Anomaly Detection"
    ]
)

if page == "Overview":

    st.header("📋 Project Overview")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Drivers", "20")
    col2.metric("Season", "2024")
    col3.metric("Race", "Bahrain GP")
    col4.metric("Model", "Random Forest")

    st.markdown("""
### Project Objectives

✅ Data Collection using FastF1

✅ Data Cleaning

✅ Exploratory Data Analysis

✅ Feature Engineering

✅ Lap Time Prediction

✅ Feature Importance Analysis

✅ Anomaly Detection

This project predicts Formula 1 lap times and identifies unusual driver performance using machine learning.
""")

elif page == "EDA":

    st.header("📊 Exploratory Data Analysis")

    st.subheader("Lap Time Distribution")

    st.image(
        os.path.join(PLOTS_DIR, "lap_distribution.png"),
        use_container_width=True
    )

    st.info(
        "Histogram showing overall lap time distribution. Mean and median indicate race pace trends."
    )

    st.subheader("Tyre Compound Analysis")

    st.image(
        os.path.join(PLOTS_DIR, "compound_boxplot.png"),
        use_container_width=True
    )

    st.info(
        "Comparison of Soft, Medium and Hard compounds."
    )

    st.subheader("Sector Comparison")

    st.image(
        os.path.join(PLOTS_DIR, "sector_comparison.png"),
        use_container_width=True
    )

    st.info(
        "Average Sector 1, Sector 2 and Sector 3 performance by driver."
    )

    st.subheader("Speed Correlation")

    st.image(
        os.path.join(PLOTS_DIR, "speed_correlation.png"),
        use_container_width=True
    )

    st.info(
        "Relationship between Speed Trap speed and Lap Time."
    )

elif page == "Machine Learning":

    st.header("🤖 Machine Learning Analysis")

    st.success(
        "Random Forest Regressor trained to predict lap times."
    )

    st.subheader("Predicted vs Actual")

    st.image(
        os.path.join(PLOTS_DIR, "predicted_vs_actual.png"),
        use_container_width=True
    )

    st.info(
        "Points closer to the diagonal line indicate better predictions."
    )

    st.subheader("Feature Importance")

    st.image(
        os.path.join(PLOTS_DIR, "feature_importance.png"),
        use_container_width=True
    )

    st.info(
        "Most influential variables affecting lap time prediction."
    )

elif page == "Anomaly Detection":

    st.header("🚨 Driver Anomaly Detection")

    st.image(
        os.path.join(PLOTS_DIR, "anomaly_detection.png"),
        use_container_width=True
    )

    st.warning(
        "Red X markers highlight laps that significantly deviate from normal performance."
    )

    st.markdown("""
### Detection Rule

An anomaly is detected when:

Lap Time > Driver Median + (2 × Driver Standard Deviation)

Possible reasons:

- Tyre degradation
- Driver mistakes
- Mechanical issues
- Traffic
- Pit stop related delays
""")

st.markdown("---")
st.caption(
    "F1 AI/ML Internship Project • FastF1 • Pandas • Scikit-Learn • Streamlit"
)