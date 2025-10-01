# Database Setup for Chat Application

## PostgreSQL Installation and Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**CentOS/RHEL:**
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE chat_app;

# Create user (optional - you can use default postgres user)
CREATE USER chat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chat_app TO chat_user;

# Exit psql
\q
```

### 3. Run Database Setup Script

```bash
# Run the setup script
psql -U postgres -d chat_app -f database/setup.sql
```

### 4. Update Backend Configuration

Update the database configuration in `backend/src/app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres', // or your username
  password: 'your_password', // your actual password
  database: 'chat_app',
  entities: [User, Message],
  synchronize: true, // Set to false in production
}),
```

## Database Schema

### Users Table
- `id`: Primary key (auto-increment)
- `email`: Unique email address
- `password`: Hashed password
- `name`: User's display name
- `createdAt`: Timestamp when user was created

### Messages Table
- `id`: Primary key (auto-increment)
- `content`: Message content
- `senderId`: Foreign key to users table
- `receiverId`: Foreign key to users table
- `createdAt`: Timestamp when message was sent

## Useful Queries

### View all users
```sql
SELECT id, email, name, "createdAt" FROM users;
```

### View messages between two users
```sql
SELECT m.*, s.name as sender_name, r.name as receiver_name
FROM messages m
JOIN users s ON m."senderId" = s.id
JOIN users r ON m."receiverId" = r.id
WHERE (m."senderId" = 1 AND m."receiverId" = 2) 
   OR (m."senderId" = 2 AND m."receiverId" = 1)
ORDER BY m."createdAt" ASC;
```

### Count messages per user
```sql
SELECT u.name, COUNT(m.id) as message_count
FROM users u
LEFT JOIN messages m ON u.id = m."senderId"
GROUP BY u.id, u.name
ORDER BY message_count DESC;
```

### Recent messages (last 24 hours)
```sql
SELECT m.*, s.name as sender_name, r.name as receiver_name
FROM messages m
JOIN users s ON m."senderId" = s.id
JOIN users r ON m."receiverId" = r.id
WHERE m."createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY m."createdAt" DESC;
```

