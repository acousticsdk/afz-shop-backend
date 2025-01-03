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
            const pairs = ['USD:RUB', 'RUB:KZT'];
            const requests = pairs.map(pair => this.client.get(`/currency/${pair}`));
            const responses = await Promise.all(requests);
            
            // Transform response to match expected format
            const rates = {
                data: {
                    currencies: []
                }
            };

            // Process each currency pair
            responses.forEach(response => {
                const [from, to] = response.data.pair.split(':');
                const rate = response.data.rate;

                if (from === 'USD' && to === 'RUB') {
                    // USD:RUB rate needs to be inverted for USD rate
                    rates.data.currencies.push({
                        code: 'USD',
                        rate: 1/rate
                    });
                } else if (from === 'RUB' && to === 'KZT') {
                    // RUB:KZT rate can be used directly
                    rates.data.currencies.push({
                        code: 'KZT',
                        rate: rate
                    });
                }
            });

            // Update cache
            this.cache.rates = rates;
            this.cache.lastUpdate = Date.now();

            return rates;
        } catch (error) {
            console.error('Steam currency rates error:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to get currency rates');
        }
    }
}

export const steamCurrencyService = new SteamCurrencyService();