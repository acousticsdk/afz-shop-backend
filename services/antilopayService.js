import logger from '../config/logger.js';
import { generateAntilopaySignature } from '../utils/antilopaySignature.js';

export class AntilopayService {
    constructor() {
        this.merchantId = process.env.ANTILOPAY_MERCHANT_ID;
        this.secretKey = process.env.ANTILOPAY_SECRET_KEY;
        this.projectId = process.env.ANTILOPAY_PROJECT_ID;
        this.baseUrl = 'https://lk.antilopay.com/api/v1';
        this.gateUrl = 'https://gate.antilopay.com/#payment';
    }

    async createPayment(paymentData) {
        try {
            const fullPaymentData = {
                ...paymentData,
                merchant: this.merchantId,
                project_identificator: this.projectId,
                secretKey: this.secretKey
            };

            // Generate signature
            const signature = generateAntilopaySignature(fullPaymentData);
            
            // Remove secret key before sending
            delete fullPaymentData.secretKey;

            logger.info('Creating payment request:', {
                url: `${this.baseUrl}/payment/create`,
                data: fullPaymentData,
                timestamp: new Date().toISOString()
            });

            const response = await fetch(`${this.baseUrl}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Apay-Sign': signature,
                    'X-Apay-Sign-Version': '1'
                },
                body: JSON.stringify(fullPaymentData)
            });

            const responseData = await response.json();
            logger.info('Antilopay response:', {
                status: response.status,
                data: responseData,
                timestamp: new Date().toISOString()
            });

            if (!response.ok || responseData.code !== 0) {
                throw new Error(responseData.error || responseData.message || 'Payment creation failed');
            }

            if (!responseData.payment_id) {
                logger.error('Invalid Antilopay response:', responseData);
                throw new Error('Payment ID not received from Antilopay');
            }

            const paymentUrl = `${this.gateUrl}/${responseData.payment_id}`;
            logger.info('Payment URL generated:', paymentUrl);

            return paymentUrl;
        } catch (error) {
            logger.error('Antilopay API error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
}