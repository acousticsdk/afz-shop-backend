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

            // Get rates for each currency pair
            const rates = {
                data: {
                    currencies: []
                }
            };

            // Get rates for KZT and USD using RUB as base
            for (const currency of ['KZT', 'USD']) {
                try {
                    // Use RUB:KZT instead of KZT:RUB for proper rate
                    console.log(`Getting rate for RUB:${currency}`);
                    const response = await this.client.get(`/currency/RUB:${currency}`);
                    console.log(`RUB:${currency} rate response:`, response.data);

                    if (response.data && response.data.rate) {
                        rates.data.currencies.push({
                            code: currency,
                            rate: response.data.rate // Use rate directly as it's already in correct format
                        });
                    }
                } catch (currencyError) {
                    console.error(`Error getting RUB:${currency} rate:`, currencyError.response?.data || currencyError);
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
                        { code: 'KZT', rate: 5.55 },
                        { code: 'USD', rate: 6.666 }
                    ]
                }
            };
            
            console.log('Using fallback rates:', fallbackRates);
            return fallbackRates;
        }
    }
}

export const steamCurrencyService = new SteamCurrencyService();