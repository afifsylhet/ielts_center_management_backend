const Student = require('../../models/Student');
const Invoice = require('../../models/Invoice');

/**
 * Students Service
 * Business logic for student management
 */

/**
 * Create a new student
 */
const createStudent = async (studentData) => {
    try {
        const student = await Student.create(studentData);
        return student;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all students with pagination and filters
 */
const getAllStudents = async (filters = {}, options = {}) => {
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

        if (filters.session) {
            query.session = filters.session;
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
        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('centerId', 'name email')
            .lean();

        const totalStudents = await Student.countDocuments(query);

        return {
            students,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalStudents / limit),
                totalStudents,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single student by ID
 */
const getStudentById = async (studentId, user) => {
    try {
        const student = await Student.findById(studentId)
            .populate('centerId', 'name email phone address')
            .lean();

        if (!student) {
            throw new Error('Student not found');
        }

        // Ensure center admin can only access their own students
        if (user.role === 'center_admin' && student.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        return student;
    } catch (error) {
        throw error;
    }
};

/**
 * Update a student
 */
const updateStudent = async (studentId, updateData, user) => {
    try {
        // Find student first
        const student = await Student.findById(studentId);

        if (!student) {
            throw new Error('Student not found');
        }

        // Ensure center admin can only update their own students
        if (user.role === 'center_admin' && student.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Update student
        Object.assign(student, updateData);
        await student.save();

        return student;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a student
 */
const deleteStudent = async (studentId, user) => {
    try {
        // Find student first
        const student = await Student.findById(studentId);

        if (!student) {
            throw new Error('Student not found');
        }

        // Ensure center admin can only delete their own students
        if (user.role === 'center_admin' && student.centerId.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Check if student has any invoices
        const invoiceCount = await Invoice.countDocuments({ studentId });

        if (invoiceCount > 0) {
            throw new Error('Cannot delete student with existing invoices');
        }

        // Delete student
        await Student.findByIdAndDelete(studentId);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get payment summary for a student
 */
const getPaymentSummary = async (studentId, user) => {
    try {
        // Get student
        const student = await Student.findById(studentId).populate('centerId', 'centerName');

        if (!student) {
            throw new Error('Student not found');
        }

        // Check access
        if (user.role === 'center_admin' && student.centerId._id.toString() !== user.centerId.toString()) {
            throw new Error('Access denied');
        }

        // Get all invoices for this student
        const invoices = await Invoice.find({ studentId });

        // Calculate totals
        const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
        const agreementAmount = student.agreementAmount || 0;
        const totalDue = agreementAmount - totalPaid;
        const paymentPercentage = agreementAmount > 0 ? (totalPaid / agreementAmount) * 100 : 0;

        return {
            agreementAmount,
            totalPaid,
            totalDue,
            paymentPercentage: Math.round(paymentPercentage * 100) / 100,
            invoiceCount: invoices.length,
            status: student.status
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getPaymentSummary
};
