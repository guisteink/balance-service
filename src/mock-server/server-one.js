const express = require('express')
const { performance } = require('perf_hooks');

const fibonacciNumberRecursive = require('../helpers/fibonacciNumberRecursive');

const app = express()
const port = 8001;

app.use('/', async (req, res) => {
    let result, now, cpuUsage;
    now = new Date().toISOString();
    const { fibonacci } = req.query ?? 0;

    try {
        await performance.mark('start');

        result = await fibonacciNumberRecursive(fibonacci);

        const cpuInUse = await performance.eventLoopUtilization();
        await performance.mark('end');

        cpuUsage = cpuInUse.utilization.toFixed(3);
        performance.measure('execution_time', 'start', 'end');
    } catch (error) {
        console.log(error);
        throw new Error('Failed to calculate fibonacci number', error);
    }

    const time = performance.getEntriesByName('execution_time')[0]?.duration?.toFixed(3);
    console.info(`\n[${process.pid}-work-thread][cpu-usage-${cpuUsage*100}%][${time}ms] fibonnaci ${fibonacci}th request received at ${now}`);

    performance.clearMeasures();

    res
        .status(200)
        .send({
            result,
            time,
            cpuUsage
        });
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
