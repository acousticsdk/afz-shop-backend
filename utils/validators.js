export function validateAmount(amount) {
    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Amount must be a valid number' };
    }
    
    if (numAmount <= 0) {
        return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    return { 
        isValid: true, 
        value: Number(numAmount.toFixed(2))
    };
}