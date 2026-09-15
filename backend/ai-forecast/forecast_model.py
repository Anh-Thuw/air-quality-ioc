import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  
import matplotlib.pyplot as plt
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("Loi: chua thiet lap DATABASE_URL trong file .env")

FORECAST_HOURS_AHEAD = 3
N_LAGS = 3
MIN_DATA_POINTS = 30

OUTPUT_DIR = "forecast_charts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

engine = create_engine(DATABASE_URL)


def fetch_station_list():
    return pd.read_sql("SELECT id, name FROM stations ORDER BY id", engine)


def fetch_combined_history(station_id):
    query = """
        SELECT p.ts_vn, p.aqius, w.tp, w.hu, w.ws, w.pr, w.wd
        FROM pollution_readings p
        JOIN weather_readings w
          ON p.station_id = w.station_id AND p.ts_vn = w.ts_vn
        WHERE p.station_id = %(sid)s AND p.aqius IS NOT NULL
        ORDER BY p.ts_vn ASC
    """
    df = pd.read_sql(query, engine, params={"sid": station_id})
    # return df.drop_duplicates(subset="ts_vn", keep="first").reset_index(drop=True)
    return df.reset_index(drop=True)

def build_features(df):
    df = df.copy()
    df["ts_vn"] = pd.to_datetime(df["ts_vn"])
    df["hour"] = df["ts_vn"].dt.hour
    df["wd_sin"] = np.sin(np.deg2rad(df["wd"]))
    df["wd_cos"] = np.cos(np.deg2rad(df["wd"]))

    base_cols = ["aqius", "tp", "hu", "ws", "pr", "wd_sin", "wd_cos"]
    for col in base_cols:
        for lag in range(1, N_LAGS + 1):
            df[f"{col}_lag{lag}"] = df[col].shift(lag)

    df["target"] = df["aqius"].shift(-FORECAST_HOURS_AHEAD)
    df = df.dropna().reset_index(drop=True)

    feature_cols = [f"{col}_lag{lag}" for col in base_cols for lag in range(1, N_LAGS + 1)] + ["hour"]
    return df, feature_cols


