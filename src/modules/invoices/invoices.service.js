const Invoice = require('../../models/Invoice');
const Student = require('../../models/Student');
const generateInvoiceNo = require('../../utils/generateInvoiceNo');
const numberToWords = require('../../utils/numberToWords');

/**
 * Invoices Service
 * Business logic for invoice management
 */

/**
 * Create a new invoice and update student's totalPaid
 */
const createInvoice = async (invoiceData, user) => {
    try {
        // Verify student exists and belongs to the center
        const student = await Student.findById(invoiceData.studentId);

        if (!student) {
            throw new Error('Student not found');
        }

        // Ensure center admin can only create invoices for their students
        if (user.role === 'center_admin' && student.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied: Student does not belong to your center');
        }

        // Calculate total amount from items
        const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);

        // Generate invoice number if not provided
        const invoiceNo = invoiceData.invoiceNo || await generateInvoiceNo(invoiceData.centerId);

        // Convert amount to words
        const amountInWords = numberToWords(totalAmount);

        // Build invoice data object with money receipt fields
        const invoicePayload = {
            centerId: invoiceData.centerId,
            studentId: invoiceData.studentId,
            invoiceNo,
            date: invoiceData.date || new Date(),
            items: invoiceData.items,
            totalAmount,
            amountInWords,
            paymentMethod: invoiceData.paymentMethod || 'cash'
        };

        // Add money receipt specific fields if provided (backward compatible)
        if (invoiceData.courseName) invoicePayload.courseName = invoiceData.courseName;
        if (invoiceData.batchNo) invoicePayload.batchNo = invoiceData.batchNo;
        if (invoiceData.classStartDate) invoicePayload.classStartDate = invoiceData.classStartDate;
        if (invoiceData.classTime) invoicePayload.classTime = invoiceData.classTime;
        if (invoiceData.roomNo) invoicePayload.roomNo = invoiceData.roomNo;
        if (invoiceData.courseFee !== undefined) invoicePayload.courseFee = invoiceData.courseFee;
        if (invoiceData.materialsFee !== undefined) invoicePayload.materialsFee = invoiceData.materialsFee;
        if (invoiceData.paidAmount !== undefined) invoicePayload.paidAmount = invoiceData.paidAmount;
        if (invoiceData.dueAmount !== undefined) invoicePayload.dueAmount = invoiceData.dueAmount;
        if (invoiceData.paymentStatus) invoicePayload.paymentStatus = invoiceData.paymentStatus;
        if (invoiceData.classSchedule) invoicePayload.classSchedule = invoiceData.classSchedule;
        if (invoiceData.materialsChecklist) invoicePayload.materialsChecklist = invoiceData.materialsChecklist;
        if (invoiceData.gifts) invoicePayload.gifts = invoiceData.gifts;
        if (invoiceData.terms) invoicePayload.terms = invoiceData.terms;

        // Create invoice
        const invoice = await Invoice.create(invoicePayload);

        // Update student's totalPaid and recalculate totalDue
        student.totalPaid += totalAmount;
        await student.save(); // This will trigger the pre-save hook to recalculate totalDue

        // Populate and return the invoice
        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('studentId', 'name phone email')
            .populate('centerId', 'name email');

        return populatedInvoice;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all invoices with pagination and filters
 */
const getAllInvoices = async (filters = {}, options = {}) => {
    try {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        if (filters.studentId) {
            query.studentId = filters.studentId;
        }

        // Date range filter
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) {
                query.date.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.date.$lte = new Date(filters.endDate);
            }
        }

        // Execute query with pagination
        const invoices = await Invoice.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('studentId', 'name phone email')
            .populate('centerId', 'name email')
            .lean();

        const totalInvoices = await Invoice.countDocuments(query);

        return {
            invoices,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalInvoices / limit),
                totalInvoices,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single invoice by ID
 */
const getInvoiceById = async (invoiceId, user) => {
    try {
        const invoice = await Invoice.findById(invoiceId)
            .populate('studentId', 'name phone email address')
            .populate('centerId', 'name email phone address logo')
            .lean();

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Ensure center admin can only access their own invoices
        if (user.role === 'center_admin' && invoice.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        return invoice;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all invoices for a specific student
 */
const getInvoicesByStudent = async (studentId, user, options = {}) => {
    try {
        // Verify student exists
        const student = await Student.findById(studentId);

        if (!student) {
            throw new Error('Student not found');
        }

        // Ensure center admin can only access their own students' invoices
        if (user.role === 'center_admin' && student.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const invoices = await Invoice.find({ studentId })
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('centerId', 'name email')
            .lean();

        const totalInvoices = await Invoice.countDocuments({ studentId });

        // Calculate total paid from invoices
        const totalPaidFromInvoices = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

        return {
            student: {
                id: student._id,
                name: student.name,
                phone: student.phone,
                email: student.email,
                agreementAmount: student.agreementAmount,
                totalPaid: student.totalPaid,
                totalDue: student.totalDue,
                fine: student.fine
            },
            invoices,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalInvoices / limit),
                totalInvoices,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Update an invoice
 */
const updateInvoice = async (invoiceId, updateData, user) => {
    try {
        // Get invoice
        const invoice = await Invoice.findById(invoiceId)
            .populate('studentId')
            .populate('centerId');

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Check access
        if (user.role === 'center_admin' && invoice.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Don't allow changing centerId or studentId
        delete updateData.centerId;
        delete updateData.studentId;
        delete updateData.invoiceNo;

        // If items are updated, recalculate total
        if (updateData.items && Array.isArray(updateData.items)) {
            const totalAmount = updateData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
            updateData.totalAmount = totalAmount;
        }

        // Update invoice
        Object.assign(invoice, updateData);
        await invoice.save();

        // Populate again to return full data
        await invoice.populate('studentId');
        await invoice.populate('centerId');

        return invoice;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete an invoice
 */
const deleteInvoice = async (invoiceId, user) => {
    try {
        // Get invoice
        const invoice = await Invoice.findById(invoiceId).populate('centerId');

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Check access
        if (user.role === 'center_admin' && invoice.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Delete invoice
        await Invoice.findByIdAndDelete(invoiceId);

        return true;
    } catch (error) {
        throw error;
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
