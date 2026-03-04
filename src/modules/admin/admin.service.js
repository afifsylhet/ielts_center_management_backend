const User = require('../../models/User');
const Center = require('../../models/Center');

/**
 * Admin Service
 * Business logic for Super Admin operations
 */

/**
 * Get all centers with pagination and filters
 */
const getAllCenters = async (filters = {}, options = {}) => {
    try {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // Build query for centers
        const centerQuery = {};
        if (filters.isActive !== undefined) {
            centerQuery.isActive = filters.isActive;
        }

        // Get centers with pagination
        const centers = await Center.find(centerQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCenters = await Center.countDocuments(centerQuery);

        // Get associated users for each center
        const centersWithUsers = await Promise.all(
            centers.map(async (center) => {
                const users = await User.find({ centerId: center._id })
                    .select('-password')
                    .lean();

                return {
                    ...center,
                    users
                };
            })
        );

        return {
            centers: centersWithUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCenters / limit),
                totalCenters,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Approve a center and its admin user
 */
const approveCenter = async (centerId) => {
    try {
        // Find the center
        const center = await Center.findById(centerId);
        if (!center) {
            throw new Error('Center not found');
        }

        // Find and update the center admin user
        const user = await User.findOneAndUpdate(
            { centerId: centerId, role: 'center_admin' },
            { status: 'approved' },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new Error('Center admin not found');
        }

        // Ensure center is active
        center.isActive = true;
        await center.save();

        return {
            center,
            user
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Reject a center and its admin user
 */
const rejectCenter = async (centerId, reason = null) => {
    try {
        // Find the center
        const center = await Center.findById(centerId);
        if (!center) {
            throw new Error('Center not found');
        }

        // Find and update the center admin user
        const user = await User.findOneAndUpdate(
            { centerId: centerId, role: 'center_admin' },
            { status: 'rejected' },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new Error('Center admin not found');
        }

        // Optionally deactivate the center
        center.isActive = false;
        await center.save();

        return {
            center,
            user,
            reason
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Deactivate a center
 */
const deactivateCenter = async (centerId) => {
    try {
        const center = await Center.findByIdAndUpdate(
            centerId,
            { isActive: false },
            { new: true }
        );

        if (!center) {
            throw new Error('Center not found');
        }

        return center;
    } catch (error) {
        throw error;
    }
};

/**
 * Activate a center
 */
const activateCenter = async (centerId) => {
    try {
        const center = await Center.findByIdAndUpdate(
            centerId,
            { isActive: true },
            { new: true }
        );

        if (!center) {
            throw new Error('Center not found');
        }

        return center;
    } catch (error) {
        throw error;
    }
};

/**
 * Get center details by ID
 */
const getCenterDetails = async (centerId) => {
    try {
        const center = await Center.findById(centerId).lean();

        if (!center) {
            throw new Error('Center not found');
        }

        // Get associated users
        const users = await User.find({ centerId })
            .select('-password')
            .lean();

        return {
            ...center,
            users
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllCenters,
    getCenterDetails,
    approveCenter,
    rejectCenter,
    deactivateCenter,
    activateCenter
};
