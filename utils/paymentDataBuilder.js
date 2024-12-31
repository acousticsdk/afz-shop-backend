import logger from '../config/logger.js';
import { validateAmount } from './validators.js';
import { validateCustomer } from './customerValidator.js';

export function buildPaymentData(params, config) {
    const {
        amount,
        steamLogin,
        currency = 'RUB',
        orderId = `ORDER${Date.now()}`,
        successUrl,
        failUrl,
        customer
    } = params;

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
        throw new Error(amountValidation.error);
    }

    // Validate and format customer data
    const validatedCustomer = validateCustomer({
        email: customer?.email || 'test@example.com',
        phone: customer?.phone || '79001234567',
        name: `Steam User ${steamLogin}`
    });

    const requestData = {
        merchant: config.merchantId,
        project_identificator: config.projectId,
        amount: amountValidation.value,
        order_id: orderId,
        currency,
        description: `Пополнение Steam для ${steamLogin}`,
        success_url: successUrl,
        fail_url: failUrl,
        customer: validatedCustomer,
        receipt: {
            customer: validatedCustomer,
            items: [{
                name: 'Пополнение баланса Steam',
                quantity: 1,
                price: amountValidation.value,
                sum: amountValidation.value,
                payment_method: 'full_prepayment',
                payment_object: 'service',
                vat: 'none'
            }]
        },
        secretKey: config.secretKey
    };

    logger.debug('Built payment data:', {
        ...requestData,
        secretKey: '[REDACTED]'
    });

    return requestData;
}