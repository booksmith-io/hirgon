BEGIN TRANSACTION;

-- create the new table with the correct column definitions
CREATE TABLE IF NOT EXISTS 'messages_X' (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    active BOOLEAN DEFAULT 0,
    active_at TEXT DEFAULT NULL,
    scheduled_at TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- copy over the data from the original table
INSERT INTO messages_X (message_id, name, body, active, active_at, created_at, updated_at)
SELECT message_id, name, body, active, active_at, created_at, updated_at FROM messages;

-- drop the original table and triggers
DROP TABLE messages;

-- rename the new table to the original
ALTER TABLE messages_X RENAME TO messages;

-- and finally, recreate the triggers
CREATE TRIGGER after_insert_messages_active_true
AFTER INSERT ON messages
FOR EACH ROW
WHEN NEW.active = 1
BEGIN
    UPDATE messages
    SET active_at = datetime('now', 'localtime'), scheduled_at = NULL
    WHERE message_id = NEW.message_id;

    UPDATE messages
    SET active = 0
    WHERE message_id IN (
        SELECT message_id FROM messages WHERE message_id != NEW.message_id
    );
END;

CREATE TRIGGER after_update_messages_active_true
AFTER UPDATE ON messages
FOR EACH ROW
WHEN NEW.active = 1
BEGIN
    UPDATE messages
    SET active_at = datetime('now', 'localtime'), scheduled_at = NULL
    WHERE message_id = NEW.message_id;

    UPDATE messages
    SET active = 0
    WHERE message_id IN (
        SELECT message_id FROM messages WHERE message_id != NEW.message_id
    );
END;

CREATE TRIGGER after_insert_messages_active_false
AFTER INSERT ON messages
FOR EACH ROW
WHEN NEW.active = 0
BEGIN
    UPDATE messages
    SET active_at = NULL
    WHERE message_id = NEW.message_id;
END;

CREATE TRIGGER after_update_messages_active_false
AFTER UPDATE ON messages
FOR EACH ROW
WHEN NEW.active = 0
BEGIN
    UPDATE messages
    SET active_at = NULL
    WHERE message_id = NEW.message_id;
END;

COMMIT;
