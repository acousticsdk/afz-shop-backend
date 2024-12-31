import crypto from 'crypto';
import logger from '../config/logger.js';

export function generateAntilopaySignature(data) {
    try {
        // Create a clean payment data object without sensitive fields
        const paymentData = { ...data };
        delete paymentData.secretKey;
        delete paymentData.signature;

        // Convert to JSON string without spaces
        const jsonString = JSON.stringify(paymentData);
        logger.debug('Payment data for signature:', jsonString);

        // Create signature using RSA-SHA256
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(jsonString);
        
        // The private key should be in PEM format
        const privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${data.secretKey}\n-----END RSA PRIVATE KEY-----`;
        
        try {
            const signature = sign.sign(privateKey, 'base64');
            logger.debug('Generated signature:', signature);
            return signature;
        } catch (signError) {
            logger.error('Signature generation failed:', signError);
            throw new Error('Failed to generate signature');
        }
    } catch (error) {
        logger.error('Signature generation error:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}