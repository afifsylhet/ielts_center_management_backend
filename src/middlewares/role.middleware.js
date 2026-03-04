const { errorResponse } = require('../utils/response');

/**
 * Role-based Authorization Middleware
 * Checks if authenticated user has required role(s)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'User not authenticated', 401);
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(
                res,
                `Access denied. Required role: ${roles.join(' or ')}`,
                403
            );
        }

        next();
    };
};

/**
 * Middleware to ensure data isolation for center admins
 * Automatically adds centerId filter to queries
 */
const enforceDataIsolation = (req, res, next) => {
    if (req.user.role === 'center_admin') {
        // Attach centerId to request body and query params
        req.centerId = req.user.centerId;

        // For POST/PUT requests, ensure centerId is set
        if (req.body) {
            req.body.centerId = req.user.centerId;
        }
    }

    next();
};

module.exports = {
    authorize,
    enforceDataIsolation
};
