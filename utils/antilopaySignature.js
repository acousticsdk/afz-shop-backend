import crypto from 'crypto';
import logger from '../config/logger.js';

export function generateAntilopaySignature(data) {
    try {
        // Create a clean data object without secretKey
        const { secretKey, ...paymentData } = data;
        
        // Convert to JSON string without spaces
        const jsonString = JSON.stringify(paymentData);
        logger.debug('Data for signature:', jsonString);

        // Create signature using RSA-SHA256
        const sign = crypto.createSign('SHA256WithRSA');
        sign.write(jsonString);
        sign.end();

        // The private key should already be in correct format from the API
        return sign.sign(secretKey, 'base64');
    } catch (error) {
        logger.error('Signature generation error:', error);
        throw error;
    }
}