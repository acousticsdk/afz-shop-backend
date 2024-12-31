import crypto from 'crypto';
import logger from '../config/logger.js';
import { formatPrivateKey } from './keyFormatter.js';

export function generateAntilopaySignature(data) {
    try {
        // Create a clean data object without secretKey
        const { secretKey, ...paymentData } = data;
        
        // Convert to JSON string without spaces
        const jsonString = JSON.stringify(paymentData);
        logger.debug('Data for signature:', jsonString);

        // Format the private key properly
        const formattedKey = formatPrivateKey(secretKey);

        // Create signature using SHA256 with RSA
        const sign = crypto.createSign('sha256');
        sign.write(jsonString);
        sign.end();

        return sign.sign(formattedKey, 'base64');
    } catch (error) {
        logger.error('Signature generation error:', error);
        throw error;
    }
}