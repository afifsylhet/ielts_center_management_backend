const mongoose = require('mongoose');

/**
 * Course Model
 * Tracks course information for the center
 * Implements tenant isolation through centerId
 */
const courseSchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: [true, 'Center ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        trim: true,
        // e.g., "3 months", "6 weeks"
    },
    fee: {
        type: Number,
        min: [0, 'Fee cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Compound index for ensuring unique course names per center
courseSchema.index({ centerId: 1, name: 1 }, { unique: true });

// Compound index for code if provided
courseSchema.index({ centerId: 1, code: 1 }, { unique: true, sparse: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
