/**
 * Validates and formats payment amount
 * @param {number|string} amount Amount to validate
 * @returns {{isValid: boolean, error?: string, value?: string}} Validation result
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
    
    // Format to 2 decimal places
    const formattedAmount = numAmount.toFixed(2);
    
    return { isValid: true, value: formattedAmount };
}