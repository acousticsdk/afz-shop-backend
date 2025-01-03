import { ANTILOPAY_CONFIG } from '../config/antilopayConfig.js';
import logger from '../config/logger.js';

export class AntilopayService {
    constructor() {
        this.config = ANTILOPAY_CONFIG;
    }

    async validateSteamAccount(steamLogin) {
        try {
            const response = await fetch(`${this.config.BASE_URL}/steam/account/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    project_identificator: this.config.PROJECT_ID,
                    steam_account: steamLogin
                })
            });

            logger.info('Steam account validation response:', {
                status: response.status,
                steamLogin
            });

            // Handle response based on status code as per documentation
            switch (response.status) {
                case 200:
                    return { isValid: true };
                case 400:
                    return { isValid: false, error: 'Invalid request data' };
                case 403:
                    return { isValid: false, error: 'API access forbidden' };
                case 404:
                    return { isValid: false, error: 'Steam account not found or cannot be topped up' };
                case 500:
                    return { isValid: false, error: 'Server error, please try again later' };
                default:
                    return { isValid: false, error: 'Unknown error occurred' };
            }
        } catch (error) {
            logger.error('Steam account validation error:', error);
            return { 
                isValid: false, 
                error: 'Failed to validate Steam account'
            };
        }
    }

    async createTopup(params) {
        try {
            const { steamLogin, amount, currency = 'RUB' } = params;

            const requestData = {
                project_identificator: this.config.PROJECT_ID,
                steam_account: steamLogin,
                amount: parseFloat(amount).toFixed(2),
                currency
            };

            const response = await fetch(`${this.config.BASE_URL}/steam/topup/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.SECRET_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create topup');
            }

            const data = await response.json();
            return data.payment_url;
        } catch (error) {
            logger.error('Steam topup creation error:', error);
            throw error;
        }
    }
}