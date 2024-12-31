import logger from '../config/logger.js';
import { validateAmount } from './validators.js';
import { buildCustomerData } from './customerDataBuilder.js';

/**
 * Builds payment request data with all required fields
 * @throws {Error} If amount validation fails
 */
export function buildPaymentData(params, config) {
    const {
        amount,
        steamLogin,
        currency = 'RUB',
        orderId = `ORDER${Date.now()}`,
        successUrl,
        failUrl
    } = params;

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
        throw new Error(amountValidation.error);
    }

    const requestData = {
        // Required fields
        project_identificator: config.projectId,
        amount: amountValidation.value,
        order_id: orderId,
        currency,
        product_name: 'Пополнение Steam',
        product_type: 'goods',

        // Customer data
        customer: buildCustomerData(),

        // Optional fields
        description: `Пополнение Steam для ${steamLogin}`,
        success_url: successUrl,
        fail_url: failUrl,

        // Add secret key for signature generation
        secretKey: config.secretKey
    };

    logger.debug('Built payment data:', {
        ...requestData,
        secretKey: '[REDACTED]'
    });

    return requestData;
}