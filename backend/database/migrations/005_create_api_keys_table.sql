CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key_value TEXT NOT NULL UNIQUE,
    label VARCHAR(100),           
    owner VARCHAR(100),           
    is_revoked BOOLEAN DEFAULT false,
    request_count BIGINT DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 