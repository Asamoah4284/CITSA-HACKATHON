# Kola Hackathon Project

A full-stack marketplace application for artisans with frontend and backend separation.

## Project Structure

```
kola-hackathon/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   ├── public/       # Static assets
│   ├── styles/       # Global styles
│   └── scripts/      # Frontend scripts
├── Back-end/         # Express.js backend API
│   ├── routes/       # API routes
│   ├── models/       # Database models
│   ├── middleware/   # Express middleware
│   ├── scripts/      # Backend scripts
│   └── tests/        # Backend tests
└── package.json      # Root package.json for managing both projects
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run setup
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in the Back-end folder
   - Configure your MongoDB connection and other environment variables

3. **Seed the database:**
   ```bash
   npm run seed
   ```

### Development

**Run both frontend and backend in development mode:**
```bash
npm run dev
```

**Run only frontend:**
```bash
npm run dev:frontend
```

**Run only backend:**
```bash
npm run dev:backend
```

### Production

**Build frontend:**
```bash
npm run build
```

**Start both services:**
```bash
npm start
```

## Available Scripts

### Root Level Scripts
- `npm run dev` - Start both frontend and backend in development
- `npm run dev:frontend` - Start only frontend development server
- `npm run dev:backend` - Start only backend development server
- `npm run build` - Build frontend for production
- `npm run start` - Start both frontend and backend in production
- `npm run setup` - Install all dependencies for both projects
- `npm run clean` - Clean node_modules from both projects
- `npm run seed` - Seed the database with initial data
- `npm run seed:artisans` - Seed artisans data
- `npm run update:products` - Update products data

### Frontend Scripts (in frontend/ directory)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Scripts (in Back-end/ directory)
- `npm run dev` - Start with nodemon for development
- `npm start` - Start production server
- `npm run seed` - Seed database
- `npm run test` - Run tests

## API Endpoints

The backend runs on `http://localhost:5000` and provides the following main endpoints:

- `GET /public/artisans` - Get all artisans
- `GET /public/products` - Get all products
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /app/dashboard` - User dashboard
- `POST /app/orders` - Create order
- `GET /app/orders` - Get user orders

## Frontend Features

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Radix UI components
- Authentication system
- Marketplace functionality
- Cart management
- Order tracking
- Referral system

## Backend Features

- Express.js API
- MongoDB with Mongoose
- JWT authentication
- Rate limiting
- Input validation
- Referral system
- Order management
- Artisan profiles

## Environment Variables

### Backend (.env in Back-end/ folder)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
LANGFLOW_WEBHOOK_URL=your_webhook_url
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
