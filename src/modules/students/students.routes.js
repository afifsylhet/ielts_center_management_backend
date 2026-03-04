const express = require('express');
const studentsController = require('./students.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Students Routes
 * All routes require authentication
 * Super admin and center admin can manage students
 */

// Apply authentication to all routes
router.use(authenticate);

// Student CRUD routes
router.post('/', authorize('super_admin', 'center_admin'), studentsController.createStudent);
router.get('/', authorize('super_admin', 'center_admin'), studentsController.getAllStudents);
router.get('/:id', authorize('super_admin', 'center_admin'), studentsController.getStudentById);
router.get('/:id/payment-summary', authorize('super_admin', 'center_admin'), studentsController.getPaymentSummary);
router.patch('/:id', authorize('super_admin', 'center_admin'), studentsController.updateStudent);
router.patch('/:id/status', authorize('super_admin', 'center_admin'), studentsController.updateStudentStatus);
router.delete('/:id', authorize('super_admin', 'center_admin'), studentsController.deleteStudent);

module.exports = router;
