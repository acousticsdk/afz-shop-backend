export const API_CONFIG = {
    BASE_URL: process.env.API_BASE_URL || 'https://lk.antilopay.com/api/v1',
    ENDPOINTS: {
        STEAM: {
            CHECK_ACCOUNT: '/steam/account/check',
            TOPUP: '/steam/topup/create'
        }
    }
};