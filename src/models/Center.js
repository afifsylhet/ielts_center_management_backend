const mongoose = require('mongoose');

/**
 * Center Model
 * Represents an IELTS Center in the multi-tenant system
 * Each center operates independently with isolated data
 */
const centerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Center name is required'],
        trim: true
    },
    logo: {
        type: String,
        default: null // URL or file path to logo
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
centerSchema.index({ isActive: 1 });
centerSchema.index({ email: 1 });

module.exports = mongoose.model('Center', centerSchema);
