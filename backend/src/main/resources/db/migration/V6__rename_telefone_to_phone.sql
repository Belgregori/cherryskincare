-- Rename telefone column to phone and ensure unique constraint
-- This migration safely renames the column and updates the unique constraint

-- Note: MySQL doesn't support IF EXISTS for DROP INDEX, so we need to handle this carefully
-- If the index doesn't exist, the DROP will fail but we can continue

-- Step 1: Try to drop the old unique constraint (may fail if it doesn't exist, that's OK)
-- We'll use a stored procedure approach
DROP PROCEDURE IF EXISTS drop_old_index_if_exists;

DELIMITER $$

CREATE PROCEDURE drop_old_index_if_exists()
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND index_name = 'uk_users_telefone';
    
    IF index_exists > 0 THEN
        SET @sql = 'ALTER TABLE users DROP INDEX uk_users_telefone';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL drop_old_index_if_exists();
DROP PROCEDURE drop_old_index_if_exists;

-- Step 2: Rename the column from telefone to phone
ALTER TABLE users CHANGE COLUMN telefone phone VARCHAR(255) NOT NULL;

-- Step 3: Add the unique constraint with the new column name (only if it doesn't exist)
DROP PROCEDURE IF EXISTS add_phone_index_if_not_exists;

DELIMITER $$

CREATE PROCEDURE add_phone_index_if_not_exists()
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND index_name = 'uk_users_phone';
    
    IF index_exists = 0 THEN
        SET @sql = 'ALTER TABLE users ADD UNIQUE KEY uk_users_phone (phone)';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL add_phone_index_if_not_exists();
DROP PROCEDURE add_phone_index_if_not_exists;
