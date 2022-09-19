const express = require('express')
const app = express()
const port = 8003;

app.listen(port, () => {
    console.log(`Cloud service is now running on ${port}!!! 🔥🔥🔥\n`);

    // sleep(3000) // 3s
    // return res.json({
    //     "message": "Hello from cloud server"
    // })
})
