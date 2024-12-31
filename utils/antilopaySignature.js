import crypto from 'crypto';
import logger from '../config/logger.js';
import { formatPrivateKey } from './keyFormatter.js';

export function generateAntilopaySignature(data) {
    try {
        // Create a clean data object for signature
        const paymentData = {
            project_identificator: data.project_identificator,
            amount: data.amount,
            order_id: data.order_id,
            currency: data.currency,
            description: data.description
        };

        // Convert to JSON string without spaces
        const jsonString = JSON.stringify(paymentData);
        logger.debug('Data for signature:', jsonString);

        const sign = crypto.createSign('RSA-SHA256');
        sign.update(jsonString);
        
        // Format the private key before signing
        const formattedKey = formatPrivateKey(data.secretKey);
        
        return sign.sign(formattedKey, 'base64');
    } catch (error) {
        logger.error('Signature generation error:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}