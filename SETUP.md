# Kola Hackathon Setup Guide

This project consists of a Next.js frontend and a Node.js backend that work together to provide a marketplace for African artisans.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- MongoDB (local or cloud)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd Back-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kola-hackathon
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env.local in the root directory
   echo "BACKEND_URL=http://localhost:5000" > .env.local
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   
   The frontend will be running on `http://localhost:3000`

## 📋 Features

### User Registration
- **Customer Registration**: Simple signup for customers to browse and purchase products
- **Artisan Registration**: Extended signup for artisans with business information

### Backend Models
- **User Model**: Supports both customer and artisan types with appropriate fields
- **Artisan Model**: Separate model for artisan-specific data
- **Product Model**: Products associated with artisans
- **Referral Model**: Referral system for the marketplace

### API Endpoints
- `POST /auth/register` - User registration (customer/artisan)
- `POST /auth/login` - User authentication
- `GET /public/artisans` - List artisans
- `GET /public/products` - List products
- `POST /app/referrals` - Create referrals (protected)

## 🔧 Configuration

### Backend Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time

### Frontend Environment Variables
- `BACKEND_URL`: Backend API URL (default: http://localhost:5000)

## 🗄️ Database Schema

### User Schema
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  userType: String (enum: ['customer', 'artisan']),
  points: Number (default: 0),
  // Artisan fields (only for userType: 'artisan')
  businessName: String,
  businessCategory: String,
  businessDescription: String,
  phone: String,
  country: String,
  city: String,
  website: String
}
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to platforms like Render, Heroku, or Railway
3. Update the frontend `BACKEND_URL` to point to your deployed backend

### Frontend Deployment
1. Set up environment variables
2. Deploy to Vercel, Netlify, or similar platforms
3. Ensure the backend URL is correctly configured

## 🧪 Testing

### Backend Tests
```bash
cd Back-end
npm test
```

### Database Seeding
```bash
cd Back-end
npm run seed
```

## 📝 API Documentation

### Registration Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "userType": "artisan",
  "businessName": "My Business",
  "businessCategory": "Arts & Crafts",
  "businessDescription": "Description of my business",
  "phone": "+1234567890",
  "country": "Nigeria",
  "city": "Lagos",
  "website": "https://mywebsite.com"
}
```

### Registration Response
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "artisan",
    "points": 0,
    "businessName": "My Business",
    "businessCategory": "Arts & Crafts",
    "country": "Nigeria",
    "city": "Lagos"
  },
  "token": "jwt_token_here"
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation and sanitization
- CORS protection
- Rate limiting

## 🎨 Frontend Features

- Responsive design with Tailwind CSS
- Form validation with error handling
- Loading states and user feedback
- TypeScript for type safety
- Modern UI components with shadcn/ui 