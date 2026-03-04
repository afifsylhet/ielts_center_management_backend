require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts_center_management',
    jwtSecret: process.env.JWT_SECRET || 'default_secret_change_this',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']
};
