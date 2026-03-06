const Course = require('../../models/Course');

/**
 * Courses Service
 * Business logic for course management
 */

/**
 * Create a new course
 */
const createCourse = async (courseData) => {
    const course = new Course(courseData);
    await course.save();
    return course;
};

/**
 * Get all courses for a center
 */
const getCourses = async (centerId, filters = {}) => {
    const query = { centerId };

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { code: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
        ];
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Course.countDocuments(query);

    return {
        courses,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get a single course by ID
 */
const getCourseById = async (courseId, centerId) => {
    const course = await Course.findOne({ _id: courseId, centerId }).lean();
    
    if (!course) {
        throw new Error('Course not found');
    }

    return course;
};

/**
 * Update a course
 */
const updateCourse = async (courseId, centerId, updateData) => {
    const course = await Course.findOneAndUpdate(
        { _id: courseId, centerId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!course) {
        throw new Error('Course not found');
    }

    return course;
};

/**
 * Delete a course
 */
const deleteCourse = async (courseId, centerId) => {
    const course = await Course.findOneAndDelete({ _id: courseId, centerId });

    if (!course) {
        throw new Error('Course not found');
    }

    return course;
};

/**
 * Get all active courses (for dropdowns)
 */
const getActiveCourses = async (centerId) => {
    const courses = await Course.find({ centerId, status: 'active' })
        .select('name code fee')
        .sort({ name: 1 })
        .lean();

    return courses;
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getActiveCourses
};
