CREATE DATABASE coffre_fort OWNER mayan;

\c coffre_fort

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_windows (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    start_time VARCHAR(5),
    end_time VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    mayan_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_summary TEXT,
    ai_keywords TEXT,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_access_windows_user_id ON access_windows(user_id);
CREATE INDEX idx_documents_mayan_id ON documents(mayan_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

INSERT INTO users (email, hashed_password, full_name, role, is_active)
VALUES ('admin@coffre-fort.local', 
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5D8P7ZrtVQFm2',
        'Administrator',
        'admin',
        true);

INSERT INTO users (email, hashed_password, full_name, role, is_active)
VALUES ('user@coffre-fort.local',
        '$2b$12$cWr3fF7LAzPxzR2LXmjK6eTMq72bUvGKh7oCJxgBRa2y5lf7U2zea',
        'Test User',
        'user',
        true);