# Running Commands for Chat Application

## Prerequisites
Make sure you have the following installed:
- Node.js (v16 or higher)
- npm
- PostgreSQL

## Database Setup Commands

### 1. Install and Start PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Database
```bash
sudo -u postgres psql
CREATE DATABASE chat_app;
\q
```

### 3. Run Database Schema
```bash
psql -U postgres -d chat_app -f database/setup.sql
```

## Backend Commands

### 1. Navigate to Backend Directory
```bash
cd /var/www/html/chat-applictaion/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Backend Server
```bash
npm run start:dev
```

**Expected Output:**
```
[Nest] 12345  - 01/01/2024, 12:00:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/01/2024, 12:00:00 PM     LOG [InstanceLoader] AppModule dependencies initialized +15ms
[Nest] 12345  - 01/01/2024, 12:00:00 PM     LOG [NestApplication] Nest application successfully started +2ms
Backend server running on http://localhost:3000
```

The backend will be available at: **http://localhost:3000**

## Frontend Commands

### 1. Navigate to Frontend Directory
```bash
cd /var/www/html/chat-applictaion/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Server
```bash
npm start
```

**Expected Output:**
```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

✔ Compiled successfully.
```

The frontend will be available at: **http://localhost:4200**

## Complete Setup Sequence

### Terminal 1 - Database
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE chat_app;"

# Run schema
psql -U postgres -d chat_app -f /var/www/html/chat-applictaion/database/setup.sql
```

### Terminal 2 - Backend
```bash
cd /var/www/html/chat-applictaion/backend
npm install
npm run start:dev
```

### Terminal 3 - Frontend
```bash
cd /var/www/html/chat-applictaion/frontend
npm install
npm start
```

## Testing Commands

### 1. Test Backend API
```bash
# Test registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Frontend
1. Open http://localhost:4200 in browser
2. Register a new user
3. Open another tab at http://localhost:4200
4. Register another user
5. Send messages between the two tabs

## Troubleshooting Commands

### Check if ports are in use
```bash
# Check port 3000 (backend)
lsof -i :3000

# Check port 4200 (frontend)
lsof -i :4200

# Check port 5432 (PostgreSQL)
lsof -i :5432
```

### Kill processes on ports
```bash
# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Kill process on port 4200
kill -9 $(lsof -t -i:4200)
```

### Check PostgreSQL status
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Check PostgreSQL connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Check Node.js processes
```bash
# List all Node.js processes
ps aux | grep node

# Kill all Node.js processes
pkill -f node
```

## Production Commands

### Build Frontend
```bash
cd /var/www/html/chat-applictaion/frontend
npm run build
```

### Build Backend
```bash
cd /var/www/html/chat-applictaion/backend
npm run build
```

### Start Production Backend
```bash
cd /var/www/html/chat-applictaion/backend
npm run start:prod
```

## Environment Variables

Create `.env` file in backend directory:
```bash
# Backend .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=chat_app
JWT_SECRET=your-secret-key
```

## Quick Start Script

Create a startup script `start.sh`:
```bash
#!/bin/bash

echo "Starting Chat Application..."

# Start PostgreSQL
sudo systemctl start postgresql

# Start Backend
cd /var/www/html/chat-applictaion/backend
npm run start:dev &

# Wait a moment for backend to start
sleep 5

# Start Frontend
cd /var/www/html/chat-applictaion/frontend
npm start &

echo "Application started!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:4200"
```

Make it executable and run:
```bash
chmod +x start.sh
./start.sh
```

