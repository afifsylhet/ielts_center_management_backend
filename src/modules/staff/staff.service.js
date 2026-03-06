const Staff = require('../../models/Staff');

/**
 * Staff Service
 * Business logic for staff management
 */

/**
 * Create a new staff member
 */
const createStaff = async (staffData) => {
    try {
        const staff = await Staff.create(staffData);
        return staff;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all staff with pagination and filters
 */
const getAllStaff = async (filters = {}, options = {}) => {
    try {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.designation) {
            query.designation = { $regex: filters.designation, $options: 'i' };
        }

        // Search by name, phone, or email
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { phone: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const staff = await Staff.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('centerId', 'name email')
            .lean();

        const totalStaff = await Staff.countDocuments(query);

        return {
            staff,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalStaff / limit),
                totalStaff,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single staff member by ID
 */
const getStaffById = async (staffId, user) => {
    try {
        const staff = await Staff.findById(staffId)
            .populate('centerId', 'name email phone address')
            .lean();

        if (!staff) {
            throw new Error('Staff member not found');
        }

        // Ensure center admin can only access their own staff
        if (user.role === 'center_admin' && staff.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        return staff;
    } catch (error) {
        throw error;
    }
};

/**
 * Update staff information
 */
const updateStaff = async (staffId, updateData, user) => {
    try {
        const staff = await Staff.findById(staffId);

        if (!staff) {
            throw new Error('Staff member not found');
        }

        // Ensure center admin can only update their own staff
        if (user.role === 'center_admin' && staff.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Update staff
        Object.assign(staff, updateData);
        await staff.save();

        return staff;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a staff member
 */
const deleteStaff = async (staffId, user) => {
    try {
        const staff = await Staff.findById(staffId);

        if (!staff) {
            throw new Error('Staff member not found');
        }

        // Ensure center admin can only delete their own staff
        if (user.role === 'center_admin' && staff.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        await Staff.findByIdAndDelete(staffId);

        return { message: 'Staff member deleted successfully' };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff
};
