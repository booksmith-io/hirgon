BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS 'messages' (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    active_at TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TRIGGER update_messages_updated_at AFTER UPDATE ON users
BEGIN
    UPDATE messages
    SET updated_at = datetime('now', 'localtime')
    WHERE message_id = NEW.message_id;
END;

COMMIT;
