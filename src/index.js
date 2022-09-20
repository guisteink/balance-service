const express = require('express');
const app = express();
const axios = require('axios');
const port = 8000;
const roundRobin = require('./balancer/round-robin');

const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  "http://localhost:8002/", // fog server -> weight 2
  "http://localhost:8003/", // cloud server -> weight 3
]

let current = 0,
  server;

// TODO: Fazer o direcionamento de algoritmo de acordo com o argumento passado pela req.query (rr, wrr)
// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  current = roundRobin(servers.length, current)
  server = servers[current];

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
