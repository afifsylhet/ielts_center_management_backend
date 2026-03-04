const express = require('express');
const invoicesController = require('./invoices.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Invoices Routes
 * All routes require authentication
 * Super admin and center admin can manage invoices
 */

// Apply authentication to all routes
router.use(authenticate);

// Invoice CRUD routes
router.post('/', authorize('super_admin', 'center_admin'), invoicesController.createInvoice);
router.get('/', authorize('super_admin', 'center_admin'), invoicesController.getAllInvoices);
router.get('/student/:studentId', authorize('super_admin', 'center_admin'), invoicesController.getInvoicesByStudent);
router.get('/:id', authorize('super_admin', 'center_admin'), invoicesController.getInvoiceById);
router.patch('/:id', authorize('super_admin', 'center_admin'), invoicesController.updateInvoice);
router.delete('/:id', authorize('super_admin', 'center_admin'), invoicesController.deleteInvoice);

module.exports = router;
