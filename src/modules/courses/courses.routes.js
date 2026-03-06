const express = require('express');
const router = express.Router();
const courseController = require('./courses.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

/**
 * Course Routes
 * All routes require authentication
 */

// Get active courses (for dropdowns) - must be before /:id route
router.get('/active', authenticate, courseController.getActiveCourses);

// Get all courses
router.get('/', authenticate, courseController.getCourses);

// Create a new course (only center admin)
router.post('/', authenticate, authorize('center_admin'), courseController.createCourse);

// Get a single course
router.get('/:id', authenticate, courseController.getCourseById);

// Update a course (only center admin)
router.put('/:id', authenticate, authorize('center_admin'), courseController.updateCourse);

// Delete a course (only center admin)
router.delete('/:id', authenticate, authorize('center_admin'), courseController.deleteCourse);

module.exports = router;
