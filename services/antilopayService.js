import logger from '../config/logger.js';
import { generateAntilopaySignature } from '../utils/antilopaySignature.js';

export class AntilopayService {
    constructor() {
        this.merchantId = process.env.ANTILOPAY_MERCHANT_ID;
        this.secretId = process.env.ANTILOPAY_SECRET_ID;
        this.projectId = process.env.ANTILOPAY_PROJECT_ID;
        this.secretKey = process.env.ANTILOPAY_SECRET_KEY;
        this.baseUrl = 'https://lk.antilopay.com/api/v1';
        this.gateUrl = 'https://gate.antilopay.com/#payment';
    }

    async createPayment(paymentData) {
        try {
            // Prepare request data with correct parameter formats
            const requestData = {
                merchant: this.merchantId,
                project_identificator: this.projectId,
                amount: Number(paymentData.amount).toFixed(2),
                currency: 'RUB', // Uppercase currency code
                order_id: `ORDER${Date.now()}`, // Prefix order ID for uniqueness
                description: paymentData.description || 'Пополнение баланса Steam',
                secretKey: this.secretKey
            };

            logger.info('Creating payment with data:', {
                ...requestData,
                secretKey: '[REDACTED]'
            });

            const signature = generateAntilopaySignature(requestData);
            delete requestData.secretKey;

            const response = await fetch(`${this.baseUrl}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Apay-Sign': signature,
                    'X-Apay-Sign-Version': '1',
                    'X-Apay-Secret-Id': this.secretId
                },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();
            logger.info('Payment API response:', responseData);

            if (!response.ok || responseData.code !== 0) {
                throw new Error(responseData.error || 'Payment creation failed');
            }

            return `${this.gateUrl}/${responseData.payment_id}`;
        } catch (error) {
            logger.error('Payment creation error:', error);
            throw error;
        }
    }
}