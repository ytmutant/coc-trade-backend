# Coc Trade Backend - Complete API Setup

## Overview
This is a complete Node.js backend API for the Coc Trade Clash of Clans marketplace with the following features:

- **User Authentication** (JWT-based)
- **Account & Clan Listings** (CRUD operations)
- **File Upload** (for account/clan images)
- **Database Integration** (MongoDB with Mongoose)
- **Security Features** (Rate limiting, CORS, validation)
- **RESTful API** design

## Project Structure
```
coc-trade-backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── models/
│   ├── User.js            # User model
│   ├── Account.js         # Account model
│   └── Clan.js            # Clan model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── accounts.js        # Account routes
│   ├── clans.js           # Clan routes
│   ├── users.js           # User management routes
│   └── contact.js         # Contact form routes
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── accountController.js
│   ├── clanController.js
│   └── contactController.js
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── upload.js          # File upload handling
│   └── validation.js      # Input validation
└── uploads/               # File storage directory
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 2. Installation
```bash
# Clone/download the backend files
cd coc-trade-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration
Edit the `.env` file with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/coctrade
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
UPI_ID=sagar.32@superyes
ADMIN_TELEGRAM=ytmutant
```

### 4. Database Setup
- Install MongoDB locally OR use MongoDB Atlas (cloud)
- Update MONGODB_URI in .env file
- Database will be created automatically when server starts

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/password` - Change password

### Accounts
- `GET /api/accounts` - Get all accounts (with filters)
- `GET /api/accounts/featured` - Get featured accounts
- `GET /api/accounts/:id` - Get single account
- `POST /api/accounts` - Create new account (auth required)
- `PUT /api/accounts/:id` - Update account (owner only)
- `DELETE /api/accounts/:id` - Delete account (owner only)

### Clans
- `GET /api/clans` - Get all clans (with filters)
- `GET /api/clans/featured` - Get featured clans
- `GET /api/clans/:id` - Get single clan
- `POST /api/clans` - Create new clan (auth required)
- `PUT /api/clans/:id` - Update clan (owner only)
- `DELETE /api/clans/:id` - Delete clan (owner only)

### Users
- `GET /api/users/dashboard` - Get user dashboard data
- `GET /api/users/stats` - Get user statistics

### Contact
- `POST /api/contact` - Submit contact form

### Health Check
- `GET /api/health` - API status check

## Key Features

### Security
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Helmet security headers

### Data Validation
- Email format validation
- Indian phone number validation
- Price range validation
- Town Hall level validation (1-20)
- Account type validation

### File Upload
- Image upload for accounts/clans
- File size limits (5MB)
- File type validation (images only)
- Secure file storage

### Database Features
- MongoDB with Mongoose ODM
- Indexed fields for better performance
- Data relationships (User -> Accounts/Clans)
- Auto-generated timestamps
- Virtual fields (commission calculation)

## Database Collections

### Users
- Basic info (name, email, phone)
- Authentication (hashed password)
- Role-based access (user/admin)
- Account activity tracking

### Accounts
- Clash of Clans account details
- Pricing (INR/USD with auto-conversion)
- Images and features
- Seller information
- Status tracking (pending/active/sold)

### Clans
- Clan information (level, members, league)
- Pricing and features
- Seller details
- Status management

## Integration with Frontend

### Authentication Flow
1. User registers/logs in via frontend
2. Backend returns JWT token
3. Frontend stores token and sends with API requests
4. Backend validates token for protected routes

### Data Flow
1. Frontend makes API calls to backend
2. Backend processes requests and interacts with database
3. Backend returns JSON responses
4. Frontend updates UI with received data

### File Upload
1. Frontend sends images with form data
2. Backend processes and stores files
3. File URLs returned to frontend
4. Images displayed in listings

## Deployment Options

### Local Development
- Run MongoDB locally
- Use nodemon for auto-restart
- Set NODE_ENV=development

### Production Deployment
- Use MongoDB Atlas (cloud database)
- Deploy to services like:
  - Heroku
  - DigitalOcean App Platform
  - AWS Elastic Beanstalk
  - Vercel
  - Railway

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/coctrade
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## Testing the API

### Using Postman or curl
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456","phone":"+919876543210"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get accounts (use token from login response)
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

1. **Setup Database**: Install MongoDB or create MongoDB Atlas account
2. **Configure Environment**: Update .env file with your settings
3. **Test API**: Use Postman to test all endpoints
4. **Update Frontend**: Modify frontend JavaScript to use API instead of localStorage
5. **Deploy**: Choose a hosting platform and deploy both frontend and backend

This backend provides a complete foundation for your Coc Trade marketplace with proper authentication, data validation, and security features.