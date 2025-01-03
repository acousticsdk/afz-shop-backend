import { ANTILOPAY_CONFIG } from '../config/antilopayConfig.js';
import logger from '../config/logger.js';

export class AntilopayService {
    constructor() {
        this.config = ANTILOPAY_CONFIG;
    }

    async validateSteamAccount(steamLogin) {
        try {
            // Log request details
            logger.info('Sending Steam account validation request:', {
                url: `${this.config.BASE_URL}/steam/account/check`,
                method: 'POST',
                steamLogin,
                projectId: this.config.PROJECT_ID
            });

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

            // Log response details
            logger.info('Steam account validation response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                steamLogin
            });

            // Handle response based on status code as per documentation
            switch (response.status) {
                case 200:
                    logger.info('Steam account validation successful', { steamLogin });
                    return { isValid: true };
                case 400:
                    logger.warn('Invalid Steam account validation request', { steamLogin });
                    return { isValid: false, error: 'Invalid request data' };
                case 403:
                    logger.warn('API access forbidden for Steam account validation', { steamLogin });
                    return { isValid: false, error: 'API access forbidden' };
                case 404:
                    logger.warn('Steam account not found or cannot be topped up', { steamLogin });
                    return { isValid: false, error: 'Steam account not found or cannot be topped up' };
                case 500:
                    logger.error('Server error during Steam account validation', { steamLogin });
                    return { isValid: false, error: 'Server error, please try again later' };
                default:
                    logger.error('Unexpected response status', { 
                        status: response.status, 
                        steamLogin 
                    });
                    return { isValid: false, error: 'Unknown error occurred' };
            }
        } catch (error) {
            logger.error('Steam account validation error:', {
                error: error.message,
                stack: error.stack,
                steamLogin
            });
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

            // Log request details
            logger.info('Sending Steam topup request:', {
                url: `${this.config.BASE_URL}/steam/topup/create`,
                method: 'POST',
                requestData: {
                    ...requestData,
                    project_identificator: '[REDACTED]'
                }
            });

            const response = await fetch(`${this.config.BASE_URL}/steam/topup/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.SECRET_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            // Log response details
            logger.info('Steam topup response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const error = await response.json();
                logger.error('Steam topup error response:', {
                    status: response.status,
                    error: error.message || 'Unknown error'
                });
                throw new Error(error.message || 'Failed to create topup');
            }

            const data = await response.json();
            logger.info('Steam topup success:', {
                paymentUrl: data.payment_url,
                steamLogin
            });

            return data.payment_url;
        } catch (error) {
            logger.error('Steam topup creation error:', {
                error: error.message,
                stack: error.stack,
                params: {
                    ...params,
                    project_identificator: '[REDACTED]',
                    secret_key: '[REDACTED]'
                }
            });
            throw error;
        }
    }
}