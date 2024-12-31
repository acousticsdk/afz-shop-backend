import logger from '../config/logger.js';

/**
 * Builds payment request data with all required fields
 */
export function buildPaymentData(params, config) {
    const {
        amount,
        description = 'Пополнение баланса Steam',
        steamLogin
    } = params;

    const requestData = {
        // Required fields
        project_identificator: config.projectId,
        amount: Number(amount).toFixed(2),
        order_id: `ORDER${Date.now()}`,
        currency: 'RUB',
        product_name: 'Пополнение Steam',
        product_type: 'services',

        // Optional but useful fields
        description: `${description} для ${steamLogin}`,
        secretKey: config.secretKey
    };

    logger.debug('Built payment data:', {
        ...requestData,
        secretKey: '[REDACTED]'
    });

    return requestData;
}