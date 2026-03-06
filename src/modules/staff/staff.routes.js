const express = require('express');
const staffController = require('./staff.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Staff Routes
 * All routes require authentication
 * Super admin and center admin can manage staff
 */

// Apply authentication to all routes
router.use(authenticate);

// Staff CRUD routes
router.post('/', authorize('super_admin', 'center_admin'), staffController.createStaff);
router.get('/', authorize('super_admin', 'center_admin'), staffController.getAllStaff);
router.get('/:id', authorize('super_admin', 'center_admin'), staffController.getStaffById);
router.patch('/:id', authorize('super_admin', 'center_admin'), staffController.updateStaff);
router.delete('/:id', authorize('super_admin', 'center_admin'), staffController.deleteStaff);

module.exports = router;
