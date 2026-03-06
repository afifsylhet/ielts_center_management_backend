const courseService = require('./courses.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Courses Controller
 * Handles course management operations
 */

/**
 * Create a new course
 * POST /courses
 */
const createCourse = async (req, res, next) => {
    try {
        const courseData = req.body;

        // Validate required fields
        if (!courseData.name) {
            return errorResponse(res, 'Course name is required', 400);
        }

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            courseData.centerId = req.user.centerId;
        } else if (!courseData.centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const course = await courseService.createCourse(courseData);

        return successResponse(res, 'Course created successfully', course, 201);
    } catch (error) {
        if (error.code === 11000) {
            return errorResponse(res, 'Course with this name or code already exists', 400);
        }
        next(error);
    }
};

/**
 * Get all courses (with pagination and filters)
 * GET /courses
 */
const getCourses = async (req, res, next) => {
    try {
        const centerId = req.user.role === 'center_admin' ? req.user.centerId : req.query.centerId;

        if (!centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const filters = {
            page: req.query.page,
            limit: req.query.limit,
            status: req.query.status,
            search: req.query.search
        };

        const result = await courseService.getCourses(centerId, filters);

        return successResponse(res, 'Courses fetched successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get active courses (for dropdowns)
 * GET /courses/active
 */
const getActiveCourses = async (req, res, next) => {
    try {
        const centerId = req.user.role === 'center_admin' ? req.user.centerId : req.query.centerId;

        if (!centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const courses = await courseService.getActiveCourses(centerId);

        return successResponse(res, 'Active courses fetched successfully', { courses });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single course
 * GET /courses/:id
 */
const getCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const centerId = req.user.role === 'center_admin' ? req.user.centerId : req.query.centerId;

        if (!centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const course = await courseService.getCourseById(id, centerId);

        return successResponse(res, 'Course fetched successfully', { course });
    } catch (error) {
        if (error.message === 'Course not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Update a course
 * PUT /courses/:id
 */
const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const centerId = req.user.role === 'center_admin' ? req.user.centerId : updateData.centerId;

        if (!centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        // Prevent changing centerId
        delete updateData.centerId;

        const course = await courseService.updateCourse(id, centerId, updateData);

        return successResponse(res, 'Course updated successfully', { course });
    } catch (error) {
        if (error.message === 'Course not found') {
            return errorResponse(res, error.message, 404);
        }
        if (error.code === 11000) {
            return errorResponse(res, 'Course with this name or code already exists', 400);
        }
        next(error);
    }
};

/**
 * Delete a course
 * DELETE /courses/:id
 */
const deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const centerId = req.user.role === 'center_admin' ? req.user.centerId : req.query.centerId;

        if (!centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        await courseService.deleteCourse(id, centerId);

        return successResponse(res, 'Course deleted successfully');
    } catch (error) {
        if (error.message === 'Course not found') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

module.exports = {
    createCourse,
    getCourses,
    getActiveCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
