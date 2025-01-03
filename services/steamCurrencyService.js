import axios from 'axios';
import { config } from '../config.js';
import { formatCurrencyRate, formatKZTRate } from '../utils/currencyFormatter.js';

class SteamCurrencyService {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.steam-currency.ru/v3',
            headers: {
                'api-token': config.steamCurrency.token,
                'Accept': 'application/json'
            }
        });
        
        this.cache = {
            rates: null,
            lastUpdate: 0,
            CACHE_DURATION: 60 * 60 * 1000 // 5 minutes
        };
    }

    async getRates() {
        try {
            console.log('Getting currency rates...');
            
            if (this.isCacheValid()) {
                console.log('Returning cached rates:', this.cache.rates);
                return this.cache.rates;
            }

            const rates = {
                data: {
                    currencies: []
                }
            };

            // Get both currency pairs with proper parameters
            const [usdRate, kztRate] = await Promise.all([
                this.getCurrencyRate('USD:RUB', 5),
                this.getCurrencyRate('RUB:KZT', 5)
            ]);

            console.log('USD:RUB rate:', usdRate);
            console.log('RUB:KZT rate:', kztRate);

            if (usdRate) {
                rates.data.currencies.push({
                    code: 'USD',
                    rate: formatCurrencyRate(usdRate)
                });
            }

            if (kztRate) {
                rates.data.currencies.push({
                    code: 'KZT',
                    rate: formatKZTRate(kztRate)
                });
            }

            // Update cache if we got at least one rate
            if (rates.data.currencies.length > 0) {
                this.updateCache(rates);
            }

            console.log('Final rates:', rates);
            return rates;

        } catch (error) {
            console.error('Steam currency rates error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            return this.getFallbackRates();
        }
    }

    async getCurrencyRate(pair, count = 5) {
        try {
            console.log(`Getting ${pair} rate`);
            const response = await this.client.get(`/currency/${pair}`, {
                params: { count }
            });
            
            if (response.data?.data?.length > 0) {
                // Sort by created_at in descending order and get the latest rate
                const latestRate = response.data.data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                
                if (latestRate?.close_price) {
                    const rate = parseFloat(latestRate.close_price);
                    console.log(`Latest ${pair} rate:`, rate);
                    return rate;
                }
            }
            
            return null;
        } catch (error) {
            console.error(`Error getting ${pair} rate:`, error.response?.data);
            return null;
        }
    }

    isCacheValid() {
        return (
            this.cache.rates && 
            Date.now() - this.cache.lastUpdate < this.cache.CACHE_DURATION
        );
    }

    updateCache(rates) {
        this.cache.rates = rates;
        this.cache.lastUpdate = Date.now();
        console.log('Cache updated:', this.cache);
    }

    getFallbackRates() {
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

export const steamCurrencyService = new SteamCurrencyService();