import crypto from 'crypto';
import logger from '../config/logger.js';

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
        
        return sign.sign(data.secretKey, 'base64');
    } catch (error) {
        logger.error('Signature generation error:', error);
        throw new Error('Failed to generate signature');
    }
}