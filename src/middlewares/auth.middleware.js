const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Checks if user is approved
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'No token provided, authorization denied', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Find user by id
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Check if user is approved (except for super admin)
        if (user.role !== 'super_admin' && user.status !== 'approved') {
            return errorResponse(res, 'Account not approved. Please wait for admin approval.', 403);
        }

        // Check if center is active for center_admin
        if (user.role === 'center_admin' && user.centerId) {
            const Center = require('../models/Center');
            const center = await Center.findById(user.centerId);

            if (!center || !center.isActive) {
                return errorResponse(res, 'Your center has been deactivated. Contact support.', 403);
            }
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token expired', 401);
        }
        return errorResponse(res, 'Authentication failed', 401);
    }
};

module.exports = authenticate;
