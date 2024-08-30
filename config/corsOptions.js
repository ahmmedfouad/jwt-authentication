const allowedOrigins = require('./allowedOrigins');
const cors = require('cors'); // Ensure cors is installed

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 ) {
            // Allow requests with no origin (e.g., Postman or mobile apps)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (e.g., cookies, headers)
    optionsSuccessStatus: 200, // For legacy browser support
};

module.exports = corsOptions;
