import { formatPhone } from './formatters.js';

/**
 * Validates and formats customer data
 * @param {Object} customer Customer data
 * @returns {Object} Validated and formatted customer data
 */
export function validateCustomer(customer) {
    const { email, phone, name } = customer;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
    }

    // Validate and format phone
    const formattedPhone = formatPhone(phone);
    if (!formattedPhone) {
        throw new Error('Invalid phone format');
    }

    return {
        email,
        phone: formattedPhone,
        name: name || 'Customer'
    };
}