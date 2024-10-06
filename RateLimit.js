const redis = require('./redis_client');

function rateLimiter({ secondsWindow, allowedHitsPerMinute, allowedHitsPerSecond }) {
    return async function (req, res, next) {
        const userID = req.body.userID;

        // Rate limiting per second
        const secondKey = `${userID}:second`;
        let requestsSecond = await redis.incr(secondKey);
        let ttlSecond;
        
        // If requestsSecond is falsy (i.e., undefined, null, etc.), set it to 1
        if (!requestsSecond) {
            requestsSecond = 1;
        }

        if (requestsSecond === 1) {
            await redis.expire(secondKey, 1); // Expire after 1 second
            ttlSecond = 1;
        } else {
            ttlSecond = await redis.ttl(secondKey);
            // If ttlSecond is undefined, set it to 0 to prevent undefined values in the response
            if (ttlSecond === -1) {
                ttlSecond = 0;
            }
        }

        // Rate limiting per minute
        const minuteKey = `${userID}:minute`;
        let requestsMinute = await redis.incr(minuteKey);
        let ttlMinute;

        // If requestsMinute is falsy, set it to 1
        if (!requestsMinute) {
            requestsMinute = 1;
        }

        if (requestsMinute === 1) {
            await redis.expire(minuteKey, secondsWindow); // Expire after 60 seconds
            ttlMinute = secondsWindow;
        } else {
            ttlMinute = await redis.ttl(minuteKey);
            if (ttlMinute === -1) {
                ttlMinute = 0;
            }
        }

        // Log the values for debugging
        console.log(`UserID: ${userID}, Requests per second: ${requestsSecond}, Requests per minute: ${requestsMinute}`);
        console.log(`TTL for second window: ${ttlSecond}, TTL for minute window: ${ttlMinute}`);

        // Check if either limit is exceeded
        if (requestsSecond > allowedHitsPerSecond || requestsMinute > allowedHitsPerMinute) {
            return res.status(503).json({
                response: 'error',
                callsInSecond: requestsSecond,
                callsInMinute: requestsMinute,
                ttlSecond,
                ttlMinute
            });
        } else {
            req.requestsSecond = requestsSecond;
            req.requestsMinute = requestsMinute;
            req.ttl = Math.min(ttlSecond, ttlMinute);
            next();
        }
    };
}

module.exports = rateLimiter;
