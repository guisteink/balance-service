const express = require('express')
const app = express()
const port = 8001;

app.listen(port, () => {
    console.log(`Edge service is now running on ${port}!!! 🔥🔥🔥\n`);

    // sleep(3000) // 3s
    // return res.json({
    //     "message": "Hello from edge server"
    // })
})
