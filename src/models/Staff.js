const mongoose = require('mongoose');

/**
 * Staff Model
 * Tracks staff member information for the center
 * Implements tenant isolation through centerId
 */
const staffSchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: [true, 'Center ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Staff name is required'],
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
        required: [true, 'Designation is required'],
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
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
    }
}, {
    timestamps: true
});

// Compound index for ensuring unique staff emails per center
staffSchema.index({ centerId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Staff', staffSchema);
