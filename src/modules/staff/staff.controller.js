const staffService = require('./staff.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Staff Controller
 * Handles staff management operations
 */

/**
 * Create a new staff member
 * POST /staff
 */
const createStaff = async (req, res, next) => {
    try {
        const staffData = req.body;

        // Validate required fields
        if (!staffData.name || !staffData.email || !staffData.phone || !staffData.designation) {
            return errorResponse(res, 'Please provide all required fields (name, email, phone, designation)', 400);
        }

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            staffData.centerId = req.user.centerId;
        } else if (!staffData.centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const staff = await staffService.createStaff(staffData);

        return successResponse(res, 'Staff member created successfully', staff, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all staff (with pagination and filters)
 * GET /staff
 */
const getAllStaff = async (req, res, next) => {
    try {
        const { status, designation, page = 1, limit = 10, search } = req.query;

        const filters = {};

        // For center admin, only show their staff
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        } else if (req.query.centerId) {
            filters.centerId = req.query.centerId;
        }

        if (status) filters.status = status;
        if (designation) filters.designation = designation;
        if (search) filters.search = search;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await staffService.getAllStaff(filters, options);

        return successResponse(res, 'Staff retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single staff member by ID
 * GET /staff/:id
 */
const getStaffById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Staff ID is required', 400);
        }

        const staff = await staffService.getStaffById(id, req.user);

        return successResponse(res, 'Staff member retrieved successfully', staff);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a staff member
 * PATCH /staff/:id
 */
const updateStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return errorResponse(res, 'Staff ID is required', 400);
        }

        const staff = await staffService.updateStaff(id, updateData, req.user);

        return successResponse(res, 'Staff member updated successfully', staff);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a staff member
 * DELETE /staff/:id
 */
const deleteStaff = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Staff ID is required', 400);
        }

        await staffService.deleteStaff(id, req.user);

        return successResponse(res, 'Staff member deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff
};
