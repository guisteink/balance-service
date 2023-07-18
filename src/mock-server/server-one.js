const express = require('express')
const fibonacciNumberRecursive = require('../helpers/fibonacciNumberRecursive');
const timer = require('../helpers/timer');

const app = express()
const port = 8001;

app.use('/', async (req, res) => {
    const { fibonacci } = req.query ?? 0;
    try {
        let start = new Date().getTime();
        let result = await fibonacciNumberRecursive(fibonacci)
        let end = new Date().getTime();

        let time = timer(start, end);

        res.send({ result, time, });
    } catch (error) {
        console.log(error);
        throw new Error('Failed to calculate fibonacci number', error);
    }
});

app.use('/health-check', async(req, res) => {
    console.info(`[service] health-check request received at ${new Date().toISOString()}`);
    res
        .status(200)
        .send({
            "result": "OK"
        });
});

app.listen(port, () => console.log(`\n\n[🔥][${process.pid}-work-thread] running on ${port}!!!\n`));
