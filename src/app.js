const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

const app = express();

// ==================== Security Middleware ====================
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// ==================== CORS Configuration ====================
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true
}));

// ==================== Request Parsing ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Logging ====================
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ==================== Root Route ====================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to IELTS Center Management API',
        version: '1.0.0',
        documentation: '/api/v1/health'
    });
});

// ==================== API Routes ====================
app.use('/api/v1', routes);

// ==================== Error Handling ====================
// 404 Not Found Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
