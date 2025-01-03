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

            // First get available currencies
            console.log('Getting available currencies...');
            const availableResponse = await this.client.get('/currency/available');
            console.log('Available currencies response:', availableResponse.data);

            // Get rates for each currency pair
            const rates = {
                data: {
                    currencies: []
                }
            };

            // Get rates for KZT and USD
            for (const currency of ['KZT', 'USD']) {
                try {
                    console.log(`Getting rate for ${currency}:RUB`);
                    const response = await this.client.get(`/currency/${currency}:RUB`);
                    console.log(`${currency} rate response:`, response.data);

                    if (response.data && response.data.rate) {
                        rates.data.currencies.push({
                            code: currency,
                            rate: 1 / response.data.rate // Invert rate to match our format
                        });
                    }
                } catch (currencyError) {
                    console.error(`Error getting ${currency} rate:`, currencyError.response?.data || currencyError);
                }
            }

            // Log transformed rates
            console.log('Final transformed rates:', rates);

            // Update cache if we got at least one rate
            if (rates.data.currencies.length > 0) {
                this.cache.rates = rates;
                this.cache.lastUpdate = Date.now();
            }

            return rates;
        } catch (error) {
            console.error('Steam currency rates error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
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
                        { code: 'KZT', rate: 4.75 },
                        { code: 'USD', rate: 0.0091 }
                    ]
                }
            };
            
            console.log('Using fallback rates:', fallbackRates);
            return fallbackRates;
        }
    }
}

export const steamCurrencyService = new SteamCurrencyService();