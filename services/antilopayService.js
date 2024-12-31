import logger from '../config/logger.js';
import { generateAntilopaySignature } from '../utils/antilopaySignature.js';
import { buildPaymentData } from '../utils/paymentDataBuilder.js';

export class AntilopayService {
    constructor() {
        this.config = {
            merchantId: process.env.ANTILOPAY_MERCHANT_ID,
            secretId: process.env.ANTILOPAY_SECRET_ID,
            projectId: process.env.ANTILOPAY_PROJECT_ID,
            secretKey: process.env.ANTILOPAY_SECRET_KEY,
            baseUrl: 'https://lk.antilopay.com/api/v1',
            gateUrl: 'https://gate.antilopay.com/#payment'
        };
    }

    async createPayment(params) {
        try {
            const requestData = buildPaymentData(params, this.config);
            
            // Log the complete request data before signature
            logger.info('Complete payment request data:', {
                ...requestData,
                secretKey: '[REDACTED]'
            });

            const signature = generateAntilopaySignature(requestData);
            
            // Remove secret key before sending
            delete requestData.secretKey;

            // Log the final request that will be sent
            logger.info('Final request data being sent:', {
                url: `${this.config.baseUrl}/payment/create`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Apay-Sign': signature,
                    'X-Apay-Sign-Version': '1',
                    'X-Apay-Secret-Id': '[REDACTED]'
                },
                body: requestData
            });

            const response = await fetch(`${this.config.baseUrl}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Apay-Sign': signature,
                    'X-Apay-Sign-Version': '1',
                    'X-Apay-Secret-Id': this.config.secretId
                },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();
            logger.info('Payment API response:', responseData);

            if (!response.ok || responseData.code !== 0) {
                throw new Error(responseData.error || 'Payment creation failed');
            }

            return `${this.config.gateUrl}/${responseData.payment_id}`;
        } catch (error) {
            logger.error('Payment creation error:', error);
            throw error;
        }
    }
}