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
            // Format amount to always have 2 decimal places
            const formattedAmount = Number(paymentData.amount).toFixed(2);
            
            // Prepare request data according to API specification
            const requestData = {
                merchant: this.merchantId,
                project_identificator: this.projectId,
                amount: formattedAmount,
                currency: 'RUB', // API requires uppercase
                order_id: paymentData.orderId,
                description: paymentData.description,
                success_url: paymentData.successUrl || `${process.env.FRONTEND_URL}/success`,
                fail_url: paymentData.failUrl || `${process.env.FRONTEND_URL}/fail`,
                secretKey: this.secretKey
            };

            // Generate signature
            const signature = generateAntilopaySignature(requestData);

            // Remove secretKey before sending
            delete requestData.secretKey;

            logger.info('Creating payment request:', {
                url: `${this.baseUrl}/payment/create`,
                data: requestData
            });

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
                throw new Error(responseData.error || responseData.message || 'Payment creation failed');
            }

            return `${this.gateUrl}/${responseData.payment_id}`;
        } catch (error) {
            logger.error('Payment creation error:', error);
            throw error;
        }
    }
}