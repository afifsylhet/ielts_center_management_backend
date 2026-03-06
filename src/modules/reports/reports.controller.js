const reportsService = require('./reports.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Reports Controller
 * Handles report generation operations
 */

/**
 * Generate Student Admission Report
 * POST /reports/student-admission
 */
const getStudentAdmissionReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getStudentAdmissionReport(filters);

        return successResponse(res, 'Student admission report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Course-wise Student Report
 * POST /reports/course-wise-students
 */
const getCourseWiseStudentReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getCourseWiseStudentReport(filters);

        return successResponse(res, 'Course-wise student report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Staff and Teacher List Report
 * POST /reports/staff-teacher-list
 */
const getStaffTeacherListReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getStaffTeacherListReport(filters);

        return successResponse(res, 'Staff and teacher list generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Financial Report
 * POST /reports/financial
 */
const getFinancialReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getFinancialReport(filters);

        return successResponse(res, 'Financial report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Profit and Loss Report
 * POST /reports/profit-loss
 */
const getProfitLossReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getProfitLossReport(filters);

        return successResponse(res, 'Profit and loss report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Student Status Report
 * POST /reports/student-status
 */
const getStudentStatusReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getStudentStatusReport(filters);

        return successResponse(res, 'Student status report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Active Students Report
 * POST /reports/active-students
 */
const getActiveStudentsReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getActiveStudentsReport(filters);

        return successResponse(res, 'Active students report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate Dropout Students Report
 * POST /reports/dropout-students
 */
const getDropoutStudentsReport = async (req, res, next) => {
    try {
        const filters = req.body;

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const report = await reportsService.getDropoutStudentsReport(filters);

        return successResponse(res, 'Dropout students report generated successfully', report);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentAdmissionReport,
    getCourseWiseStudentReport,
    getStaffTeacherListReport,
    getFinancialReport,
    getProfitLossReport,
    getStudentStatusReport,
    getActiveStudentsReport,
    getDropoutStudentsReport
};
