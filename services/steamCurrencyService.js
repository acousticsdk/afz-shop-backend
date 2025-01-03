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

            const rates = {
                data: {
                    currencies: []
                }
            };

            // Get USD:RUB rate
            try {
                console.log('Getting USD:RUB rate');
                const usdResponse = await this.client.get('/currency/USD:RUB', {
                    params: { count: 1 }
                });
                
                console.log('USD:RUB response:', usdResponse.data);

                if (Array.isArray(usdResponse.data) && usdResponse.data.length > 0) {
                    const latestUsdRate = usdResponse.data
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                    
                    if (latestUsdRate?.close_price) {
                        rates.data.currencies.push({
                            code: 'USD',
                            // Convert USD:RUB rate to RUB:USD rate
                            rate: 1 / parseFloat(latestUsdRate.close_price)
                        });
                    }
                }
            } catch (usdError) {
                console.error('Error getting USD:RUB rate:', usdError.response?.data);
            }

            // Get RUB:KZT rate
            try {
                console.log('Getting RUB:KZT rate');
                const kztResponse = await this.client.get('/currency/RUB:KZT', {
                    params: { count: 1 }
                });
                
                console.log('RUB:KZT response:', kztResponse.data);

                if (Array.isArray(kztResponse.data) && kztResponse.data.length > 0) {
                    const latestKztRate = kztResponse.data
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                    
                    if (latestKztRate?.close_price) {
                        rates.data.currencies.push({
                            code: 'KZT',
                            rate: parseFloat(latestKztRate.close_price)
                        });
                    }
                }
            } catch (kztError) {
                console.error('Error getting RUB:KZT rate:', kztError.response?.data);
            }

            // Log final rates
            console.log('Final rates:', rates);

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
                status: error.response?.status
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