const env = process.env.NODE_ENV || 'development';

// Primero intentamos cargar el archivo específico del ambiente si existe
if (process.env.NODE_ENV) {
  require('dotenv').config({ path: `.env.${env}` });
}

require('dotenv').config();
const config = {

    development: {
        APP_KEY: process.env.APP_KEY,
        APP_SECRET: process.env.APP_SECRET,
        REFRESH_TOKEN: process.env.REFRESH_TOKEN,
        PORT: process.env.PORT,
    },
    /*
    production: {
        PORT: 4000,
        DATABASE_URL: 'mongodb://localhost:27017/test_db',
        API_KEY: process.env.TEST_API_KEY || 'test_key_123',
        EMAIL_SERVICE: {
            host: process.env.TEST_EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.TEST_EMAIL_PORT || 587
        }
    }
    */
};

module.exports = config[env];


