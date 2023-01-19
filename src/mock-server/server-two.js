const express = require('express')
const { readFileSync, existsSync, writeFileSync } = require('fs');

const fibonacciNumberRecursive = require('../helpers/fibonacciNumberRecursive');
const timer = require('../helpers/timer');

const app = express()
const port = 8002;

app.use('/', async (req, res) => {
    const { fibonacci } = req.query;

    let start = new Date().getTime();
    let result = await fibonacciNumberRecursive(fibonacci)
    let end = new Date().getTime();

    let timeSpent = timer(start, end);
    console.log(`processing time: ${timeSpent} seconds`);

    let processingTime = 0, success = 0;
    if (!existsSync('./processing-time-fog.json')) {
        writeFileSync('./processing-time-fog.json', JSON.stringify({ processingTime, success }));
    } else {
        const lastRunStr = readFileSync('./processing-time-fog.json');
        const lastRun = JSON.parse(lastRunStr);
        processingTime += lastRun.processingTime;
        success += lastRun.success;

        processingTime = processingTime + timeSpent;
        success += 1;
        writeFileSync('./processing-time-fog.json', JSON.stringify({ processingTime, success }));
    }

    res.json({
        "result": `Hello from fog server, the result for the ${fibonacci}th fibonacci number is: ${result}`,
        "processing_time_in_fog": `${timer(start, end)} seconds`
    });
    return res;
});

app.use('/health-check', async(req, res) => {
    console.info(`[two] health-check request received at ${new Date().toISOString()}`);
    res
        .status(200)
        .send({
            "result": "OK"
        });
});

app.listen(port, () => console.log(`[🔥] Fog service is now running on ${port}!!!\n`));
