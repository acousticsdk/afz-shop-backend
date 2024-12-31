/**
 * Validates payment amount
 * @param {number|string} amount Amount to validate
 * @returns {{isValid: boolean, error?: string, value?: number}} Validation result
 */
export function validateAmount(amount) {
    // Convert to number and check validity
    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Amount must be a valid number' };
    }
    
    if (numAmount <= 0) {
        return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    // Return the numeric value with 2 decimal precision
    return { 
        isValid: true, 
        value: Number(numAmount.toFixed(2))
    };
}