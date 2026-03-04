const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 */

/**
 * Register a new IELTS Center Admin
 * POST /auth/register-center
 */
const registerCenter = async (req, res, next) => {
    try {
        const { name, email, password, centerName, centerAddress, centerPhone, centerEmail, centerLogo } = req.body;

        // Validate required fields
        if (!name || !email || !password || !centerName || !centerAddress || !centerPhone || !centerEmail) {
            return errorResponse(res, 'Please provide all required fields', 400);
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email) || !emailRegex.test(centerEmail)) {
            return errorResponse(res, 'Please provide valid email addresses', 400);
        }

        // Validate password length
        if (password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters', 400);
        }

        const result = await authService.registerCenter({
            name,
            email,
            password,
            centerName,
            centerAddress,
            centerPhone,
            centerEmail,
            centerLogo
        });

        return successResponse(
            res,
            'Registration successful. Please wait for admin approval.',
            result,
            201
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Login user (Super Admin or Center Admin)
 * POST /auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return errorResponse(res, 'Please provide email and password', 400);
        }

        const result = await authService.login(email, password);

        return successResponse(res, 'Login successful', result);
    } catch (error) {
        // Handle specific authentication errors
        if (error.message === 'Invalid credentials') {
            return errorResponse(res, error.message, 401);
        }
        if (error.message.includes('not approved') || error.message.includes('rejected')) {
            return errorResponse(res, error.message, 403);
        }
        next(error);
    }
};

/**
 * Get current user profile
 * GET /auth/me
 */
const getCurrentUser = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        return successResponse(res, 'User retrieved successfully', user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerCenter,
    login,
    getCurrentUser
};
