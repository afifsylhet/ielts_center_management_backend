const express = require('express');
const debitsController = require('./debits.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Debits Routes
 * All routes require authentication
 * Super admin and center admin can manage debit vouchers
 */

// Apply authentication to all routes
router.use(authenticate);

// Debit voucher routes
router.post('/', authorize('super_admin', 'center_admin'), debitsController.createDebit);
router.get('/', authorize('super_admin', 'center_admin'), debitsController.getAllDebits);
router.get('/month', authorize('super_admin', 'center_admin'), debitsController.getDebitsByMonth);
router.get('/:id', authorize('super_admin', 'center_admin'), debitsController.getDebitById);
router.patch('/:id', authorize('super_admin', 'center_admin'), debitsController.updateDebit);
router.delete('/:id', authorize('super_admin', 'center_admin'), debitsController.deleteDebit);

module.exports = router;
