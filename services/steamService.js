import logger from '../config/logger.js';

export class SteamService {
    constructor(config) {
        this.config = config;
    }

    async validateSteamAccount(steamLogin) {
        try {
            const response = await fetch(`${this.config.baseUrl}/steam/account/check`, {
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
            const response = await fetch(`${this.config.baseUrl}/steam/topup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Merchant-Id': this.config.merchantId,
                    'X-Secret-Key': this.config.secretKey
                },
                body: JSON.stringify({
                    login: params.steamLogin,
                    amount: params.amount,
                    currency: params.currency || 'RUB',
                    order_id: params.orderId,
                    success_url: params.successUrl,
                    fail_url: params.failUrl
                })
            });

            const data = await response.json();
            logger.info('Steam topup response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create Steam topup');
            }

            return data.payment_url;
        } catch (error) {
            logger.error('Steam topup error:', error);
            throw error;
        }
    }
}