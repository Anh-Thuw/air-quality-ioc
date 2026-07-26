CREATE DATABASE IF NOT EXISTS air_quality_ioc;
USE air_quality_ioc;

CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pollution_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    ts DATETIME,
    ts_vn DATETIME,
    aqius INT,
    mainus VARCHAR(20),
    aqicn INT,
    maincn VARCHAR(20),
    p1 FLOAT,
    p2 FLOAT,
    o3 FLOAT,
    n2 FLOAT,
    s2 FLOAT,
    co FLOAT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pollution_station
        FOREIGN KEY (station_id)
        REFERENCES stations(id)
);

CREATE TABLE weather_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    ts DATETIME,
    ts_vn DATETIME,
    tp FLOAT,
    pr INT,
    hu INT,
    ws FLOAT,
    wd INT,
    ic VARCHAR(20),
    heat_index FLOAT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(station_id)
        REFERENCES stations(id)
);

CREATE TABLE forecasts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    model_name VARCHAR(50),
    forecast_for DATETIME,
    predicted_aqius INT,
    predicted_pm25 FLOAT,
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(station_id)
        REFERENCES stations(id)
);

CREATE TABLE api_fetch_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id INT,
    called_at DATETIME,
    status VARCHAR(20),
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(station_id)
        REFERENCES stations(id)
);