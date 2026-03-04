const invoiceService = require('./invoices.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Invoices Controller
 * Handles invoice (credit) management operations
 */

/**
 * Create a new invoice
 * POST /invoices
 */
const createInvoice = async (req, res, next) => {
    try {
        const invoiceData = req.body;

        // Validate required fields
        if (!invoiceData.studentId || !invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
            return errorResponse(res, 'Please provide studentId and at least one item', 400);
        }

        // Validate items
        for (const item of invoiceData.items) {
            if (!item.title || item.amount === undefined || item.amount < 0) {
                return errorResponse(res, 'Each item must have a title and a non-negative amount', 400);
            }
        }

        // For center admin, enforce centerId from token
        if (req.user.role === 'center_admin') {
            invoiceData.centerId = req.user.centerId;
        } else if (!invoiceData.centerId) {
            return errorResponse(res, 'Center ID is required', 400);
        }

        const invoice = await invoiceService.createInvoice(invoiceData, req.user);

        return successResponse(res, 'Invoice created successfully', invoice, 201);
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Access denied')) {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Get all invoices (with pagination and filters)
 * GET /invoices
 */
const getAllInvoices = async (req, res, next) => {
    try {
        const { studentId, startDate, endDate, page = 1, limit = 10 } = req.query;

        const filters = {};

        // For center admin, only show their invoices
        if (req.user.role === 'center_admin') {
            filters.centerId = req.user.centerId;
        } else if (req.query.centerId) {
            filters.centerId = req.query.centerId;
        }

        if (studentId) filters.studentId = studentId;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await invoiceService.getAllInvoices(filters, options);

        return successResponse(res, 'Invoices retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single invoice by ID
 * GET /invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Invoice ID is required', 400);
        }

        const invoice = await invoiceService.getInvoiceById(id, req.user);

        return successResponse(res, 'Invoice retrieved successfully', invoice);
    } catch (error) {
        if (error.message === 'Invoice not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Get all invoices for a specific student
 * GET /invoices/student/:studentId
 */
const getInvoicesByStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!studentId) {
            return errorResponse(res, 'Student ID is required', 400);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await invoiceService.getInvoicesByStudent(studentId, req.user, options);

        return successResponse(res, 'Student invoices retrieved successfully', result);
    } catch (error) {
        if (error.message.includes('not found') || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Update an invoice
 * PATCH /invoices/:id
 */
const updateInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return errorResponse(res, 'Invoice ID is required', 400);
        }

        // Validate items if provided
        if (updateData.items) {
            if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
                return errorResponse(res, 'Items must be a non-empty array', 400);
            }

            for (const item of updateData.items) {
                if (!item.title || item.amount === undefined || item.amount < 0) {
                    return errorResponse(res, 'Each item must have a title and a non-negative amount', 400);
                }
            }
        }

        const invoice = await invoiceService.updateInvoice(id, updateData, req.user);

        return successResponse(res, 'Invoice updated successfully', invoice);
    } catch (error) {
        if (error.message === 'Invoice not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

/**
 * Delete an invoice
 * DELETE /invoices/:id
 */
const deleteInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Invoice ID is required', 400);
        }

        await invoiceService.deleteInvoice(id, req.user);

        return successResponse(res, 'Invoice deleted successfully', null);
    } catch (error) {
        if (error.message === 'Invoice not found' || error.message === 'Access denied') {
            return errorResponse(res, error.message, 404);
        }
        next(error);
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    getInvoicesByStudent,
    updateInvoice,
    deleteInvoice
};
