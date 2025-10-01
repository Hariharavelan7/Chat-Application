# Chat Application

A real-time chat application built with Angular frontend and NestJS backend, featuring user authentication and Socket.IO for real-time messaging.

## Features

- **User Authentication**: Register and login with email/password
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Management**: View and select other users to chat with
- **Responsive Design**: Modern UI with Bootstrap styling
- **Database Integration**: PostgreSQL for data persistence

## Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM (Database ORM)
- PostgreSQL (Database)
- Socket.IO (Real-time communication)
- JWT (Authentication)
- bcryptjs (Password hashing)

### Frontend
- Angular 16
- Socket.IO Client
- Bootstrap 5
- RxJS (Reactive programming)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## Installation & Setup

### 1. Database Setup

First, set up PostgreSQL database:

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE chat_app;
\q

# Run database setup script
psql -U postgres -d chat_app -f database/setup.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Update database configuration in src/app.module.ts if needed
# (Default: username: 'postgres', password: 'password', database: 'chat_app')

# Start the backend server
npm run start:dev
```

The backend will run on http://localhost:3000

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

The frontend will run on http://localhost:4200

## Usage

### Step 1: Registration
1. Open http://localhost:4200 in your browser
2. Click "Need an account? Register"
3. Fill in your name, email, and password
4. Click "Register"

### Step 2: Login
1. After registration, you'll be redirected to the login page
2. Enter your email and password
3. Click "Login"

### Step 3: Chat
1. After login, you'll see the chat interface
2. Select a user from the user list to start chatting
3. Type your message and press Enter or click Send
4. Messages will appear in real-time

### Step 4: Testing with Multiple Users
1. Open two browser tabs at http://localhost:4200
2. Register/login with different accounts in each tab
3. Send messages from one tab - they'll instantly appear in the other

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

### Chat
- `GET /users` - Get all users
- `GET /messages/:userId1/:userId2` - Get messages between two users

### WebSocket Events
- `join` - Join chat room
- `sendMessage` - Send a message
- `getMessages` - Get message history
- `newMessage` - Receive new message
- `messageSent` - Message sent confirmation

## Project Structure

```
chat-applictaion/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── chat/           # Chat module with Socket.IO
│   │   ├── entities/       # Database entities
│   │   └── main.ts         # Application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/       # Authentication component
│   │   │   ├── chat/       # Chat component
│   │   │   ├── services/   # API services
│   │   │   └── guards/     # Route guards
│   │   └── styles.scss     # Global styles
│   └── package.json
├── database/
│   ├── setup.sql          # Database schema
│   └── README.md          # Database setup instructions
└── README.md              # This file
```

## Configuration

### Backend Configuration
Update `backend/src/app.module.ts` for database connection:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'chat_app',
  entities: [User, Message],
  synchronize: true, // Set to false in production
}),
```

### Frontend Configuration
Update `frontend/src/app/services/auth.service.ts` and `chat.service.ts` for API URL:
```typescript
private apiUrl = 'http://localhost:3000'; // Backend URL
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `app.module.ts`
   - Verify database exists

2. **CORS Error**
   - Backend CORS is configured for `http://localhost:4200`
   - Ensure frontend is running on the correct port

3. **Socket.IO Connection Issues**
   - Check if backend is running on port 3000
   - Verify Socket.IO configuration in both frontend and backend

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret in backend
   - Verify password hashing

## Development

### Backend Development
```bash
cd backend
npm run start:dev  # Watch mode
npm run build      # Build for production
npm run start      # Start production build
```

### Frontend Development
```bash
cd frontend
npm start          # Development server
npm run build      # Build for production
npm run test       # Run tests
```

## Production Deployment

1. Set `synchronize: false` in TypeORM configuration
2. Use environment variables for sensitive data
3. Build frontend: `npm run build`
4. Use PM2 or similar for backend process management
5. Configure reverse proxy (nginx) for production

## License

This project is for educational purposes.

