import crypto from 'crypto';

export class AntilopayService {
    constructor() {
        this.merchantId = process.env.ANTILOPAY_MERCHANT_ID;
        this.secretKey = process.env.ANTILOPAY_SECRET_KEY;
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
            paymentData.signature = this.generateSignature(paymentData);

            const response = await fetch(`${this.baseUrl}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Payment creation failed');
            }

            const { payment_id, payment_url } = await response.json();
            return payment_url || `${this.gateUrl}/${payment_id}`;
        } catch (error) {
            console.error('Antilopay API error:', error);
            throw error;
        }
    }
}
