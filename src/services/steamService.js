import { createSignature, makeAntilopaRequest } from '../utils/antilopaUtils.js';

export const checkSteamAccount = async (steamAccount) => {
  try {
    const data = {
      project_identificator: process.env.ANTILOPA_PROJECT_ID,
      steam_account: steamAccount
    };

    const response = await makeAntilopaRequest('/steam/account/check', data);
    return { code: response.status };
  } catch (error) {
    console.error('Steam account check error:', error);
    throw error;
  }
};