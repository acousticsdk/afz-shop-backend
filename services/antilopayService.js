import crypto from 'crypto';
import logger from '../config/logger.js';

export class AntilopayService {
    constructor() {
        this.merchantId = process.env.ANTILOPAY_MERCHANT_ID;
        this.secretKey = process.env.ANTILOPAY_SECRET_KEY;
        this.projectId = process.env.ANTILOPAY_PROJECT_ID;
        this.baseUrl = 'https://lk.antilopay.com/api/v1';
        this.gateUrl = 'https://gate.antilopay.com/#payment';
    }

    generateSignature(data) {
        const signString = [
            data.merchant,
            data.amount,
            data.currency,
            data.orderId,
            data.description,
            data.successUrl || '',
            data.failUrl || '',
            data.capture || '',
            data.ttl?.toString() || '',
            data.customer?.email || '',
            data.customer?.phone || ''
        ].join('|');

        return crypto
            .createHmac('sha256', this.secretKey)
            .update(signString)
            .digest('base64');
    }

    async createPayment(paymentData) {
        try {
            const fullPaymentData = {
                ...paymentData,
                merchant: this.merchantId,
                project_identificator: this.projectId,
                capture: 'AUTO',
                ttl: 3600,
                signature: ''
            };

            fullPaymentData.signature = this.generateSignature(fullPaymentData);

            logger.info('Creating payment request:', {
                url: `${this.baseUrl}/payment/create`,
                data: fullPaymentData
            });

            const response = await fetch(`${this.baseUrl}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Apay-Secret-Id': this.secretKey // Add required header
                },
                body: JSON.stringify(fullPaymentData)
            });

            const responseData = await response.json();
            logger.info('Antilopay response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || responseData.message || 'Payment creation failed');
            }

            const { payment_id } = responseData;
            if (!payment_id) {
                throw new Error('Payment ID not received from Antilopay');
            }

            return `${this.gateUrl}/${payment_id}`;
        } catch (error) {
            logger.error('Antilopay API error:', {
                message: error.message,
                stack: error.stack,
                data: error.response?.data
            });
            throw error;
        }
    }
}
