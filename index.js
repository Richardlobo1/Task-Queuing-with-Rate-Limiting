
const express = require('express');
const path = require('path');
// const fetch = require('node-fetch')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const redis = require('./redis_client.js');
const rateLimiter = require('./RateLimit.js');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const port = 3000; // or any available port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Middleware to validate user ID in request body
function validateUserID(req, res, next) {
    const userID = req.body.userID;
    if (!userID) {
        return res.status(400).json({ response: 'error', message: 'userID is required' });
    }
    next();
}

// API route with 1 task per second and 20 tasks per minute limits
app.post('/api1', validateUserID, rateLimiter({
    secondsWindow: 60,
    allowedHitsPerMinute: 20,
    allowedHitsPerSecond: 1
}), async (req, res) => {
    return res.json({
        response: 'ok',
        callsInAMinute: req.requestsMinute,
        callsInASecond: req.requestsSecond,
        ttl: req.ttl
    });
});
