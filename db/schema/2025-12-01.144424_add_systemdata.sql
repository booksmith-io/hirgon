BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS 'systemdata' (
    key TEXT NOT NULL UNIQUE,
    value TEXT DEFAULT NULL,
    data TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TRIGGER before_insert_systemdata_check_json BEFORE INSERT ON systemdata
WHEN (NEW.data IS NOT NULL)
BEGIN
    SELECT CASE
        WHEN
            json_valid(NEW.data) != 1
        THEN
            RAISE (FAIL, 'JSON data is invalid')
    END;
END;

CREATE TRIGGER before_update_systemdata_check_json BEFORE UPDATE ON systemdata
WHEN (NEW.data IS NOT NULL)
BEGIN
    SELECT CASE
        WHEN
            json_valid(NEW.data) != 1
        THEN
            RAISE (FAIL, 'JSON data is invalid')
    END;
END;

CREATE TRIGGER after_update_systemdata_updated_at AFTER UPDATE ON systemdata
BEGIN
    UPDATE systemdata
    SET updated_at = datetime('now', 'localtime')
    WHERE key = NEW.key;
END;

-- add the default settings:icon entry, [bi-]send
INSERT into systemdata (key, value) values ('settings:icon', 'send');

COMMIT;
