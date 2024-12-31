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