const adminService = require('./admin.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Admin Controller
 * Handles Super Admin operations for center management
 */

/**
 * Get all centers with their admin users
 * GET /admin/centers
 */
const getAllCenters = async (req, res, next) => {
    try {
        const { status, isActive, page = 1, limit = 10 } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await adminService.getAllCenters(filters, options);

        return successResponse(res, 'Centers retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Approve a center and its admin
 * PATCH /admin/centers/:id/approve
 */
const approveCenter = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const result = await adminService.approveCenter(id);

        return successResponse(res, 'Center approved successfully', result);
    } catch (error) {
        if (error.message === 'Center not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Reject a center and its admin
 * PATCH /admin/centers/:id/reject
 */
const rejectCenter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!id) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const result = await adminService.rejectCenter(id, reason);

        return successResponse(res, 'Center rejected successfully', result);
    } catch (error) {
        if (error.message === 'Center not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Deactivate a center
 * PATCH /admin/centers/:id/deactivate
 */
const deactivateCenter = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const result = await adminService.deactivateCenter(id);

        return successResponse(res, 'Center deactivated successfully', result);
    } catch (error) {
        if (error.message === 'Center not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Activate a center
 * PATCH /admin/centers/:id/activate
 */
const activateCenter = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const result = await adminService.activateCenter(id);

        return successResponse(res, 'Center activated successfully', result);
    } catch (error) {
        if (error.message === 'Center not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Get center details by ID
 * GET /admin/centers/:id
 */
const getCenterDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const center = await adminService.getCenterDetails(id);

        return successResponse(res, 'Center details retrieved successfully', center);
    } catch (error) {
        if (error.message === 'Center not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

module.exports = {
    getAllCenters,
    getCenterDetails,
    approveCenter,
    rejectCenter,
    deactivateCenter,
    activateCenter
};
