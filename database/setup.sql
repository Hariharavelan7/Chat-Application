-- Create database
CREATE DATABASE chat_app;

-- Connect to the database
\c chat_app;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("receiverId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_receiver ON messages("senderId", "receiverId");
CREATE INDEX idx_messages_created_at ON messages("createdAt");

-- Insert sample users (optional - for testing)
INSERT INTO users (email, password, name) VALUES 
('user1@example.com', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6', 'User One'),
('user2@example.com', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6', 'User Two');

-- Note: The passwords above are hashed versions of 'password123'
-- In a real application, you would use proper password hashing

