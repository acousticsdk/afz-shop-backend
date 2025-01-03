import axios from 'axios';
import { config } from '../config.js';
import { generateSignature } from '../utils/signatureGenerator.js';

class SteamService {
    constructor() {
        // Antilopay API client
        this.antilopayClient = axios.create({
            baseURL: config.antilopay.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Steam Currency API client
        this.steamCurrencyClient = axios.create({
            baseURL: 'https://api.steam-currency.ru',
            headers: {
                'Authorization': `Bearer ${config.steamCurrency.token}`,
                'Accept': 'application/json'
            }
        });
    }

    async checkAccount(steamAccount) {
        try {
            const data = {
                project_identificator: config.antilopay.projectId,
                steam_account: steamAccount
            };

            const signature = generateSignature(data, config.antilopay.privateKey);

            const response = await this.antilopayClient.post('/steam/account/check', data, {
                headers: {
                    'X-Signature': signature
                }
            });

            return {
                can_topup: response.data.can_topup === true,
                error: response.data.error
            };
        } catch (error) {
            console.error('Steam account check error:', error.response?.data || error);
            throw new Error(error.response?.data?.error || 'Failed to check Steam account');
        }
    }

    async createTopup(params) {
        try {
            const data = {
                project_identificator: config.antilopay.projectId,
                steam_account: params.steam_account,
                amount: params.amount,
                topup_amount: params.topup_amount,
                currency: params.currency || 'RUB',
                order_id: params.order_id,
                description: params.description,
                customer: params.customer
            };

            const signature = generateSignature(data, config.antilopay.privateKey);

            const response = await this.antilopayClient.post('/steam/topup/create', data, {
                headers: {
                    'X-Signature': signature
                }
            });

            return {
                payment_url: response.data.payment_url,
                order_id: response.data.order_id
            };
        } catch (error) {
            console.error('Steam topup creation error:', error.response?.data || error);
            throw new Error(error.response?.data?.error || 'Failed to create Steam topup');
        }
    }

    async getRates() {
        try {
            // Steam Currency API returns rates in format described in their docs
            const response = await this.steamCurrencyClient.get('/v1/rates/all');
            
            // Transform response to match expected format
            const rates = {
                data: {
                    currencies: Object.entries(response.data.rates).map(([code, rate]) => ({
                        code,
                        rate: parseFloat(rate)
                    }))
                }
            };

            return rates;
        } catch (error) {
            console.error('Steam currency rates error:', error.response?.data || error);
            throw new Error('Failed to get currency rates');
        }
    }
}

export const steamService = new SteamService();