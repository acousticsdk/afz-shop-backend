import logger from '../config/logger.js';
import { API_CONFIG } from '../config/apiConfig.js';
import { generateAntilopaySignature } from '../utils/antilopaySignature.js';

export class SteamService {
    constructor(config) {
        this.config = config;
    }

    async validateSteamAccount(steamLogin) {
        try {
            // Call Steam API to validate account
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STEAM.CHECK_ACCOUNT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Merchant-Id': this.config.merchantId,
                    'X-Secret-Key': this.config.secretKey
                },
                body: JSON.stringify({ login: steamLogin })
            });

            const data = await response.json();
            logger.info('Steam account validation response:', data);

            return {
                isValid: response.ok && data.can_topup === true,
                error: !response.ok ? data.message : null
            };
        } catch (error) {
            logger.error('Steam account validation error:', error);
            throw new Error('Failed to validate Steam account');
        }
    }

    async createTopup(params) {
        try {
            const requestData = {
                login: params.login,
                amount: params.amount,
                currency: params.currency || 'RUB',
                order_id: params.orderId,
                success_url: params.successUrl,
                fail_url: params.failUrl,
                secretKey: this.config.secretKey
            };

            // Generate signature
            const signature = generateAntilopaySignature(requestData);

            // Remove secret key before sending
            delete requestData.secretKey;

            logger.info('Steam topup request:', {
                ...requestData,
                signature: '[REDACTED]'
            });

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STEAM.TOPUP}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Merchant-Id': this.config.merchantId,
                    'X-Secret-Key': this.config.secretKey,
                    'X-Signature': signature
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create Steam topup');
            }

            return data.payment_url;
        } catch (error) {
            logger.error('Steam topup creation error:', error);
            throw error;
        }
    }
}