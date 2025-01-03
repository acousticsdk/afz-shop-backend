import axios from 'axios';
import { config } from '../config.js';

class SteamCurrencyService {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.steam-currency.ru',
            headers: {
                'Authorization': `Bearer ${config.steamCurrency.token}`,
                'Accept': 'application/json'
            }
        });
    }

    async getRates() {
        try {
            const response = await this.client.get('/v1/rates/all');
            
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

export const steamCurrencyService = new SteamCurrencyService();