import crypto from 'crypto';

/**
 * Generates SHA256WithRSA signature for Antilopay API requests
 * @param {Object} data Request data
 * @param {string} privateKey RSA private key in PEM format
 * @returns {string} Base64 encoded signature
 */
export function generateSignature(data, privateKey) {
    // Create signature string according to documentation
    const signatureString = [
        data.project_identificator || '',
        data.steam_account || '',
        data.amount?.toString() || '',
        data.topup_amount?.toString() || '',
        data.currency || '',
        data.order_id || '',
        data.description || '',
        data.customer?.email || ''
    ].join('');

    // Create signature using SHA256 with RSA
    const sign = crypto.createSign('SHA256');
    sign.update(signatureString);
    
    // Sign and return base64 encoded signature
    return sign.sign(privateKey, 'base64');
}