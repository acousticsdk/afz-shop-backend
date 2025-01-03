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
    
    // For USD rate, we need to calculate 1/rate since we get RUB:USD
    // but need USD:RUB for our application
    return Number((1 / rate).toFixed(decimals));
}

/**
 * Formats KZT rate directly since we get RUB:KZT which is what we need
 * @param {number} rate The currency rate to format
 * @param {number} decimals Number of decimal places (default: 6)
 * @returns {number} Formatted rate
 */
export function formatKZTRate(rate, decimals = 6) {
    if (typeof rate !== 'number' || isNaN(rate)) {
        throw new Error('Invalid currency rate');
    }
    
    return Number(rate.toFixed(decimals));
}