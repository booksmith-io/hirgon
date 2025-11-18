BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS 'users' (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwd TEXT DEFAULT NULL,
    active BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX users_name_index ON users (name);

CREATE TRIGGER update_users_updated_at AFTER UPDATE ON users
BEGIN
    UPDATE users
    SET updated_at = datetime('now', 'localtime')
    WHERE user_id = NEW.user_id;
END;

COMMIT;
