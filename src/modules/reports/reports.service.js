const Student = require('../../models/Student');
const Teacher = require('../../models/Teacher');
const Staff = require('../../models/Staff');
const Invoice = require('../../models/Invoice');
const Debit = require('../../models/Debit');
const Course = require('../../models/Course');

/**
 * Reports Service
 * Business logic for generating various reports
 */

/**
 * Student Admission Report
 * Returns all students with their course details
 */
const getStudentAdmissionReport = async (filters = {}) => {
    try {
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        if (filters.startDate && filters.endDate) {
            query.createdAt = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        if (filters.courseId) {
            query.courseId = filters.courseId;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        const students = await Student.find(query)
            .populate('centerId', 'name email phone address')
            .populate('courseId', 'name code fee duration')
            .sort({ createdAt: -1 })
            .lean();

        return {
            reportType: 'Student Admission Report',
            totalRecords: students.length,
            filters: filters,
            data: students
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Course-wise Student Report
 * Returns students grouped by course
 */
const getCourseWiseStudentReport = async (filters = {}) => {
    try {
        const matchQuery = {};

        if (filters.centerId) {
            matchQuery.centerId = filters.centerId;
        }

        if (filters.startDate && filters.endDate) {
            matchQuery.createdAt = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        if (filters.status) {
            matchQuery.status = filters.status;
        }

        const courseWiseData = await Student.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$courseId',
                    courseName: { $first: '$course.name' },
                    courseCode: { $first: '$course.code' },
                    courseFee: { $first: '$course.fee' },
                    studentCount: { $sum: 1 },
                    students: {
                        $push: {
                            _id: '$_id',
                            name: '$name',
                            phone: '$phone',
                            email: '$email',
                            status: '$status',
                            session: '$session',
                            createdAt: '$createdAt'
                        }
                    }
                }
            },
            { $sort: { courseName: 1 } }
        ]);

        return {
            reportType: 'Course-wise Student Report',
            totalCourses: courseWiseData.length,
            totalStudents: courseWiseData.reduce((sum, course) => sum + course.studentCount, 0),
            filters: filters,
            data: courseWiseData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Staff and Teacher List Report
 * Returns all staff and teachers
 */
const getStaffTeacherListReport = async (filters = {}) => {
    try {
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        // Fetch teachers
        const teachers = await Teacher.find(query)
            .populate('centerId', 'name email')
            .populate('courseIds', 'name code')
            .sort({ name: 1 })
            .lean();

        // Fetch staff
        const staff = await Staff.find(query)
            .populate('centerId', 'name email')
            .sort({ name: 1 })
            .lean();

        return {
            reportType: 'Staff and Teacher List',
            totalTeachers: teachers.length,
            totalStaff: staff.length,
            totalEmployees: teachers.length + staff.length,
            filters: filters,
            data: {
                teachers: teachers.map(t => ({ ...t, employeeType: 'Teacher' })),
                staff: staff.map(s => ({ ...s, employeeType: 'Staff' }))
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Financial Report
 * Returns summary of all financial transactions
 */
const getFinancialReport = async (filters = {}) => {
    try {
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        const dateFilter = {};
        if (filters.startDate && filters.endDate) {
            dateFilter.date = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        // Fetch invoices (credits)
        const invoices = await Invoice.find({ ...query, ...dateFilter })
            .populate('studentId', 'name phone')
            .sort({ date: -1 })
            .lean();

        // Fetch debits
        const debits = await Debit.find({ ...query, ...dateFilter })
            .sort({ date: -1 })
            .lean();

        const totalCredits = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const totalDebits = debits.reduce((sum, deb) => sum + (deb.totalAmount || deb.amount || 0), 0);

        return {
            reportType: 'Financial Report',
            period: {
                startDate: filters.startDate || 'All time',
                endDate: filters.endDate || 'Present'
            },
            summary: {
                totalCredits,
                totalDebits,
                netBalance: totalCredits - totalDebits,
                totalInvoices: invoices.length,
                totalDebitTransactions: debits.length
            },
            filters: filters,
            data: {
                invoices,
                debits
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Profit and Loss Report
 * Returns detailed profit and loss statement
 */
const getProfitLossReport = async (filters = {}) => {
    try {
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        const dateFilter = {};
        if (filters.startDate && filters.endDate) {
            dateFilter.date = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        // Income (from invoices)
        const invoices = await Invoice.find({ ...query, ...dateFilter }).lean();
        const totalIncome = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        // Expenses (from debits)
        const debits = await Debit.find({ ...query, ...dateFilter }).lean();

        // Categorize expenses
        const expensesByCategory = debits.reduce((acc, debit) => {
            const category = debit.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += debit.totalAmount || debit.amount || 0;
            return acc;
        }, {});

        const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
        const netProfitLoss = totalIncome - totalExpenses;

        return {
            reportType: 'Profit and Loss Report',
            period: {
                startDate: filters.startDate || 'All time',
                endDate: filters.endDate || 'Present'
            },
            summary: {
                totalIncome,
                totalExpenses,
                netProfitLoss,
                profitMargin: totalIncome > 0 ? ((netProfitLoss / totalIncome) * 100).toFixed(2) : 0
            },
            incomeDetails: {
                totalInvoices: invoices.length,
                totalAmount: totalIncome
            },
            expenseDetails: {
                byCategory: expensesByCategory,
                totalTransactions: debits.length,
                totalAmount: totalExpenses
            },
            filters: filters
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Student Status Report
 * Returns students filtered by status
 */
const getStudentStatusReport = async (filters = {}) => {
    try {
        const query = {};

        if (filters.centerId) {
            query.centerId = filters.centerId;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.startDate && filters.endDate) {
            query.createdAt = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        const students = await Student.find(query)
            .populate('centerId', 'name email')
            .populate('courseId', 'name code fee')
            .sort({ status: 1, createdAt: -1 })
            .lean();

        // Group by status
        const statusSummary = students.reduce((acc, student) => {
            const status = student.status || 'unknown';
            if (!acc[status]) {
                acc[status] = {
                    count: 0,
                    students: []
                };
            }
            acc[status].count++;
            acc[status].students.push(student);
            return acc;
        }, {});

        return {
            reportType: 'Student Status Report',
            totalStudents: students.length,
            statusSummary,
            filters: filters,
            data: students
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all students (for dropdown/active students)
 */
const getActiveStudentsReport = async (filters = {}) => {
    try {
        filters.status = 'active';
        return await getStudentStatusReport(filters);
    } catch (error) {
        throw error;
    }
};

/**
 * Get dropout students
 */
const getDropoutStudentsReport = async (filters = {}) => {
    try {
        filters.status = 'inactive';
        return await getStudentStatusReport(filters);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getStudentAdmissionReport,
    getCourseWiseStudentReport,
    getStaffTeacherListReport,
    getFinancialReport,
    getProfitLossReport,
    getStudentStatusReport,
    getActiveStudentsReport,
    getDropoutStudentsReport
};
