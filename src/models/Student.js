const mongoose = require('mongoose');

/**
 * Student Model
 * Tracks student information and financial status
 * Implements tenant isolation through centerId
 */
const studentSchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: [true, 'Center ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true, // Allow multiple null values
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    address: {
        type: String,
        trim: true
    },
    session: {
        type: String,
        required: [true, 'Session is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
    },
    agreementAmount: {
        type: Number,
        required: [true, 'Agreement amount is required'],
        min: [0, 'Agreement amount cannot be negative'],
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0,
        min: [0, 'Total paid cannot be negative']
    },
    totalDue: {
        type: Number,
        default: 0
    },
    fine: {
        type: Number,
        default: 0,
        min: [0, 'Fine cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate totalDue before saving
studentSchema.pre('save', function (next) {
    // totalDue = agreementAmount + fine - totalPaid
    this.totalDue = this.agreementAmount + this.fine - this.totalPaid;

    // Ensure totalDue is not negative
    if (this.totalDue < 0) {
        this.totalDue = 0;
    }

    next();
});

// Compound index for tenant isolation and queries
studentSchema.index({ centerId: 1, status: 1 });
studentSchema.index({ centerId: 1, session: 1 });

module.exports = mongoose.model('Student', studentSchema);
