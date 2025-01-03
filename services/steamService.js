import axios from 'axios';
import { config } from '../config.js';
import { generateSignature } from '../utils/signatureGenerator.js';

class SteamService {
    constructor() {
        this.antilopayClient = axios.create({
            baseURL: config.antilopay.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.steamCurrencyClient = axios.create({
            baseURL: config.steamCurrency.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.steamCurrency.token}`
            }
        });
    }

    async checkAccount(steamAccount) {
        try {
            const data = {
                project_identificator: config.antilopay.projectId,
                steam_account: steamAccount
            };

            // Generate SHA256WithRSA signature
            const signature = generateSignature(data, config.antilopay.privateKey);

            const response = await this.antilopayClient.post('/steam/account/check', data, {
                headers: {
                    'X-Signature': signature
                }
            });

            return response.data;
        } catch (error) {
            console.error('Steam account check error:', {
                error: error.response?.data || error.message,
                status: error.response?.status
            });
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
                currency: params.currency,
                order_id: params.order_id,
                description: params.description,
                customer: params.customer
            };

            // Generate SHA256WithRSA signature
            const signature = generateSignature(data, config.antilopay.privateKey);

            const response = await this.antilopayClient.post('/steam/topup/create', data, {
                headers: {
                    'X-Signature': signature
                }
            });

            return response.data;
        } catch (error) {
            console.error('Steam topup creation error:', {
                error: error.response?.data || error.message,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.error || 'Failed to create Steam topup');
        }
    }

    async getRates() {
        try {
            const response = await this.steamCurrencyClient.get('/rates');
            return response.data;
        } catch (error) {
            console.error('Steam currency rates error:', {
                error: error.response?.data || error.message,
                status: error.response?.status
            });
            throw new Error('Failed to get currency rates');
        }
    }
}

export const steamService = new SteamService();