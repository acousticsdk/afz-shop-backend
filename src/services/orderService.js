import { makeAntilopaRequest } from '../utils/antilopaUtils.js';

export const createOrder = async (orderData) => {
  try {
    const data = {
      project_identificator: process.env.ANTILOPA_PROJECT_ID,
      amount: orderData.amount,
      topup_amount: orderData.topupAmount,
      order_id: orderData.orderId,
      currency: "RUB",
      steam_account: orderData.steamAccount,
      description: "Пополнение Steam аккаунта",
      customer: {
        email: orderData.customerEmail,
      },
      success_url: orderData.successUrl,
      fail_url: orderData.failUrl
    };

    const response = await makeAntilopaRequest('/steam/topup/create', data);
    const responseData = await response.json();

    if (responseData.payment_url) {
      return { payment_url: responseData.payment_url };
    } else {
      throw new Error(responseData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};