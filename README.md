# 🎓 University Admission System - Backend API

## 📋 Introduction

This is the backend API for the University Admission System of Ho Chi Minh City University of Technology and Education (HCMUTE), developed with Node.js and Express.js. The system provides a robust REST API with real-time chat capabilities, supporting a complete online admission process with role-based access control for Students, Reviewers and Administrators.

## ✨ Key Features

### 🔐 Authentication & Authorization:
- **JWT-based Authentication**: Secure token-based authentication system
- **Google OAuth Integration**: Sign-in with Google accounts
- **Role-based Access Control**: Three user roles (student, reviewer, admin)
- **Password Management**: Secure password hashing with bcrypt
- **OTP Verification**: Email-based OTP for registration and password reset

### 👨‍🎓 Student Management:
- **User Registration**: Multi-step registration with email verification
- **Profile Management**: Complete student profile with personal information
- **Academic Records**: Learning process and transcript management
- **Photo Upload**: ID photo upload with Cloudinary integration
- **Admission Wishes**: Multiple major preference registration with CRUD operations
- **Wish Management**: Add, update, delete, and view admission wishes
- **PDF Export**: Export admission wish registration form to PDF

### 👩‍💼 Reviewer Features:
- **Application Review**: Review and approve/reject student applications
- **Document Verification**: Access to student documents and transcripts
- **Bulk Operations**: Mass approval and filtering capabilities
- **Status Management**: Track application processing status

### 🔧 Administrative Functions:
- **System Configuration**: Manage admission years, criteria, quotas
- **Major Management**: Configure available majors and requirements
- **User Management**: Admin panel for user oversight
- **Statistics & Reports**: Real-time statistics and data export
- **Chat Support**: Real-time chat system for student support

### 💬 Real-time Features:
- **Socket.IO Integration**: Real-time chat and notifications
- **Live Status Updates**: Online/offline user status tracking
- **Message Delivery**: Read receipts and typing indicators
- **Notification System**: Real-time system notifications

## 🛠️ Technology Stack

### Core Technologies:
- **Node.js**: JavaScript runtime environment
- **Express.js 5.1.0**: Web application framework
- **Socket.IO 4.8.1**: Real-time bidirectional event-based communication

### Database & ORM:
- **MySQL2 3.14.1**: MySQL database driver
- **Sequelize 6.37.7**: Promise-based Node.js ORM
- **Redis (IORedis 5.6.1)**: Caching and session management

### Authentication & Security:
- **JSON Web Token 9.0.2**: JWT token implementation
- **Bcrypt 5.1.1**: Password hashing library
- **Passport 0.7.0**: Authentication middleware
- **Passport Google OAuth20**: Google authentication strategy

### File Upload & Storage:
- **Multer 1.4.5**: Multipart form data handling
- **Cloudinary 1.41.3**: Cloud-based image and video management
- **Multer Storage Cloudinary**: Cloudinary storage engine for Multer

### PDF Generation:
- **Puppeteer**: Headless Chrome for PDF generation
- **HTML-PDF**: Convert HTML templates to PDF documents
- **PDFKit**: JavaScript PDF generation library

### Email & Communication:
- **Nodemailer 7.0.2**: Email sending capability
- **Crypto & Crypto-JS**: Encryption and security utilities

### Development & Utilities:
- **Nodemon 3.1.10**: Development server with auto-restart
- **Node-Cron 3.0.3**: Scheduled task execution
- **Faker 6.6.6**: Generate fake data for testing
- **Dotenv 16.5.0**: Environment variable management
- **CORS 2.8.5**: Cross-Origin Resource Sharing

## 📁 Project Structure

