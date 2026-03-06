const Teacher = require('../../models/Teacher');

/**
 * Teachers Service
 * Business logic for teacher management
 */

/**
 * Create a new teacher
 */
const createTeacher = async (teacherData) => {
    try {
        const teacher = await Teacher.create(teacherData);
        return teacher;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all teachers with pagination and filters
 */
const getAllTeachers = async (filters = {}, options = {}) => {
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

        if (filters.courseId) {
            query.courseIds = filters.courseId;
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
        const teachers = await Teacher.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('centerId', 'name email')
            .populate('courseIds', 'name code')
            .lean();

        const totalTeachers = await Teacher.countDocuments(query);

        return {
            teachers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTeachers / limit),
                totalTeachers,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single teacher by ID
 */
const getTeacherById = async (teacherId, user) => {
    try {
        const teacher = await Teacher.findById(teacherId)
            .populate('centerId', 'name email phone address')
            .populate('courseIds', 'name code description fee')
            .lean();

        if (!teacher) {
            throw new Error('Teacher not found');
        }

        // Ensure center admin can only access their own teachers
        if (user.role === 'center_admin' && teacher.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        return teacher;
    } catch (error) {
        throw error;
    }
};

/**
 * Update teacher information
 */
const updateTeacher = async (teacherId, updateData, user) => {
    try {
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            throw new Error('Teacher not found');
        }

        // Ensure center admin can only update their own teachers
        if (user.role === 'center_admin' && teacher.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Update teacher
        Object.assign(teacher, updateData);
        await teacher.save();

        return teacher;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a teacher
 */
const deleteTeacher = async (teacherId, user) => {
    try {
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            throw new Error('Teacher not found');
        }

        // Ensure center admin can only delete their own teachers
        if (user.role === 'center_admin' && teacher.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        await Teacher.findByIdAndDelete(teacherId);

        return { message: 'Teacher deleted successfully' };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
};
