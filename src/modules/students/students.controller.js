const studentService = require('./students.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Students Controller
 * Handles student management operations
 */

/**
 * Create a new student
 * POST /students
 */
const createStudent = async (req, res, next) => {
    try {
        const studentData = req.body;

        // Validate required fields
        if (!studentData.name || !studentData.phone || !studentData.session || studentData.agreementAmount === undefined) {
            return errorResponse(res, 'Please provide all required fields (name, phone, session, agreementAmount)', 400);
        }

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            studentData.centerId = req.user.centerId;
        } else if (!studentData.centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const student = await studentService.createStudent(studentData);

        return successResponse(res, 'Student created successfully', student, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all students (with pagination and filters)
 * GET /students
 */
const getAllStudents = async (req, res, next) => {
    try {
        const { status, session, page = 1, limit = 10, search } = req.query;

        const filters = {};

        // For center admin, only show their students
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        } else if (req.query.centerId) {
            filters.centerId = req.query.centerId;
        }

        if (status) filters.status = status;
        if (session) filters.session = session;
        if (search) filters.search = search;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await studentService.getAllStudents(filters, options);

        return successResponse(res, 'Students retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single student by ID
 * GET /students/:id
 */
const getStudentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Student ID is required', 400);
        }

        const student = await studentService.getStudentById(id, req.user);

        return successResponse(res, 'Student retrieved successfully', student);
    } catch (error) {
        if (error.message === 'Student not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Update a student
 * PATCH /students/:id
 */
const updateStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return errorResponse(res, 'Student ID is required', 400);
        }

        // Prevent changing centerId
        delete updateData.centerId;

        const student = await studentService.updateStudent(id, updateData, req.user);

        return successResponse(res, 'Student updated successfully', student);
    } catch (error) {
        if (error.message === 'Student not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Delete a student
 * DELETE /students/:id
 */
const deleteStudent = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Student ID is required', 400);
        }

        await studentService.deleteStudent(id, req.user);

        return successResponse(res, 'Student deleted successfully', null);
    } catch (error) {
        if (error.message === 'Student not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('invoices')) {
            return errorResponse(res, error.message, 400);
        }
        next(error);
    }
};

/**
 * Update student status
 * PATCH /students/:id/status
 */
const updateStudentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || !status) {
            return errorResponse(res, 'Student ID and status are required', 400);
        }

        const validStatuses = ['active', 'inactive', 'completed'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, 'Invalid status. Must be: active, inactive, or completed', 400);
        }

        const student = await studentService.updateStudent(id, { status }, req.user);

        return successResponse(res, 'Student status updated successfully', student);
    } catch (error) {
        if (error.message === 'Student not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Get payment summary for a student
 * GET /students/:id/payment-summary
 */
const getPaymentSummary = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Student ID is required', 400);
        }

        const summary = await studentService.getPaymentSummary(id, req.user);

        return successResponse(res, 'Payment summary retrieved successfully', summary);
    } catch (error) {
        if (error.message === 'Student not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    updateStudentStatus,
    getPaymentSummary
};
