const express = require('express');

// Import module routes
const authRoutes = require('./modules/auth/auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const studentsRoutes = require('./modules/students/students.routes');
const invoicesRoutes = require('./modules/invoices/invoices.routes');
const debitsRoutes = require('./modules/debits/debits.routes');
const coursesRoutes = require('./modules/courses/courses.routes');

const router = express.Router();

/**
 * Central Route Configuration
 * Combines all module routes with their base paths
 */

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API version prefix: /api/v1
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/students', studentsRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/debits', debitsRoutes);
router.use('/courses', coursesRoutes);

module.exports = router;