```
TLCN_backend/
├── config/
│   ├── db.js                    # MySQL database configuration
│   ├── passport.js              # Passport authentication strategies
│   └── cloudinary.js            # Cloudinary configuration
├── controllers/
│   ├── userController.js        # User management operations
│   ├── adbController.js         # Admission blocks controller
│   ├── admController.js         # Admission majors controller
│   ├── adyController.js         # Admission years controller
│   ├── adcController.js         # Admission criteria controller
│   ├── adrController.js         # Admission regions controller
│   ├── adoController.js         # Admission objects controller
│   ├── adqController.js         # Admission quantities controller
│   ├── adiController.js         # Admission information controller
│   ├── adwController.js         # Admission wishes controller
│   ├── photoIDController.js     # Photo upload management
│   ├── transcriptController.js  # Academic transcript management
│   ├── learningProcessController.js # Learning progress tracking
│   ├── chatController.js        # Real-time chat functionality
│   ├── notificationController.js # System notifications
│   ├── statisticsSnapshotController.js # Statistics and reports
│   ├── permissionController.js  # Role and permission management
│   ├── subjectController.js     # Academic subjects management
│   ├── loginController.js       # Authentication logic
│   └── uploadImage.js           # Image upload handling
├── models/
│   ├── user.js                  # User model definition
│   ├── admissionYear.js         # Admission year configuration
│   ├── admissionMajor.js        # Academic majors model
│   ├── admissionBlock.js        # Admission blocks (exam groups)
│   ├── admissionCriteria.js     # Admission criteria model
│   ├── admissionRegion.js       # Geographic regions model
│   ├── admissionObject.js       # Admission target groups
│   ├── admissionQuantity.js     # Admission quotas model
│   ├── admissionInfomation.js   # Student admission info
│   ├── admissionWishes.js       # Student preferences model
│   ├── photoID.js               # Student photo model
│   ├── Transcript.js            # Academic transcript model
│   ├── Score.js                 # Individual subject scores
│   ├── Subject.js               # Academic subjects model
│   ├── learningProcess.js       # Learning progress model
│   ├── chatMessage.js           # Chat messages model
│   ├── notification.js          # System notifications model
│   ├── statisticsSnapshot.js    # Statistics snapshots model
│   ├── admissionYearConfig.js   # Yearly admission settings
│   └── associations.js          # Model relationships
├── routes/
│   ├── userRoutes.js            # User management endpoints
│   ├── adbRoutes.js             # Admission blocks routes
│   ├── admRoutes.js             # Admission majors routes
│   ├── adyRoutes.js             # Admission years routes
│   ├── adcRoutes.js             # Admission criteria routes
│   ├── adrRoutes.js             # Admission regions routes
│   ├── adoRoutes.js             # Admission objects routes
│   ├── adqRoutes.js             # Admission quantities routes
│   ├── adiRoutes.js             # Admission information routes
│   ├── adwRoutes.js             # Admission wishes routes
│   ├── photoRoutes.js           # Photo upload routes
│   ├── transcriptRoutes.js      # Transcript management routes
│   ├── learningPRoutes.js       # Learning process routes
│   ├── chatRoutes.js            # Chat functionality routes
│   ├── notificationRoutes.js    # Notification routes
│   ├── statisticsSnapshotRoutes.js # Statistics routes
│   ├── permissionRoutes.js      # Permission management routes
│   ├── subjectRoutes.js         # Subject management routes
│   ├── authRoutes.js            # Authentication routes
│   ├── jwtRoutes.js             # JWT verification routes
│   └── uploadRoutes.js          # File upload routes
├── services/
│   ├── userService.js           # User business logic
│   ├── admissionWishService.js  # Wish processing logic
│   ├── admissionYearService.js  # Year configuration logic
│   ├── admissionMajorService.js # Major management logic
│   ├── admissionInformationService.js # Student info logic
│   ├── transcriptService.js     # Transcript processing
│   ├── photoIDService.js        # Photo management logic
│   ├── learningProcessService.js # Learning progress logic
│   ├── statisticsSnapshotService.js # Statistics generation
│   ├── socketService.js         # Real-time chat service
│   ├── permissionService.js     # Permission management
│   ├── loginService.js          # Authentication service
│   ├── fileService.js           # File handling service
│   └── [other services...]      # Additional business logic
├── middleware/
│   ├── auth.js                  # Basic authentication middleware
│   └── authMiddleware.js        # Advanced auth middleware
├── utils/
│   └── ApiError.js              # Custom error handling
├── scripts/
│   └── seedSubjects.js          # Database seeding script
├── app.js                       # Express application setup
├── server.js                    # Server initialization
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

## 🚀 Installation and Setup

### System Requirements:
- Node.js >= 16.0.0
- MySQL >= 8.0
- Redis Server (optional, for caching)

### Step 1: Clone repository
```bash
git clone <repository-url>
cd TLCN_backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=admission_system
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Configuration
PORT=8080
NODE_ENV=development

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

