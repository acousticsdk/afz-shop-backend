import crypto from 'crypto';
import logger from '../config/logger.js';

export function generateAntilopaySignature(data) {
    try {
        // Remove fields that shouldn't be in the signature
        const paymentData = { ...data };
        delete paymentData.secretKey;
        delete paymentData.signature;

        // Convert data to JSON string without spaces
        const jsonString = JSON.stringify(paymentData);
        
        logger.debug('Payment data for signature:', jsonString);

        // Format private key for crypto
        const privateKey = `${data.secretKey}`;

        // Create signature using RSA-SHA256
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(jsonString);
        const signature = sign.sign(privateKey, 'base64');

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