const Debit = require('../../models/Debit');
const numberToWords = require('../../utils/numberToWords');

/**
 * Debits Service
 * Business logic for debit voucher (expense) management
 */

/**
 * Create a new debit voucher
 */
const createDebit = async (debitData) => {
    try {
        // Calculate total amount from items
        const totalAmount = debitData.items.reduce((sum, item) => sum + item.amount, 0);

        // Convert amount to words
        const amountInWords = numberToWords(totalAmount);

        // Create debit voucher
        const debit = await Debit.create({
            centerId: debitData.centerId,
            category: debitData.category,
            title: debitData.title,
            date: debitData.date || new Date(),
            payeeName: debitData.payeeName,
            paymentMethod: debitData.paymentMethod,
            referenceNo: debitData.referenceNo || '',
            items: debitData.items,
            totalAmount,
            amountInWords,
            notes: debitData.notes || ''
        });

        // Populate and return the debit
        const populatedDebit = await Debit.findById(debit._id)
            .populate('centerId', 'name email phone address');

        return populatedDebit;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all debit vouchers with pagination and filters
 */
const getAllDebits = async (filters = {}, options = {}) => {
    try {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        if (filters.category) {
            query.category = filters.category;
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
        const debits = await Debit.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('centerId', 'name email')
            .lean();

        const totalDebits = await Debit.countDocuments(query);

        // Calculate total expense for the filters
        const totalExpense = await Debit.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
            debits,
            totalExpense: totalExpense.length > 0 ? totalExpense[0].total : 0,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalDebits / limit),
                totalDebits,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single debit voucher by ID
 */
const getDebitById = async (debitId, user) => {
    try {
        const debit = await Debit.findById(debitId)
            .populate('centerId', 'name email phone address logo')
            .lean();

        if (!debit) {
            throw new Error('Debit not found');
        }

        // Ensure center admin can only access their own debits
        if (user.role === 'center_admin' && debit.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        return debit;
    } catch (error) {
        throw error;
    }
};

/**
 * Update a debit voucher
 */
const updateDebit = async (debitId, updateData, user) => {
    try {
        // Get debit
        const debit = await Debit.findById(debitId).populate('centerId');

        if (!debit) {
            throw new Error('Debit not found');
        }

        // Check access
        if (user.role === 'center_admin' && debit.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Don't allow changing centerId
        delete updateData.centerId;

        // If items are updated, recalculate total and amount in words
        if (updateData.items && Array.isArray(updateData.items)) {
            const totalAmount = updateData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
            updateData.totalAmount = totalAmount;
            updateData.amountInWords = numberToWords(totalAmount);
        }

        // Update debit
        Object.assign(debit, updateData);
        await debit.save();

        // Populate again to return full data
        await debit.populate('centerId', 'name email');

        return debit;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a debit voucher
 */
const deleteDebit = async (debitId, user) => {
    try {
        // Get debit
        const debit = await Debit.findById(debitId).populate('centerId');

        if (!debit) {
            throw new Error('Debit not found');
        }

        // Check access
        if (user.role === 'center_admin' && debit.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Delete debit
        await Debit.findByIdAndDelete(debitId);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get debits by month and year
 */
const getDebitsByMonth = async (filters) => {
    try {
        const { month, year, centerId } = filters;

        // Create date range for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Build query
        const query = {
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };

        if (centerId) {
            query.centerId = centerId;
        }

        const debits = await Debit.find(query)
            .sort({ date: -1 })
            .populate('centerId', 'name email')
            .lean();

        // Calculate total expense for the month
        const totalExpense = debits.reduce((sum, debit) => sum + (debit.totalAmount || 0), 0);

        return {
            debits,
            totalExpense,
            month,
            year,
            count: debits.length
        };
    } catch (error) {
        throw error;
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
