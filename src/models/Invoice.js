const mongoose = require('mongoose');

/**
 * Invoice (Credit) Model
 * Tracks payments received from students
 * Implements tenant isolation through centerId
 */
const invoiceSchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: [true, 'Center ID is required'],
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required'],
        index: true
    },
    invoiceNo: {
        type: String,
        required: [true, 'Invoice number is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Invoice date is required'],
        default: Date.now
    },
    items: [{
        title: {
            type: String,
            required: [true, 'Item title is required'],
            trim: true
        },
        amount: {
            type: Number,
            required: [true, 'Item amount is required'],
            min: [0, 'Amount cannot be negative']
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    amountInWords: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'mobile_banking', 'card'],
        default: 'cash'
    },
    // Money Receipt specific fields
    courseName: {
        type: String,
        trim: true,
        default: 'IELTS Course'
    },
    batchNo: {
        type: String,
        trim: true
    },
    classStartDate: {
        type: Date
    },
    classTime: {
        type: String,
        trim: true
    },
    roomNo: {
        type: String,
        trim: true
    },
    // Payment breakdown
    courseFee: {
        type: Number,
        min: [0, 'Course fee cannot be negative']
    },
    materialsFee: {
        type: Number,
        min: [0, 'Materials fee cannot be negative'],
        default: 0
    },
    paidAmount: {
        type: Number,
        min: [0, 'Paid amount cannot be negative']
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['partial', 'full'],
        default: 'partial'
    },
    // Class schedule (e.g., ["Sat", "Mon", "Wed"] or ["Sun", "Tue", "Thu"])
    classSchedule: {
        days: [String],
        computerClassDate: {
            type: Date
        },
        computerClassTime: {
            type: String,
            trim: true
        }
    },
    // Materials checklist
    materialsChecklist: {
        listening: { type: Boolean, default: false },
        reading: { type: Boolean, default: false },
        writing: { type: Boolean, default: false },
        speaking: { type: Boolean, default: false },
        vocabulary: { type: Boolean, default: false },
        book: { type: Boolean, default: false },
        workbook: { type: Boolean, default: false },
        lifeSkills: { type: Boolean, default: false },
        gt: { type: Boolean, default: false },
        academic: { type: Boolean, default: false }
    },
    // Gifts/Extras
    gifts: {
        bag: { type: Boolean, default: false },
        diary: { type: Boolean, default: false },
        calendar: { type: Boolean, default: false },
        progressReport: { type: Boolean, default: false },
        others: {
            type: String,
            trim: true
        }
    },
    // Terms and conditions or notes (supports Bangla text)
    terms: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure invoice number is unique per center
invoiceSchema.index({ centerId: 1, invoiceNo: 1 }, { unique: true });

// Compound indexes for queries
invoiceSchema.index({ centerId: 1, studentId: 1 });
invoiceSchema.index({ centerId: 1, date: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
