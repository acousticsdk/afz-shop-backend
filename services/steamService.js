import axios from 'axios';
import { config } from '../config.js';
import { generateSignature } from '../utils/signatureGenerator.js';

class SteamService {
    constructor() {
        // Initialize Antilopay API client
        this.antilopayClient = axios.create({
            baseURL: config.antilopay.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async checkAccount(steamAccount) {
        try {
            // Prepare request data
            const data = {
                project_identificator: config.antilopay.projectId,
                steam_account: steamAccount
            };

            // Generate signature according to Antilopay docs (section 3.4)
            const signature = generateSignature(data, config.antilopay.privateKey);

            // Make API request
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
            // Prepare request data
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

            // Generate signature according to Antilopay docs (section 3.4)
            const signature = generateSignature(data, config.antilopay.privateKey);

            // Make API request
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
}

// Export singleton instance
export const steamService = new SteamService();