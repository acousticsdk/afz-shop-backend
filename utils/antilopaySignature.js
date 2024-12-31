import crypto from 'crypto';
import logger from '../config/logger.js';

function formatPrivateKey(key) {
    // Remove any existing headers/footers and whitespace
    let cleanKey = key.replace(/-----BEGIN RSA PRIVATE KEY-----|-----END RSA PRIVATE KEY-----|\n|\r/g, '');
    
    // Add proper PEM formatting
    const formattedKey = [
        '-----BEGIN RSA PRIVATE KEY-----',
        ...cleanKey.match(/.{1,64}/g) || [], // Split into 64-character lines
        '-----END RSA PRIVATE KEY-----'
    ].join('\n');

    return formattedKey;
}

export function generateAntilopaySignature(data) {
    try {
        // Remove fields that shouldn't be in the signature
        const paymentData = { ...data };
        delete paymentData.secretKey;
        delete paymentData.signature;

        // Convert data to JSON string without spaces
        const jsonString = JSON.stringify(paymentData);
        
        logger.debug('Payment data for signature:', jsonString);

        // Format and validate private key
        const privateKey = formatPrivateKey(data.secretKey);

        try {
            // Verify the key is valid by attempting to import it
            crypto.createPrivateKey(privateKey);
        } catch (keyError) {
            logger.error('Invalid private key format:', keyError);
            throw new Error('Invalid private key format');
        }

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