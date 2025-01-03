import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config.js';

class SteamService {
    constructor() {
        this.antilopayClient = axios.create({
            baseURL: config.antilopay.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-Project-ID': config.antilopay.projectId
            }
        });
    }

    generateSignature(data) {
        try {
            // Create signature string according to API documentation
            const signatureString = [
                data.project_id || '',
                data.steam_account || '',
                data.amount?.toString() || '',
                data.currency || '',
                data.order_id || '',
                data.success_url || '',
                data.fail_url || ''
            ].join('|');

            console.log('Generating signature for:', signatureString);

            // Create signature using SHA256 with RSA
            const sign = crypto.createSign('SHA256');
            sign.update(signatureString);
            const signature = sign.sign(config.antilopay.privateKey, 'base64');

            console.log('Generated signature:', signature);
            return signature;
        } catch (error) {
            console.error('Signature generation error:', error);
            throw error;
        }
    }

    async checkAccount(steamAccount) {
        try {
            console.log('Steam account check request:', {
                url: `${config.antilopay.baseUrl}/steam/account/check`,
                projectId: config.antilopay.projectId,
                steamAccount
            });

            const requestData = {
                project_id: config.antilopay.projectId,
                steam_account: steamAccount
            };

            const signature = this.generateSignature(requestData);

            const response = await this.antilopayClient.post('/steam/account/check', requestData, {
                headers: {
                    'X-Signature': signature
                }
            });

            console.log('Steam account check response:', {
                status: response.status,
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

    async createTopup(params) {
        try {
            console.log('Creating Steam topup request:', {
                url: `${config.antilopay.baseUrl}/steam/topup/create`,
                params: {
                    ...params,
                    project_id: config.antilopay.projectId
                }
            });

            const requestData = {
                project_id: config.antilopay.projectId,
                steam_account: params.steam_account,
                amount: params.amount,
                currency: params.currency || 'RUB',
                order_id: params.order_id,
                success_url: params.success_url,
                fail_url: params.fail_url,
                description: params.description || 'Steam balance top-up'
            };

            const signature = this.generateSignature(requestData);

            const response = await this.antilopayClient.post('/steam/topup/create', requestData, {
                headers: {
                    'X-Signature': signature
                }
            });

            console.log('Steam topup response:', {
                status: response.status,
                data: response.data
            });

            if (!response.data.payment_url) {
                throw new Error('Payment URL not received from server');
            }

            return {
                payment_url: response.data.payment_url
            };
        } catch (error) {
            console.error('Steam topup detailed error:', {
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

            throw new Error(error.response?.data?.error || 'Failed to create Steam topup');
        }
    }
}

export const steamService = new SteamService();