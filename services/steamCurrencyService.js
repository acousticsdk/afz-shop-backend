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
            console.log('Getting currency rates...');
            
            // Check cache first
            if (this.cache.rates && Date.now() - this.cache.lastUpdate < 5 * 60 * 1000) {
                console.log('Returning cached rates:', this.cache.rates);
                return this.cache.rates;
            }

            // Log request details
            console.log('Making API request to Steam Currency API');

            // Get rates for required currency pairs
            const response = await this.client.get('/currencies', {
                params: {
                    pairs: 'USD:RUB,KZT:RUB'
                }
            });

            // Log raw response
            console.log('API Response:', response.data);

            // Transform response to match expected format
            const rates = {
                data: {
                    currencies: []
                }
            };

            // Parse response and extract rates
            if (response.data && Array.isArray(response.data.pairs)) {
                response.data.pairs.forEach(pair => {
                    const [currency] = pair.pair.split(':');
                    rates.data.currencies.push({
                        code: currency,
                        rate: pair.rate ? (1 / pair.rate) : null
                    });
                });
            }

            // Log transformed rates
            console.log('Transformed rates:', rates);

            // Update cache
            this.cache.rates = rates;
            this.cache.lastUpdate = Date.now();

            return rates;
        } catch (error) {
            // Log detailed error information
            console.error('Steam currency rates error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    params: error.config?.params,
                    headers: {
                        ...error.config?.headers,
                        'api-token': '[REDACTED]'
                    }
                }
            });
            
            // Return fallback rates if API fails
            const fallbackRates = {
                data: {
                    currencies: [
                        { code: 'KZT', rate: 4.99 },
                        { code: 'USD', rate: 0.99 }
                    ]
                }
            };
            
            console.log('Using fallback rates:', fallbackRates);
            return fallbackRates;
        }
    }
}

export const steamCurrencyService = new SteamCurrencyService();