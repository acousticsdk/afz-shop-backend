/**
 * Formats currency rate to a consistent number of decimal places
 * @param {number} rate The currency rate to format
 * @param {number} decimals Number of decimal places (default: 6)
 * @returns {number} Formatted rate
 */
export function formatCurrencyRate(rate, decimals = 6) {
    if (typeof rate !== 'number' || isNaN(rate)) {
        throw new Error('Invalid currency rate');
    }
    
    // Convert to fixed decimal places and back to number
    return Number(rate.toFixed(decimals));
}