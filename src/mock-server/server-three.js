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

    console.log(`processing time: ${timer(start, end)} seconds`);

    res.json({
        "result": `Hello from cloud server, the result for the ${fibonacci}th fibonacci number is: ${result}`,
        "processing_time_in_cloud": `${timer(start, end)} seconds`
    });
    return res;
});

app.use('/health-check', async(req, res) => {
    console.info(`[cloud] health-check request received at ${new Date().toISOString()}`);
    res
        .status(200)
        .send({
            "result": "OK"
        });
});

app.listen(port, () =>  console.log(`[🔥] Cloud service is now running on ${port}!!!\n`));
