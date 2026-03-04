const express = require('express');
const adminController = require('./admin.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Admin Routes
 * All routes require super_admin role
 */

// Apply authentication and authorization to all routes
router.use(authenticate);
router.use(authorize('super_admin'));

// Center management routes
router.get('/centers', adminController.getAllCenters);
router.get('/centers/:id', adminController.getCenterDetails);
router.patch('/centers/:id/approve', adminController.approveCenter);
router.patch('/centers/:id/reject', adminController.rejectCenter);
router.patch('/centers/:id/deactivate', adminController.deactivateCenter);
router.patch('/centers/:id/activate', adminController.activateCenter);

module.exports = router;
