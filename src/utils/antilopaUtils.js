import crypto from 'crypto';
import fetch from 'node-fetch';

export const createSignature = (data) => {
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(data));
  sign.end();
  return sign.sign(process.env.ANTILOPA_PRIVATE_KEY, 'base64');
};

export const makeAntilopaRequest = async (endpoint, data) => {
  const signature = createSignature(data);
  
  const response = await fetch(`${process.env.ANTILOPA_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Apay-Secret-Id': process.env.ANTILOPA_SECRET_ID,
      'X-Apay-Sign': signature,
      'X-Apay-Sign-Version': '1'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Antilopa API error: ${response.status}`);
  }

  return response;
};