const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Auth Routes
 * All authentication-related endpoints
 */

// Public routes
router.post('/register-center', authController.registerCenter);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
