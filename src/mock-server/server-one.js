const express = require('express')
const app = express()
const port = 8001;
const timer = ms => new Promise( res => setTimeout(res, ms));

app.use('/', async (req, res) => {
    await timer(1000);

    res.json({
        "message": "Hello from edge server",
        "edge": true,
        "fog": false,
        "cloud": false
    });
});

app.listen(port, () => console.log(`Edge service is now running on ${port}!!! 🔥🔥🔥\n`));
