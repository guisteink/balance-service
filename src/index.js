const express = require('express');
const axios = require('axios');
const roundRobin = require('./algorithms/round-robin');

const app = express();
const port = 8000;
const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  "http://localhost:8002/", // fog server -> weight 2
  "http://localhost:8003/", // cloud server -> weight 3
];

let current = 0,
  server;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  current = roundRobin(servers.length, current)
  server = servers[current];
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
    console.log(`\nStarting round-robin server on port ${port} 🔥🔥🔥\n`);
})
