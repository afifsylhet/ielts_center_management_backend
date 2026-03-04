const Invoice = require('../models/Invoice');

/**
 * Generate unique invoice number for a center
 * Format: INV-YYYYMMDD-XXXX
 * Example: INV-20260123-0001
 */
const generateInvoiceNo = async (centerId) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const datePrefix = `${year}${month}${day}`;
        const invoicePrefix = `INV-${datePrefix}`;

        // Find the last invoice for this center with today's date prefix
        const lastInvoice = await Invoice.findOne({
            centerId,
            invoiceNo: { $regex: `^${invoicePrefix}` }
        })
            .sort({ invoiceNo: -1 })
            .select('invoiceNo')
            .lean();

        let sequenceNumber = 1;

        if (lastInvoice) {
            // Extract the sequence number from the last invoice
            const lastSequence = lastInvoice.invoiceNo.split('-')[2];
            sequenceNumber = parseInt(lastSequence) + 1;
        }

        // Format sequence number with leading zeros (4 digits)
        const formattedSequence = String(sequenceNumber).padStart(4, '0');

        return `${invoicePrefix}-${formattedSequence}`;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        throw new Error('Failed to generate invoice number');
    }
};

module.exports = generateInvoiceNo;
