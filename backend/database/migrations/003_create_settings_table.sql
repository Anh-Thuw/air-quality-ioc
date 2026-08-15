CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    refresh_interval_minutes INT DEFAULT 60,
    aqi_warning_threshold INT DEFAULT 100,
    forecast_hours INT DEFAULT 24,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1) -- dam bao bang chi co dung 1 dong cau hinh
);

INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;