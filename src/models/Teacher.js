const mongoose = require('mongoose');

/**
 * Teacher Model
 * Tracks teacher information for the center
 * Implements tenant isolation through centerId
 */
const teacherSchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: [true, 'Center ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Teacher name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    designation: {
        type: String,
        trim: true,
        default: 'Teacher'
    },
    courseIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    joiningDate: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    address: {
        type: String,
        trim: true
    },
    qualification: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound index for ensuring unique teacher emails per center
teacherSchema.index({ centerId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
