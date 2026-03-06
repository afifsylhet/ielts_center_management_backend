const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Center = require('../../models/Center');
const config = require('../../config/env');

/**
 * Auth Service
 * Handles authentication business logic
 */

/**
 * Register a new IELTS Center with Admin
 * Creates both Center and User records
 */
const registerCenter = async (userData) => {
    try {
        // Check if user email already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Check if center email already exists
        const existingCenter = await Center.findOne({ email: userData.centerEmail });
        if (existingCenter) {
            throw new Error('Center with this email already exists');
        }

        // Create the center first
        const center = await Center.create({
            name: userData.centerName,
            address: userData.centerAddress,
            phone: userData.centerPhone,
            email: userData.centerEmail,
            logo: userData.centerLogo || null,
            isActive: true
        });

        // Create the user (center admin)
        const user = await User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'center_admin',
            centerId: center._id,
            status: 'pending' // Requires super admin approval
        });

        // Return user without password
        const userObject = user.toJSON();

        return {
            user: userObject,
            center: {
                id: center._id,
                name: center.name,
                email: center.email
            }
        };
    } catch (error) {
        // If center was created but user creation failed, rollback center
        if (error.message.includes('User') && userData.centerEmail) {
            await Center.findOneAndDelete({ email: userData.centerEmail });
        }
        throw error;
    }
};

/**
 * Login user and return JWT token
 */
const login = async (email, password) => {
    try {
        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password').populate('centerId', 'name email phone address logo isActive');

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            throw new Error('Invalid credentials');
        }

        // Check if user is approved
        if (user.role !== 'super_admin' && user.status !== 'approved') {
            if (user.status === 'pending') {
                throw new Error('Your account is pending approval. Please wait for admin approval.');
            }
            if (user.status === 'rejected') {
                throw new Error('Your account has been rejected. Please contact support.');
            }
        }

        // Check if center is active for center_admin
        if (user.role === 'center_admin' && user.centerId) {
            if (!user.centerId.isActive) {
                throw new Error('Your center has been deactivated. Please contact support.');
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role, centerId: user.centerId?._id || null },
            config.jwtSecret,
            { expiresIn: config.jwtExpire }
        );

        // Remove password from response
        const userObject = user.toJSON();
        delete userObject.password;

        return {
            token,
            user: userObject
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get current user details
 */
const getCurrentUser = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('centerId', 'name email phone address logo isActive')
            .select('-password');

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    registerCenter,
    login,
    getCurrentUser
};
