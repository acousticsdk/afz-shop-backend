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
            const [usdResponse, kztResponse] = await Promise.all([
                this.client.get('/currency/USD:RUB'),
                this.client.get('/currency/RUB:KZT')
            ]);

            // Transform response to match expected format
            const rates = {
                data: {
                    currencies: [
                        {
                            code: 'USD',
                            rate: 1 / usdResponse.data.rate // Invert USD:RUB rate to get USD rate
                        },
                        {
                            code: 'KZT',
                            rate: kztResponse.data.rate // Use RUB:KZT rate directly
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
                        { code: 'KZT', rate: 4.75 },
                        { code: 'USD', rate: 0.0091 }
                    ]
                }
            };
        }
    }
}

export const steamCurrencyService = new SteamCurrencyService();