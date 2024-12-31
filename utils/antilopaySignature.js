import crypto from 'crypto';
import logger from '../config/logger.js';

export function generateAntilopaySignature(data) {
    try {
        // Create signature string according to Antilopay documentation
        const signatureFields = [
            data.merchant,
            data.project_identificator,
            data.amount,
            data.currency,
            data.orderId,
            data.description || '',
            data.successUrl || '',
            data.failUrl || '',
            data.capture || '',
            data.ttl?.toString() || '',
            data.customer?.email || '',
            data.customer?.phone || ''
        ];

        const signString = signatureFields.join('|');

        logger.debug('Generating signature with string:', signString);

        // Create HMAC SHA256 signature
        const signature = crypto
            .createHmac('sha256', data.secretKey)
            .update(signString)
            .digest('base64');

        logger.debug('Generated signature:', signature);

        return signature;
    } catch (error) {
        logger.error('Signature generation error:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}
