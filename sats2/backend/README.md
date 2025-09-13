# Smart Attendance Tracking System - Backend API

## Overview
Node.js + Express backend API for the Smart Attendance Tracking System with real-time features using Socket.IO and MongoDB for data persistence.

## Features
- **JWT Authentication** - Secure user authentication and authorization
- **Real-time Updates** - Socket.IO for live attendance updates
- **Role-based Access** - Faculty, Class Incharge, HoD, Principal roles
- **RESTful API** - Clean API design following REST principles
- **Data Validation** - Input validation using express-validator
- **Security** - Helmet, CORS, rate limiting, and password hashing
- **MongoDB Integration** - Mongoose ODM for database operations

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, express-rate-limit

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Start MongoDB**
   \`\`\`bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   \`\`\`

4. **Run the Server**
   \`\`\`bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Attendance Management
- `POST /api/attendance/session` - Create attendance session
- `GET /api/attendance/session/:id` - Get session details
- `PUT /api/attendance/record/:id` - Update attendance record
- `POST /api/attendance/session/:id/submit` - Submit attendance

### Reports & Analytics
- `GET /api/reports/faculty/:id` - Faculty attendance reports
- `GET /api/reports/student/:id` - Student attendance summary
- `GET /api/reports/class/:id` - Class attendance analytics

## Socket.IO Events

### Client to Server
- `join-class` - Join class room for real-time updates
- `attendance-update` - Send attendance changes
- `session-status` - Update session status

### Server to Client
- `attendance-changed` - Broadcast attendance updates
- `session-status-changed` - Session status updates
- `session-started` - New session notification
- `session-completed` - Session completion notification

## Database Schema

### Collections
- **users** - Faculty and staff information
- **students** - Student records
- **departments** - Department information
- **sections** - Class sections
- **subjects** - Subject/course information
- **attendancesessions** - Attendance session records
- **attendancerecords** - Individual attendance entries

## Security Features
- Password hashing with bcryptjs (12 rounds)
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Development

### Running Tests
\`\`\`bash
npm test
\`\`\`

### Code Structure
\`\`\`
backend/
├── models/          # Mongoose schemas
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── config/          # Configuration files
└── server.js        # Main server file
\`\`\`

### Environment Variables
See `.env.example` for all required environment variables.

## Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure CORS for production domain
5. Set up process manager (PM2 recommended)

## API Documentation
Full API documentation available at `/api/docs` when server is running (Swagger/OpenAPI).
