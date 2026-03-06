const express = require('express');
const teachersController = require('./teachers.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Teachers Routes
 * All routes require authentication
 * Super admin and center admin can manage teachers
 */

// Apply authentication to all routes
router.use(authenticate);

// Teacher CRUD routes
router.post('/', authorize('super_admin', 'center_admin'), teachersController.createTeacher);
router.get('/', authorize('super_admin', 'center_admin'), teachersController.getAllTeachers);
router.get('/:id', authorize('super_admin', 'center_admin'), teachersController.getTeacherById);
router.patch('/:id', authorize('super_admin', 'center_admin'), teachersController.updateTeacher);
router.delete('/:id', authorize('super_admin', 'center_admin'), teachersController.deleteTeacher);

module.exports = router;
