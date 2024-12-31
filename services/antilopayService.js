import crypto from 'crypto';

export class AntilopayService {
  constructor() {
    this.merchantId = process.env.ANTILOPAY_MERCHANT_ID;
    this.secretKey = process.env.ANTILOPAY_SECRET_KEY;
    this.baseUrl = process.env.ANTILOPAY_API_URL;
    this.gateUrl = process.env.ANTILOPAY_GATE_URL;
  }

  generateSignature(data) {
    const signString = [
      data.merchant,
      data.amount,
      data.currency,
      data.orderId,
      data.description,
      data.successUrl || '',
      data.failUrl || '',
      data.capture || '',
      data.ttl?.toString() || '',
      data.customer?.email || '',
      data.customer?.phone || ''
    ].join('|');

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signString)
      .digest('base64');
  }

  async createPayment(order) {
    const payload = {
      merchant: this.merchantId,
      amount: order.finalAmount.toFixed(2),
      currency: 'RUB',
      orderId: order.orderId,
      description: `Пополнение Steam для ${order.steamLogin}`,
      successUrl: `${process.env.FRONTEND_URL}/success`,
      failUrl: `${process.env.FRONTEND_URL}/fail`,
      capture: 'AUTO',
      ttl: 3600,
      customer: {
        email: 'test@example.com',
        phone: '79001234567'
      },
      receipt: {
        items: [{
          name: 'Пополнение баланса Steam',
          quantity: 1,
          price: order.finalAmount,
          sum: order.finalAmount,
          payment_method: 'full_prepayment',
          payment_object: 'service'
        }]
      }
    };

    payload.signature = this.generateSignature(payload);

    const response = await fetch(`${this.baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment creation failed');
    }

    const { payment_id, payment_url } = await response.json();
    return payment_url || `${this.gateUrl}/${payment_id}`;
  }
}