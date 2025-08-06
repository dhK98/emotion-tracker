-- user 테이블은 변경 없음 (기존 그대로 사용)
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loginid VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- emotion_data 테이블을 emotions로 변경하고 컬럼 수정
CREATE TABLE emotions (
    -- id를 UUID로 변경 (VARCHAR(36)은 UUID를 저장하기에 충분)
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL, -- user 테이블의 INT id를 참조
    -- 감정 타입 ENUM 정의
    emotion ENUM('very-happy', 'happy', 'neutral', 'sad', 'angry') NOT NULL,
    reason TEXT,
    -- 감정이 기록된 날짜 (YYYY-MM-DD 형식의 문자열)
    date VARCHAR(10) NOT NULL,
    -- 레코드 생성 시각 (자동 생성)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);