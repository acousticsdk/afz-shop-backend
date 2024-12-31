/**
 * Formats amount to always have 2 decimal places
 * @param {number|string} amount Amount to format
 * @returns {string} Formatted amount with 2 decimal places
 */
export function formatAmount(amount) {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        throw new Error('Invalid amount');
    }
    return numAmount.toFixed(2);
}

/**
 * Formats phone number to E.164 format
 * @param {string} phone Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid Russian phone number
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
        return `+7${digits.slice(1)}`;
    }
    
    // For other countries, just add + if not present
    return digits.startsWith('+') ? digits : `+${digits}`;
}