def plot_comparison(station_name, test_dates, y_test, baseline_pred, rf_pred, gb_pred):
    plt.figure(figsize=(12, 5))
    plt.plot(test_dates, y_test.values, "o-", label="AQI thuc te", color="black", linewidth=2)
    plt.plot(test_dates, baseline_pred.values, "x--", label="Baseline (doan mo)", color="gray", alpha=0.7)
    plt.plot(test_dates, rf_pred, "s--", label="Random Forest", color="tab:blue", alpha=0.8)
    plt.plot(test_dates, gb_pred, "^--", label="Gradient Boosting", color="tab:red", alpha=0.8)
    plt.title(f"So sanh du doan AQI - Tram {station_name} (du bao {FORECAST_HOURS_AHEAD}h toi)")
    plt.xlabel("Thoi gian")
    plt.ylabel("AQI (US)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()

    filename = f"{OUTPUT_DIR}/{station_name.replace(' ', '_')}_comparison.png"
    plt.savefig(filename, dpi=120)
    plt.close()
    return filename


def build_lag_features_only(df):
    """Tao dac trung tre (lag), KHONG tao target - dung chung cho moi khoang du bao (1h..12h)."""
    df = df.copy()
    df["ts_vn"] = pd.to_datetime(df["ts_vn"])
    df["hour"] = df["ts_vn"].dt.hour
    df["wd_sin"] = np.sin(np.deg2rad(df["wd"]))
    df["wd_cos"] = np.cos(np.deg2rad(df["wd"]))

    base_cols = ["aqius", "tp", "hu", "ws", "pr", "wd_sin", "wd_cos"]
    for col in base_cols:
        for lag in range(1, N_LAGS + 1):
            df[f"{col}_lag{lag}"] = df[col].shift(lag)

    feature_cols = [f"{col}_lag{lag}" for col in base_cols for lag in range(1, N_LAGS + 1)] + ["hour"]
    return df, feature_cols


def forecast_next_n_hours(raw_df, n_hours=12, model_class=RandomForestRegressor, model_params=None):
    """
    Du bao THAT cho n_hours GIO TOI (chua tung xay ra), khong phai danh gia tren du lieu cu.
    Voi moi khoang h = 1..n_hours, train rieng 1 model tren toan bo du lieu hien co
    (target = AQI sau h gio), roi ap dung vao dong du lieu MOI NHAT de doan.
    """
    if model_params is None:
        model_params = dict(n_estimators=200, max_depth=8, random_state=42, min_samples_leaf=2)

    df_lagged, feature_cols = build_lag_features_only(raw_df)
    last_row_features = df_lagged[feature_cols].iloc[[-1]]
    last_ts = df_lagged["ts_vn"].iloc[-1]

    if last_row_features.isna().any(axis=1).iloc[0]:
        return None  # chua du du lieu de tao dac trung cho dong cuoi

    results = []
    for h in range(1, n_hours + 1):
        target = df_lagged["aqius"].shift(-h)
        mask = target.notna() & df_lagged[feature_cols].notna().all(axis=1)

        X_train = df_lagged.loc[mask, feature_cols]
        y_train = target[mask]

        if len(X_train) < 8:  # qua it du lieu de train cho khoang gio nay
            continue

        model = model_class(**model_params)
        model.fit(X_train, y_train)
        predicted = model.predict(last_row_features)[0]

        results.append({
            "forecast_for": last_ts + pd.Timedelta(hours=h),
            "hours_ahead": h,
            "predicted_aqius": max(0, round(predicted)),
        })

    return pd.DataFrame(results) if results else None


def save_multi_hour_forecast(station_id, forecast_df, model_name):
    with engine.begin() as conn:
        for _, row in forecast_df.iterrows():
            conn.exec_driver_sql(
                """
                INSERT INTO forecasts (station_id, model_name, forecast_for, predicted_aqius, confidence)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (station_id, model_name, row["forecast_for"], row["predicted_aqius"], 0.6),
            )


def plot_future_forecast(station_name, raw_df, forecast_df):
    plt.figure(figsize=(12, 5))
    plt.plot(pd.to_datetime(raw_df["ts_vn"]), raw_df["aqius"], "o-", label="AQI da do (lich su)", color="black")
    plt.plot(forecast_df["forecast_for"], forecast_df["predicted_aqius"], "s--", label="AQI du bao 12h toi", color="tab:orange")
    plt.axvline(pd.to_datetime(raw_df["ts_vn"]).iloc[-1], color="gray", linestyle=":", label="Hien tai")
    plt.title(f"Du bao AQI 12 gio toi - Tram {station_name}")
    plt.xlabel("Thoi gian")
    plt.ylabel("AQI (US)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()

    filename = f"{OUTPUT_DIR}/{station_name.replace(' ', '_')}_forecast_12h.png"
    plt.savefig(filename, dpi=120)
    plt.close()
    return filename


def main():
    stations = fetch_station_list()
    print(f"Tim thay {len(stations)} tram.\n")

    all_results = []

    for _, station in stations.iterrows():
        station_id, station_name = station["id"], station["name"]

        raw_df = fetch_combined_history(station_id)
        print(f"=== Tram: {station_name} (id={station_id}) — {len(raw_df)} dong sau khi JOIN dung ===")

        if len(raw_df) < MIN_DATA_POINTS:
            print(f"  Bo qua: chi co {len(raw_df)} diem (can >= {MIN_DATA_POINTS})\n")
            continue

        df, feature_cols = build_features(raw_df)
        if len(df) < 10:
            print(f"  Bo qua: sau feature engineering chi con {len(df)} dong\n")
            continue

        X = df[feature_cols]
        y = df["target"]

        split_idx = int(len(df) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        test_dates = df["ts_vn"].iloc[split_idx:]

        if len(X_test) == 0:
            print(f"  Bo qua: khong du de tach tap test\n")
            continue

        # 1. Baseline
        baseline_pred = df["aqius"].iloc[split_idx:]
        baseline_mae = mean_absolute_error(y_test, baseline_pred)

        # 2. Random Forest - in ro tham so dang dung
        rf_params = dict(n_estimators=200, max_depth=8, random_state=42, min_samples_leaf=2)
        rf = RandomForestRegressor(**rf_params)
        rf.fit(X_train, y_train)
        rf_pred = rf.predict(X_test)
        rf_mae = mean_absolute_error(y_test, rf_pred)
        rf_rmse = mean_squared_error(y_test, rf_pred) ** 0.5

        # 3. Gradient Boosting - in ro tham so dang dung
        gb_params = dict(n_estimators=150, max_depth=4, random_state=42)
        gb = GradientBoostingRegressor(**gb_params)
        gb.fit(X_train, y_train)
        gb_pred = gb.predict(X_test)
        gb_mae = mean_absolute_error(y_test, gb_pred)
        gb_rmse = mean_squared_error(y_test, gb_pred) ** 0.5

        # In tham so chi tiet cua tung model
        print(f"  Tham so Random Forest: {rf_params}")
        print(f"  Tham so Gradient Boosting: {gb_params}")
        print(f"  So mau train/test: {len(X_train)}/{len(X_test)}\n")

        # In CHI TIET tung diem du doan vs thuc te (khong chi tom tat MAE)
        detail = pd.DataFrame({
            "Thoi_gian": test_dates.dt.strftime("%Y-%m-%d %H:%M").values,
            "AQI_thuc_te": y_test.values,
            "Baseline": baseline_pred.values,
            "Random_Forest": rf_pred.round(1),
            "Gradient_Boosting": gb_pred.round(1),
        })
        print("  Chi tiet tung diem du doan:")
        print(detail.to_string(index=False))
        print()

        # Bang tom tat MAE/RMSE
        summary = pd.DataFrame({
            "MAE": [baseline_mae, rf_mae, gb_mae],
            "RMSE": [None, rf_rmse, gb_rmse],
        }, index=["Baseline", "Random Forest", "Gradient Boosting"])
        print("  Tom tat sai so:")
        print(summary.round(2).to_string())

        best_model = summary["MAE"].idxmin()
        print(f"  → Model tot nhat cho tram nay: {best_model}")

        # Ve va luu bieu do so sanh
        chart_path = plot_comparison(station_name, test_dates, y_test, baseline_pred, rf_pred, gb_pred)
        print(f"  📊 Da luu bieu do so sanh: {chart_path}\n")

        # ==== DU BAO THAT 12 GIO TOI (chua tung xay ra) ====
        future_forecast = forecast_next_n_hours(raw_df, n_hours=12)
        if future_forecast is not None:
            print("  Du bao AQI 12 gio toi (tu bay gio):")
            print(future_forecast.to_string(index=False))
            save_multi_hour_forecast(station_id, future_forecast, "RandomForest_12h_direct")

            future_chart = plot_future_forecast(station_name, raw_df, future_forecast)
            print(f"  📊 Da luu bieu do du bao 12h: {future_chart}\n")
        else:
            print("  Khong du du lieu de du bao 12 gio toi.\n")

        print("=" * 100 + "\n")

        summary["station"] = station_name
        all_results.append(summary)

    if all_results:
        combined = pd.concat(all_results)
        print("\n===== TONG HOP MAE TRUNG BINH TREN TAT CA TRAM =====")
        overall = combined.groupby(combined.index)["MAE"].mean().sort_values()
        print(overall.round(2).to_string())
        print(f"\n🏆 Model duoc khuyen dung: {overall.index[0]}")
        print(f"\n📊 Tat ca bieu do da luu trong thu muc: {OUTPUT_DIR}/")
    else:
        print("Chua du du lieu de so sanh.")


if __name__ == "__main__":
    main()