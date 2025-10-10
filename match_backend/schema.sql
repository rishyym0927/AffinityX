DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS match_requests CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS user_exclusions CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ========================================
-- 1. Users Table
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    age SMALLINT CHECK (age BETWEEN 18 AND 100),
    city VARCHAR(100),
    lat DOUBLE PRECISION DEFAULT 0,
    lon DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 2. User Exclusions
-- ========================================
CREATE TABLE IF NOT EXISTS user_exclusions (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reason VARCHAR(50) DEFAULT 'rejected',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, target_id)
);

-- ========================================
-- 3. Scores
-- ========================================
CREATE TABLE IF NOT EXISTS scores (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    total_score SMALLINT CHECK (total_score BETWEEN 0 AND 100),
    personality SMALLINT CHECK (personality BETWEEN 0 AND 100),
    communication SMALLINT CHECK (communication BETWEEN 0 AND 100),
    emotional SMALLINT CHECK (emotional BETWEEN 0 AND 100),
    confidence SMALLINT CHECK (confidence BETWEEN 0 AND 100)
);

-- ========================================
-- 4. Match Requests
-- ========================================
CREATE TABLE IF NOT EXISTS match_requests (
    id SERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- ========================================
-- 5. Matches
-- ========================================
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user1_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    user2_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- ========================================
-- 6. Messages
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, sent_at);

--user images table

CREATE TABLE IF NOT EXISTS user_images (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  object_name  TEXT    NOT NULL,         -- e.g. user/123/5f1a...jpg
  public_url   TEXT,                     -- optional, if bucket is public
  is_primary   BOOLEAN DEFAULT FALSE,
  uploaded_at  TIMESTAMP DEFAULT NOW()
);

-- speed up common queries
CREATE INDEX IF NOT EXISTS idx_user_images_user ON user_images(user_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_images_primary ON user_images(user_id, is_primary);


-- ========================================
-- 7. Data Seeding
-- ========================================

-- Users
INSERT INTO users (name, email, password_hash, gender, age, city) VALUES
('Ravi Sharma', 'ravi@example.com', '$2a$10$yJxhLh...', 'M', 26, 'Mumbai'),
('Amit Verma', 'amit@example.com', '$2a$10$yJxhLh...', 'M', 28, 'Delhi'),
('Karan Mehta', 'karan@example.com', '$2a$10$yJxhLh...', 'M', 24, 'Bangalore'),
('Aditi Singh', 'aditi@example.com', '$2a$10$yJxhLh...', 'F', 25, 'Pune'),
('Priya Patel', 'priya@example.com', '$2a$10$yJxhLh...', 'F', 23, 'Delhi'),
('Sneha Nair', 'sneha@example.com', '$2a$10$yJxhLh...', 'F', 27, 'Bangalore');

-- Scores
INSERT INTO scores (user_id, personality, communication, emotional, confidence, total_score) VALUES
(1,80,82,85,83,83),
(2,78,75,80,79,78),
(3,85,88,82,90,86),
(4,90,92,91,89,91),
(5,87,85,84,83,85),
(6,75,80,79,78,78);

-- Exclusions
INSERT INTO user_exclusions (user_id, target_id, reason) VALUES
(1,6,'blocked'),
(2,4,'rejected');

-- Match Requests
INSERT INTO match_requests (sender_id, receiver_id, status) VALUES
(1,4,'pending'),
(5,2,'accepted');

-- Matches
INSERT INTO matches (user1_id, user2_id) VALUES
(2,5);

-- Messages
INSERT INTO messages (match_id, sender_id, body) VALUES
(1,2,'Hey Priya! How’s your day going?'),
(1,5,'Hey Amit! Doing great, just got back from work 😊'),
(1,2,'Nice! Any weekend plans?');
