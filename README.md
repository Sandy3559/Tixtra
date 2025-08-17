# 🎫 Tixtra - AI-Powered Ticket Management System

A smart, modern ticket management system that uses AI to automatically categorize, prioritize, and assign support tickets to the most appropriate moderators.

![Tixtra Banner](https://via.placeholder.com/1200x300/6366f1/ffffff?text=Tixtra+-+AI-Powered+Ticket+Management)

## ✨ Features

### 🤖 AI-Powered Processing
- **Smart Ticket Analysis**: Automatic categorization and priority assignment using Google Gemini AI
- **Skill-Based Assignment**: AI matches tickets to moderators based on required skills
- **Helpful Notes Generation**: AI provides detailed technical guidance for moderators
- **Automated Workflows**: Background processing with Inngest for scalable operations

### 👥 User Management
- **Role-Based Access Control**: User, Moderator, and Admin roles with different permissions
- **Skill Management**: Moderators can have specific technical skills for better ticket routing
- **JWT Authentication**: Secure authentication with token-based system
- **Profile Management**: User profiles with skills and role management

### 🎯 Advanced Ticket Features
- **Real-time Status Updates**: Track tickets through TODO → IN_PROGRESS → COMPLETED
- **Priority Management**: High, Medium, Low priority with visual indicators
- **Smart Filtering**: Search and filter by status, priority, assignee
- **Rich Analytics**: Comprehensive statistics and reporting
- **Email Notifications**: Automated notifications for all stakeholders

### 🎨 Modern UI/UX
- **Beautiful Interface**: Modern design with DaisyUI and Tailwind CSS
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Themes**: Multiple theme support
- **Interactive Components**: Smooth animations and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt hashing
- **Background Jobs**: Inngest for event-driven architecture
- **AI Integration**: Google Gemini API for intelligent processing
- **Email**: Nodemailer with Mailtrap for development
- **Development**: Nodemon for hot reloading

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS + DaisyUI components
- **Icons**: Heroicons for consistent iconography
- **Markdown**: React Markdown for rich content rendering
- **State Management**: React Hooks (useState, useEffect)

### DevOps & Infrastructure
- **Environment**: Docker-ready with env-based configuration
- **API**: RESTful API with proper HTTP status codes
- **Error Handling**: Comprehensive error boundaries and logging
- **Performance**: Optimized queries with MongoDB indexes
- **Security**: Input validation, CORS, and secure headers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Google Gemini API key
- Mailtrap account (for email testing)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Sandy3559/Tixtra.git
cd tixtra

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/tixtra
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tixtra

# JWT Secret (use a strong, random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration (Mailtrap for development)
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=587
MAILTRAP_SMTP_USER=your-mailtrap-user
MAILTRAP_SMTP_PASS=your-mailtrap-password

# Inngest Configuration
INNGEST_SIGNING_KEY=your-inngest-signing-key
INNGEST_EVENT_KEY=your-inngest-event-key
```

Create `.env` file in the frontend directory:

```env
VITE_SERVER_URL=http://localhost:3000/api
```

### 3. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start Development Servers

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev

# Terminal 3 - Start Inngest dev server (in backend directory)
cd backend
npm run inngest-dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Inngest Dashboard**: http://localhost:8288

## 👤 Demo Accounts

For testing purposes, you can create these demo accounts:

| Role | Email | Password | Skills |
|------|-------|----------|---------|
| Admin | admin@demo.com | demo123 | System Administration |
| Moderator | mod@demo.com | demo123 | React, Node.js, JavaScript |
| User | user@demo.com | demo123 | - |

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/users` - Get all users (Admin only)
- `POST /api/auth/update-user` - Update user role/skills (Admin only)

### Ticket Endpoints
- `GET /api/tickets` - Get user's tickets
- `GET /api/tickets/stats` - Get ticket statistics
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id/status` - Update ticket status
- `PATCH /api/tickets/:id/assign` - Reassign ticket
- `PATCH /api/tickets/:id/priority` - Update priority

## 🔄 Ticket Processing Workflow

1. **Ticket Creation**
   - User submits ticket with title and description
   - System creates initial record with TODO status
   - Inngest event `ticket/created` is triggered

2. **AI Analysis** (Automatic)
   - Gemini AI analyzes ticket content
   - Determines required skills and priority level
   - Generates helpful technical notes
   - Updates ticket with AI recommendations

3. **Smart Assignment** (Automatic)
   - System searches for moderators with matching skills
   - Uses regex-based skill matching algorithm
   - Falls back to admin if no suitable moderator found
   - Updates ticket assignment

4. **Notifications** (Automatic)
   - Email sent to assigned moderator
   - Includes ticket details and AI-generated guidance
   - Creator notified of processing completion

5. **Status Management** (Manual/Automatic)
   - Moderators update status: TODO → IN_PROGRESS → COMPLETED
   - Email notifications sent on status changes
   - Analytics and metrics tracked

## 🎨 UI Components

### Dashboard Features
- **Statistics Cards**: Real-time metrics with beautiful gradients
- **Advanced Filtering**: Search, status, and priority filters
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions

### Ticket Management
- **Rich Detail View**: Comprehensive ticket information
- **AI Analysis Display**: Markdown-rendered AI recommendations
- **Status Timeline**: Visual progress tracking
- **Quick Actions**: One-click status updates and assignments

### Admin Panel
- **User Management**: Role and skill assignment
- **Real-time Search**: Instant user filtering
- **Bulk Operations**: Efficient user management tools
- **System Statistics**: Comprehensive analytics dashboard

## 🔧 Development

### Code Structure

```
tixtra/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── models/              # Database schemas
│   ├── routes/              # API route definitions
│   ├── middlewares/         # Custom middleware
│   ├── inngest/             # Background job functions
│   ├── utils/               # Utility functions
│   └── index.js             # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Frontend utilities
│   │   └── main.jsx         # App entry point
│   └── index.html
└── README.md
```

### Best Practices Implemented
- **Error Boundaries**: Comprehensive error handling
- **Input Validation**: Server and client-side validation
- **Security**: CORS, input sanitization, secure headers
- **Performance**: Optimized queries, lazy loading, caching
- **Accessibility**: ARIA labels, keyboard navigation
- **Testing Ready**: Modular architecture for easy testing

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGO_URI=your-production-mongodb-url
JWT_SECRET=your-production-jwt-secret
GEMINI_API_KEY=your-production-gemini-key
```

### Build and Deploy
```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
# Deploy these static files to your CDN/hosting service

# Deploy backend to your server (Railway, Vercel, Heroku, etc.)
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PRs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini**: AI processing capabilities
- **Inngest**: Event-driven architecture
- **DaisyUI**: Beautiful UI components
- **Heroicons**: Consistent iconography
- **MongoDB**: Flexible data storage
- **React**: Modern frontend framework

<div align="center">
  <p>Made with ❤️ by the Tixtra Team</p>
  <p>
    <a href="https://github.com/Sandy3559/Tixtra">⭐ Star this repo</a> •
    <a href="https://github.com/Sandy3559/Tixtra/issues">🐛 Report Bug</a> •
    <a href="https://github.com/Sandy3559/Tixtra/issues">✨ Request Feature</a>
  </p>
</div>
