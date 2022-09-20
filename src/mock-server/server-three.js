const express = require('express')
const app = express()
const port = 8003;
const timer = ms => new Promise( res => setTimeout(res, ms));

app.use('/', async (req, res) => {
    await timer(1000);

    res.json({
        "message": "Hello from cloud server",
        "edge": false,
        "fog": false,
        "cloud": true
    });
});

app.listen(port, () =>  console.log(`Cloud service is now running on ${port}!!! 🔥🔥🔥\n`));
