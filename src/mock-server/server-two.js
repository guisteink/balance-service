const express = require('express')
const app = express()
const port = 8002;
const timer = ms => new Promise( res => setTimeout(res, ms));

app.use('/', async (req, res) => {
    await timer(1000);

    res.json({
        "message": "Hello from fog server",
        "edge": false,
        "fog": true,
        "cloud": false
    });
});

app.listen(port, () => console.log(`Fog service is now running on ${port}!!! 🔥🔥🔥\n`));
