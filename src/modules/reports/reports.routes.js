const express = require('express');
const reportsController = require('./reports.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Reports Routes
 * All routes require authentication
 * Super admin and center admin can generate reports
 */

// Apply authentication to all routes
router.use(authenticate);

// Report generation routes
router.post('/student-admission', authorize('super_admin', 'center_admin'), reportsController.getStudentAdmissionReport);
router.post('/course-wise-students', authorize('super_admin', 'center_admin'), reportsController.getCourseWiseStudentReport);
router.post('/staff-teacher-list', authorize('super_admin', 'center_admin'), reportsController.getStaffTeacherListReport);
router.post('/financial', authorize('super_admin', 'center_admin'), reportsController.getFinancialReport);
router.post('/profit-loss', authorize('super_admin', 'center_admin'), reportsController.getProfitLossReport);
router.post('/student-status', authorize('super_admin', 'center_admin'), reportsController.getStudentStatusReport);
router.post('/active-students', authorize('super_admin', 'center_admin'), reportsController.getActiveStudentsReport);
router.post('/dropout-students', authorize('super_admin', 'center_admin'), reportsController.getDropoutStudentsReport);

module.exports = router;
