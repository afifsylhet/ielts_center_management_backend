const teacherService = require('./teachers.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Teachers Controller
 * Handles teacher management operations
 */

/**
 * Create a new teacher
 * POST /teachers
 */
const createTeacher = async (req, res, next) => {
    try {
        const teacherData = req.body;

        // Validate required fields
        if (!teacherData.name || !teacherData.email || !teacherData.phone) {
            return errorResponse(res, 'Please provide all required fields (name, email, phone)', 400);
        }

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            teacherData.centerId = req.user.centerId;
        } else if (!teacherData.centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const teacher = await teacherService.createTeacher(teacherData);

        return successResponse(res, 'Teacher created successfully', teacher, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all teachers (with pagination and filters)
 * GET /teachers
 */
const getAllTeachers = async (req, res, next) => {
    try {
        const { status, courseId, page = 1, limit = 10, search } = req.query;

        const filters = {};

        // For center admin, only show their teachers
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        } else if (req.query.centerId) {
            filters.centerId = req.query.centerId;
        }

        if (status) filters.status = status;
        if (courseId) filters.courseId = courseId;
        if (search) filters.search = search;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await teacherService.getAllTeachers(filters, options);

        return successResponse(res, 'Teachers retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single teacher by ID
 * GET /teachers/:id
 */
const getTeacherById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Teacher ID is required', 400);
        }

        const teacher = await teacherService.getTeacherById(id, req.user);

        return successResponse(res, 'Teacher retrieved successfully', teacher);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a teacher
 * PATCH /teachers/:id
 */
const updateTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return errorResponse(res, 'Teacher ID is required', 400);
        }

        const teacher = await teacherService.updateTeacher(id, updateData, req.user);

        return successResponse(res, 'Teacher updated successfully', teacher);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a teacher
 * DELETE /teachers/:id
 */
const deleteTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Teacher ID is required', 400);
        }

        await teacherService.deleteTeacher(id, req.user);

        return successResponse(res, 'Teacher deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
};
