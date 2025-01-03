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
    }

    async checkAccount(steamAccount) {
        try {
            console.log('Steam account check request:', {
                url: `${config.antilopay.baseUrl}/steam/account/check`,
                projectId: config.antilopay.projectId,
                steamAccount,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = {
                project_identificator: config.antilopay.projectId,
                steam_account: steamAccount
            };

            const signature = generateSignature(data, config.antilopay.privateKey);
            console.log('Generated signature:', signature);

            const response = await this.antilopayClient.post('/steam/account/check', data, {
                headers: {
                    'X-Signature': signature
                }
            });

            console.log('Steam account check response:', {
                status: response.status,
                headers: response.headers,
                data: response.data
            });

            return {
                can_topup: response.data.can_topup === true,
                error: response.data.error
            };
        } catch (error) {
            console.error('Steam account check detailed error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    data: error.config?.data
                }
            });
            throw new Error(error.response?.data?.error || 'Failed to check Steam account');
        }
    }

    // ... rest of the code remains the same
}

export const steamService = new SteamService();