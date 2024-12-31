export const deploymentConfig = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI,
    frontendUrl: process.env.FRONTEND_URL
};