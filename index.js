const express = require('express');
const path = require('path')
// const fetch = require('node-fetch')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const redis = require('./redis_client.js')
const rateLimiter = require('./RateLimit.js')
const app = express()
// app.arguments(express.json())
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
const port = 3000; // or any available port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


app.post('/api1', rateLimiter({ secondsWindow: 60, allowedHits: 20 }), async (req, res) => {
    return res.json({
        response: 'ok',
        callsInAMinute: req.requests,  
        ttl: req.ttl
    })
}
)

app.post('/api2', rateLimiter({ secondsWindow: 5, allowedHits: 1 }),
    async (req, res) => {
        return res.json({
            response: 'ok',
            callsInAMinute: 0
        })
    })
app.post('/api3', async(req, res)=>{
return res.json({
    response: 'ok',
    callsInAMinute: 0
})

})