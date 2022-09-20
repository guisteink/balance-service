const express = require('express');
const app = express();
const axios = require('axios');
const port = 8000;
const WRR = require('./balancer/weighted-round-robin');

const servers = new WRR();

for(let i = 0; i < 2; i++) {
    servers.add({
        server: `http://localhost:800${i+1}/`,
        weight: i+1
    });
}

let server;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  server = servers.get().server;

  try {
    const response = await axios(server, { method: 'GET' });
    console.log(`response from ${server} is: ${response.data}`);
    res.json(response.data);
  } catch (error) {
    console.log(`proxy to ${server} failed: ${error}`);
    handler(req, res);
  }
}

app.use('/balance',(req, res) => { handler(req, res) });

app.listen(port, () => {
    console.log(`Default server on ${port}!!! 🔥🔥🔥\n`);
})