### Step 4: Setup MySQL Database
```sql
CREATE DATABASE admission_system;
CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_db_password';
GRANT ALL PRIVILEGES ON admission_system.* TO 'your_db_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 5: Run the application
```bash
# Development mode with nodemon (recommended)
nodemon server.js

# Alternative: Production mode
node server.js
```

The server will start at: `http://localhost:8080`

## 🔐 Authentication System

### JWT Token Structure:
- **Access Token**: Short-lived token for API access
- **Refresh Token**: Long-lived token for token renewal
- **Token Verification**: Middleware for protected routes

### User Roles:
- **student**: Students applying for admission
- **reviewer**: Admission officers reviewing applications
- **admin**: System administrators with full access

### Protected Routes:
All API endpoints except authentication routes require valid JWT tokens in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📋 API Endpoints

### Authentication Routes (`/api/auth/`)
```
POST   /api/auth/login              # User login
POST   /api/auth/register           # User registration
POST   /api/auth/google             # Google OAuth login
POST   /api/auth/refresh            # Refresh JWT token
POST   /api/auth/logout             # User logout
```

### User Management (`/api/users/`)
```
GET    /api/users                   # Get all users (admin only)
GET    /api/users/:userId           # Get user by ID
PUT    /api/users/:userId           # Update user information
DELETE /api/users/:userId           # Delete user (admin only)
POST   /api/users/send-otp          # Send OTP for verification
POST   /api/users/verify-otp        # Verify OTP
POST   /api/users/reset-password    # Reset password with OTP
PUT    /api/users/:userId/password  # Change password
```

### Admission Management
```
# Admission Years
GET    /api/admissionYear           # Get admission years
POST   /api/admissionYear           # Create admission year (admin)
PUT    /api/admissionYear/:id       # Update admission year (admin)
DELETE /api/admissionYear/:id       # Delete admission year (admin)

# Admission Majors
GET    /api/adms                    # Get all majors
POST   /api/adms                    # Create major (admin)
PUT    /api/adms/:id                # Update major (admin)
DELETE /api/adms/:id                # Delete major (admin)

# Admission Blocks (Exam Groups)
GET    /api/adbs                    # Get all blocks
POST   /api/adbs                    # Create block (admin)
PUT    /api/adbs/:id                # Update block (admin)
DELETE /api/adbs/:id                # Delete block (admin)

# Other admission entities follow similar patterns...
```

### Student Information (`/api/adis/`)
```
GET    /api/adis/:userId            # Get student admission info
POST   /api/adis                    # Create admission info
PUT    /api/adis/:userId            # Update admission info
DELETE /api/adis/:userId            # Delete admission info
```

### Admission Wishes (`/api/wish/`)
```
GET    /api/wish/form-data          # Get wish form data with validation
POST   /api/wish/add                # Submit admission wishes
DELETE /api/wish/delete/:wishId     # Delete specific wish
GET    /api/wish/getAll/:uId        # Get all wishes by user ID
GET    /api/wish/getAccepted        # Get accepted wishes (admin)
GET    /api/wish/export-pdf/:userId # Export user's wishes to PDF
PUT    /api/wish/filter             # Filter admission results (admin)
PUT    /api/wish/resetStatus        # Reset all wishes status (admin)
GET    /api/wish/getFilteredAccepted # Get filtered accepted wishes
GET    /api/wish/getFilterOptions   # Get filter options
GET    /api/wish/years              # Get admission years
```

### Academic Records
```
# Transcripts
GET    /api/transcripts/:userId     # Get user's transcript
POST   /api/transcripts             # Create transcript
PUT    /api/transcripts/:id         # Update transcript
DELETE /api/transcripts/:id         # Delete transcript

# Learning Process
GET    /api/learning/:userId        # Get learning process
POST   /api/learning                # Create learning record
PUT    /api/learning/:id            # Update learning record
```

### File Upload (`/api/`)
```
POST   /api/upload/image            # Upload single image
POST   /api/upload/multiple         # Upload multiple files
POST   /api/photo/:userId           # Upload student ID photo
```

