BEGIN TRANSACTION;

CREATE TRIGGER insert_messages_active_at
AFTER INSERT ON messages
WHEN NEW.active_at IS NOT NULL
BEGIN
    UPDATE messages
    SET active_at = NULL
    WHERE message_id IN (
        SELECT message_id FROM messages WHERE message_id != NEW.message_id
    );
END;

CREATE TRIGGER update_messages_active_at
AFTER UPDATE ON messages
WHEN NEW.active_at IS NOT NULL
BEGIN
    UPDATE messages
    SET active_at = NULL
    WHERE message_id IN (
        SELECT message_id FROM messages WHERE message_id != NEW.message_id
    );
END;

COMMIT;
