const express = require('express')
const fibonacciNumberRecursive = require('../helpers/fibonacciNumberRecursive');
const timer = require('../helpers/timer');

const app = express()
const port = 8003;

app.use('/', async (req, res) => {
    const { fibonacci } = req.query ?? 0;

    let start = new Date().getTime();
    let result = await fibonacciNumberRecursive(fibonacci)
    let end = new Date().getTime();

    let timeSpent = timer(start, end);

    res.json({ result, timeSpent, });
});

app.use('/health-check', async(req, res) => {
    console.info(`health-check request received at ${new Date().toISOString()}`);
    res
        .status(200)
        .send({
            "result": "OK"
        });
});

app.listen(port);
