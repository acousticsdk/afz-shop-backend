/**
 * Formats a base64 private key into PEM format
 * @param {string} key - Base64 encoded private key
 * @returns {string} PEM formatted private key
 */
export function formatPrivateKey(key) {
    // Remove any existing PEM headers/footers and whitespace
    const cleanKey = key.replace(/-----(BEGIN|END) RSA PRIVATE KEY-----/g, '')
                       .replace(/\s/g, '');
    
    const header = '-----BEGIN RSA PRIVATE KEY-----\n';
    const footer = '\n-----END RSA PRIVATE KEY-----';
    
    // Add line breaks every 64 characters
    const formattedKey = cleanKey.match(/.{1,64}/g).join('\n');
    
    return header + formattedKey + footer;
}