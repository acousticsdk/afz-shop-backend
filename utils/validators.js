const STEAM_LOGIN_RULES = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 32,
    PATTERN: /^[a-zA-Z0-9_]+$/
};

export function validateSteamLogin(login) {
    if (!login) {
        return {
            isValid: false,
            error: 'Login is required'
        };
    }

    if (login.length < STEAM_LOGIN_RULES.MIN_LENGTH) {
        return {
            isValid: false,
            error: `Login must be at least ${STEAM_LOGIN_RULES.MIN_LENGTH} characters`
        };
    }

    if (login.length > STEAM_LOGIN_RULES.MAX_LENGTH) {
        return {
            isValid: false,
            error: `Login cannot exceed ${STEAM_LOGIN_RULES.MAX_LENGTH} characters`
        };
    }

    if (!STEAM_LOGIN_RULES.PATTERN.test(login)) {
        return {
            isValid: false,
            error: 'Login can only contain letters, numbers, and underscores'
        };
    }

    return {
        isValid: true,
        error: null
    };
}

export function validateAmount(amount) {
    const MIN_AMOUNT = 100;
    const MAX_AMOUNT = 15000;
    
    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
        return { 
            isValid: false, 
            error: 'Amount must be a valid number' 
        };
    }
    
    if (numAmount < MIN_AMOUNT) {
        return { 
            isValid: false, 
            error: `Amount must be at least ${MIN_AMOUNT}₽` 
        };
    }

    if (numAmount > MAX_AMOUNT) {
        return { 
            isValid: false, 
            error: `Amount cannot exceed ${MAX_AMOUNT}₽` 
        };
    }
    
    return { 
        isValid: true, 
        value: Number(numAmount.toFixed(2))
    };
}