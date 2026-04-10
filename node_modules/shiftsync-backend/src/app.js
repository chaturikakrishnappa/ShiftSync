const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const dbCheck = require('./middleware/dbCheck');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shiftRoutes = require('./routes/shifts');
const attendanceRoutes = require('./routes/attendance');
const requestRoutes = require('./routes/requests');
const noticeRoutes = require('./routes/notices');
const healthRoutes = require('./routes/health');

const app = express();

// 1. ENVIRONMENT & ORIGIN SETUP
const isProd = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

// 2. CORS CONFIGURATION (MUST be before routes)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || !isProd) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204 // Standard for preflight success
};

app.use(cors(corsOptions));

// 3. EXPLICIT OPTIONS PREFLIGHT HANDLER (Global fallback)
app.options('*', cors(corsOptions));

// 4. STANDARD MIDDLEWARE
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(isProd ? 'combined' : 'dev'));

// 5. API ROUTES
app.use('/api/health', healthRoutes);

// Database availability check for all subsequent API routes
app.use(dbCheck);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notices', noticeRoutes);

// 6. ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;
