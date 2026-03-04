/**
 * Convert number to words (for invoice amounts)
 * Supports numbers up to 99,999,999 (99 million+)
 */

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/**
 * Convert a number (0-999) to words
 */
const convertHundreds = (num) => {
    let result = '';

    if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }

    if (num >= 10 && num <= 19) {
        result += teens[num - 10] + ' ';
    } else {
        if (num >= 20) {
            result += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 0) {
            result += ones[num] + ' ';
        }
    }

    return result.trim();
};

/**
 * Main function to convert number to words
 * @param {number} amount - The amount to convert
 * @returns {string} - Amount in words
 */
const numberToWords = (amount) => {
    if (amount === 0) return 'Zero Taka Only';

    if (amount < 0) return 'Invalid Amount';

    // Handle decimal part (paisa)
    const [integerPart, decimalPart] = amount.toString().split('.');
    let num = parseInt(integerPart);

    if (num > 99999999) {
        return 'Amount too large';
    }

    let result = '';

    // Crore (10,000,000)
    if (num >= 10000000) {
        result += convertHundreds(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
    }

    // Lakh (100,000)
    if (num >= 100000) {
        result += convertHundreds(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
    }

    // Thousand
    if (num >= 1000) {
        result += convertHundreds(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }

    // Remaining hundreds, tens and ones
    if (num > 0) {
        result += convertHundreds(num);
    }

    result = result.trim() + ' Taka';

    // Handle decimal part if exists
    if (decimalPart && parseInt(decimalPart) > 0) {
        const paisaPart = parseInt(decimalPart.substring(0, 2).padEnd(2, '0'));
        result += ' and ' + convertHundreds(paisaPart) + ' Paisa';
    }

    return result + ' Only';
};

module.exports = numberToWords;
