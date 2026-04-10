CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_contact_messages_created_at (created_at),
    KEY idx_contact_messages_is_read (is_read),
    KEY idx_contact_messages_email (email)
);

