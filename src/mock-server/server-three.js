const express = require('express')
const { readFileSync, existsSync, writeFileSync } = require('fs');

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

    let processingTime = 0, success = 0;
    if (!existsSync('./processing-time-cloud.json')) {
        writeFileSync('./processing-time-cloud.json', JSON.stringify({ processingTime, success }));
    } else {
        const lastRunStr = readFileSync('./processing-time-cloud.json');
        const lastRun = JSON.parse(lastRunStr);
        processingTime += lastRun.processingTime;
        success += lastRun.success;

        processingTime = processingTime + timeSpent;
        success += 1;
        writeFileSync('./processing-time-cloud.json', JSON.stringify({ processingTime, success }));
    }

    res.json({ result, timeSpent, });
});

app.use('/health-check', async(req, res) => {
    console.info(`[cloud] health-check request received at ${new Date().toISOString()}`);
    res
        .status(200)
        .send({
            "result": "OK"
        });
});

// app.listen(port, () =>  console.log(`[🔥] Cloud service is now running on ${port}!!!\n`));
app.listen(port, () => {});
