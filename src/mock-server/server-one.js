const express = require('express')
const app = express()
const port = 8001;
const fibonacciNumberRecursive = require('../helpers/fibonacciNumberRecursive');
const timer = require('../helpers/timer');

app.use('/', async (req, res) => {
    const { fibonacci } = req.query ?? 0;

    let start = new Date().getTime();
    let result = await fibonacciNumberRecursive(fibonacci)
    let end = new Date().getTime();

    console.log(`processing time: ${timer(start, end)} seconds`);

    res.json({
        "result": `Hello from edge server, the result for the ${fibonacci}th fibonacci number is: ${result}`,
        "processing_time_in_edge": `${timer(start, end)} seconds`
    });
});

app.listen(port, () => console.log(`[🔥] Edge service is now running on ${port}!!!\n`));
// app.listen(port, () => {});
