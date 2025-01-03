import axios from 'axios';
import { config } from '../config.js';

class SteamCurrencyService {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.steam-currency.ru/v3',
            headers: {
                'api-token': config.steamCurrency.token,
                'Accept': 'application/json'
            }
        });
        
        // Cache rates for 5 minutes
        this.cache = {
            rates: null,
            lastUpdate: 0
        };
    }

    async getRates() {
        try {
            // Check cache first
            if (this.cache.rates && Date.now() - this.cache.lastUpdate < 5 * 60 * 1000) {
                return this.cache.rates;
            }

            // Get rates for required currency pairs
            const [usdRate, kztRate] = await Promise.all([
                this.client.get('/currency/USD:RUB'),
                this.client.get('/currency/KZT:RUB')
            ]);

            // Transform response to match expected format
            const rates = {
                data: {
                    currencies: [
                        {
                            code: 'USD',
                            rate: usdRate.data.rate ? (1 / usdRate.data.rate) : null
                        },
                        {
                            code: 'KZT',
                            rate: kztRate.data.rate ? (1 / kztRate.data.rate) : null
                        }
                    ]
                }
            };

            // Update cache
            this.cache.rates = rates;
            this.cache.lastUpdate = Date.now();

            return rates;
        } catch (error) {
            console.error('Steam currency rates error:', error.response?.data || error);
            
            // Return fallback rates if API fails
            return {
                data: {
                    currencies: [
                        { code: 'KZT', rate: 7.77 },
                        { code: 'USD', rate: 0.99 }
                    ]
                }
            };
        }
    }
}

export const steamCurrencyService = new SteamCurrencyService();