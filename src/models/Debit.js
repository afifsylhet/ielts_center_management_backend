const mongoose = require('mongoose');

/**
 * Debit Voucher Model
 * Tracks expenses and outgoing payments
 * Implements tenant isolation through centerId
 */
const debitSchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: [true, 'Center ID is required'],
        index: true
    },
    voucherNo: {
        type: String,
        trim: true,
        index: true
    },
    category: {
        type: String,
        enum: ['rent', 'salary', 'material', 'utility', 'maintenance', 'transportation', 'office_supplies', 'other'],
        required: [true, 'Category is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    payeeName: {
        type: String,
        required: [true, 'Payee name is required'],
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'check', 'bank_transfer', 'online_transfer', 'card', 'other'],
        required: [true, 'Payment method is required'],
        default: 'cash'
    },
    referenceNo: {
        type: String,
        trim: true
    },
    items: [{
        description: {
            type: String,
            required: [true, 'Item description is required'],
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
    notes: {
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

// Generate voucher number before saving
debitSchema.pre('save', async function (next) {
    if (!this.voucherNo) {
        const count = await mongoose.model('Debit').countDocuments({ centerId: this.centerId });
        const year = new Date().getFullYear().toString().slice(-2);
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        this.voucherNo = `DV${year}${month}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Compound indexes for queries
debitSchema.index({ centerId: 1, category: 1 });
debitSchema.index({ centerId: 1, date: -1 });
debitSchema.index({ centerId: 1, voucherNo: 1 }, { unique: true });

module.exports = mongoose.model('Debit', debitSchema);
