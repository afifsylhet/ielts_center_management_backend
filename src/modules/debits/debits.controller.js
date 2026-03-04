const debitService = require('./debits.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Debits Controller
 * Handles debit voucher (expense) management operations
 */

/**
 * Create a new debit voucher
 * POST /debits
 */
const createDebit = async (req, res, next) => {
    try {
        const debitData = req.body;

        // Validate required fields
        if (!debitData.category || !debitData.title || !debitData.payeeName || !debitData.paymentMethod || !debitData.items || !Array.isArray(debitData.items) || debitData.items.length === 0) {
            return errorResponse(res, 'Please provide category, title, payee name, payment method, and at least one item', 400);
        }

        // Validate category
        const validCategories = ['rent', 'salary', 'material', 'utility', 'maintenance', 'transportation', 'office_supplies', 'other'];
        if (!validCategories.includes(debitData.category)) {
            return errorResponse(res, 'Invalid category. Must be one of: rent, salary, material, utility, maintenance, transportation, office_supplies, other', 400);
        }

        // Validate payment method
        const validPaymentMethods = ['cash', 'check', 'bank_transfer', 'online_transfer', 'card', 'other'];
        if (!validPaymentMethods.includes(debitData.paymentMethod)) {
            return errorResponse(res, 'Invalid payment method. Must be one of: cash, check, bank_transfer, online_transfer, card, other', 400);
        }

        // Validate items
        for (const item of debitData.items) {
            if (!item.description || item.amount === undefined || item.amount < 0) {
                return errorResponse(res, 'Each item must have a description and a non-negative amount', 400);
            }
        }

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            debitData.centerId = req.user.centerId;
        } else if (!debitData.centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const debit = await debitService.createDebit(debitData);

        return successResponse(res, 'Debit voucher created successfully', debit, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all debit vouchers (with pagination and filters)
 * GET /debits
 */
const getAllDebits = async (req, res, next) => {
    try {
        const { category, startDate, endDate, page = 1, limit = 10 } = req.query;

        const filters = {};

        // For center admin, only show their debits
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        } else if (req.query.centerId) {
            filters.centerId = req.query.centerId;
        }

        if (category) filters.category = category;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await debitService.getAllDebits(filters, options);

        return successResponse(res, 'Debit vouchers retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single debit voucher by ID
 * GET /debits/:id
 */
const getDebitById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Debit ID is required', 400);
        }

        const debit = await debitService.getDebitById(id, req.user);

        return successResponse(res, 'Debit voucher retrieved successfully', debit);
    } catch (error) {
        if (error.message === 'Debit not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Update a debit voucher
 * PATCH /debits/:id
 */
const updateDebit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return errorResponse(res, 'Debit ID is required', 400);
        }

        const debit = await debitService.updateDebit(id, updateData, req.user);

        return successResponse(res, 'Debit voucher updated successfully', debit);
    } catch (error) {
        if (error.message === 'Debit not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Delete a debit voucher
 * DELETE /debits/:id
 */
const deleteDebit = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Debit ID is required', 400);
        }

        await debitService.deleteDebit(id, req.user);

        return successResponse(res, 'Debit voucher deleted successfully', null);
    } catch (error) {
        if (error.message === 'Debit not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Get debits by month and year
 * GET /debits/month?month=1&year=2024
 */
const getDebitsByMonth = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return errorResponse(res, 'Month and year are required', 400);
        }

        const filters = { month: parseInt(month), year: parseInt(year) };

        // For center admin, only show their debits
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        }

        const debits = await debitService.getDebitsByMonth(filters);

        return successResponse(res, 'Debits retrieved successfully', debits);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDebit,
    getAllDebits,
    getDebitById,
    updateDebit,
    deleteDebit,
    getDebitsByMonth
};
