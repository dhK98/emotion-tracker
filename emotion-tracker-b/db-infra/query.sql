CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loginid VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE emotion_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    emotion ENUM('very-happy', 'happy', 'neutral', 'sad', 'angry') NOT NULL,
    reason TEXT,
    created_at DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);