### Chat System (`/api/chat/`)
```
GET    /api/chat/rooms              # Get user's chat rooms
GET    /api/chat/messages/:roomId   # Get chat messages
POST   /api/chat/message            # Send message
PUT    /api/chat/message/:id        # Update message
DELETE /api/chat/message/:id        # Delete message
```

### Statistics (`/api/snapshots/`)
```
GET    /api/snapshots               # Get statistics snapshots
POST   /api/snapshots/generate      # Generate new snapshot (admin)
GET    /api/snapshots/current       # Get current statistics
```

### Permissions (`/api/permissions/`)
```
GET    /api/permissions             # Get all permissions
POST   /api/permissions             # Create permission (admin)
PUT    /api/permissions/:id         # Update permission (admin)
DELETE /api/permissions/:id         # Delete permission (admin)
```

## 🔧 Real-time Features (Socket.IO)

### Connection & Authentication:
```javascript
// Client connection with JWT token
const socket = io('http://localhost:8080', {
    auth: {
        token: 'your_jwt_token'
    }
});
```

### Chat Events:
```javascript
// Join a chat room
socket.emit('join_room', roomId);

// Send a message
socket.emit('send_message', {
    roomId: 'room_123',
    content: 'Hello!',
    senderId: userId,
    receiverId: receiverId
});

// Listen for new messages
socket.on('receive_message', (message) => {
    console.log('New message:', message);
});

// Handle typing indicators
socket.emit('typing', { roomId: 'room_123', isTyping: true });
socket.on('user_typing', (data) => {
    console.log('User typing:', data);
});
```

### Notification Events:
```javascript
// Listen for notifications
socket.on('new_message_notification', (notification) => {
    console.log('New notification:', notification);
});

// User status changes
socket.on('user_status_change', (status) => {
    console.log('User status changed:', status);
});
```

## 📊 Database Schema

### Key Models and Relationships:

#### User Model:
- **userId** (Primary Key)
- **name, email, password** (Basic info)
- **role** (student/reviewer/admin)
- **majorGroup** (JSON array for reviewer assignments)

#### Admission Information:
- Links to User model
- Contains detailed student information
- Connects to academic records

#### Academic Records:
- **Transcript** → **Scores** → **Subjects**
- **Learning Process** tracking
- **Photo ID** management

#### Admission System:
- **Admission Years** → **Majors** → **Blocks** → **Criteria**
- **Wishes** linking students to preferred majors
- **Quantities** and **Quotas** management

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Setup:
```bash
# Set environment to production
export NODE_ENV=production

# Start the server
node server.js

# Or with PM2 for production process management
pm2 start server.js --name "admission-backend"
```

### Docker Deployment:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Environment Variables for Production:
- Set secure JWT secrets
- Configure production database
- Enable HTTPS
- Set up proper CORS origins
- Configure Redis for session management

## 📈 Performance Optimization

### Database Optimization:
- **Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: Sequelize connection pool configuration
- **Query Optimization**: Efficient queries with proper joins

### Caching Strategy:
- **Redis Caching**: Cache frequently accessed data
- **Session Management**: Redis-based session storage
- **Response Caching**: Cache API responses where appropriate

### Security Measures:
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use Sequelize ORM
- **XSS Protection**: Proper data sanitization

## 🛠️ Development

### Code Structure:
- **MVC Pattern**: Separation of concerns
- **Service Layer**: Business logic abstraction
- **Middleware**: Authentication and validation
- **Error Handling**: Centralized error management

### Development Scripts:
```bash
# Start development server
nodemon server.js

# Alternative: Direct node execution
node server.js

# Check code style (if configured)
npm run lint

# Format code (if configured)
npm run format

# Database migrations (if configured)
npm run migrate

# Seed database (automatic on server start)
# Subjects are seeded automatically via seedSubjects.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Create a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Backend Developer**: Nguyễn Duy Sơn - Phạm Lê Thiên Phú
- **Database Design**: Nguyễn Duy Sơn - Phạm Lê Thiên Phú
- **API Design**: Nguyễn Duy Sơn - Phạm Lê Thiên Phú

---

*The product is a non-commercial graduation thesis developed by students at Ho Chi Minh City University of Technology and Education*

