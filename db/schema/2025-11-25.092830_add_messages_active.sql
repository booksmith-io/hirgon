BEGIN TRANSACTION;

ALTER TABLE messages
ADD COLUMN active BOOLEAN DEFAULT 'FALSE';

DROP TRIGGER insert_messages_active_at;
DROP TRIGGER update_messages_active_at;

CREATE TRIGGER after_insert_messages_active_true
AFTER INSERT ON messages
FOR EACH ROW
WHEN NEW.active = 'TRUE'
BEGIN
    UPDATE messages
    SET active_at = datetime('now', 'localtime')
    WHERE message_id = NEW.message_id;

    UPDATE messages
    SET active = 'FALSE'
    WHERE message_id IN (
        SELECT message_id FROM messages WHERE message_id != NEW.message_id
    );
END;

CREATE TRIGGER after_update_messages_active_true
AFTER UPDATE ON messages
FOR EACH ROW
WHEN NEW.active = 'TRUE'
BEGIN
    UPDATE messages
    SET active_at = datetime('now', 'localtime')
    WHERE message_id = NEW.message_id;

    UPDATE messages
    SET active = 'FALSE'
    WHERE message_id IN (
        SELECT message_id FROM messages WHERE message_id != NEW.message_id
    );
END;

CREATE TRIGGER after_insert_messages_active_false
AFTER INSERT ON messages
FOR EACH ROW
WHEN NEW.active = 'FALSE'
BEGIN
    UPDATE messages
    SET active_at = NULL
    WHERE message_id = NEW.message_id;
END;

CREATE TRIGGER after_update_messages_active_false
AFTER UPDATE ON messages
FOR EACH ROW
WHEN NEW.active = 'FALSE'
BEGIN
    UPDATE messages
    SET active_at = NULL
    WHERE message_id = NEW.message_id;
END;

COMMIT;
