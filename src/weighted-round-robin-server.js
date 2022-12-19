const express = require('express');
const axios = require('axios');
const WRR = require('./algorithms/weighted-round-robin');

const port = 8000;
const app = express();
const servers = new WRR();

for(let i = 0; i <= 2; i++) {
    servers.add({
        uri: `http://localhost:800${i+1}/`,
        weight: i+3
    });
}

let server;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  server = servers.get().uri;
  const { fibonacci } = req.query ?? 0;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });
    console.log(`response from ${server}\n`);
    res.json(response.data);
  } catch (error) {
    console.log(`proxy to ${server} failed: ${error}`);
    handler(req, res);
  }
}

app.use('/balance',(req, res) => { handler(req, res) });

app.listen(port, () => {
    console.log(`\nStarting weighted-round-robin server on port ${port} 🔥🔥🔥\n`);
})
