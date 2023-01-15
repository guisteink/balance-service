const express = require('express');
const axios = require('axios');
const { writeFileSync } = require('fs');

const roundRobin = require('../algorithms/round-robin');
const loadFileMemory = require('../helpers/handleFileMemory');

const app = express();
const port = 8000;
const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  "http://localhost:8002/", // fog server -> weight 2
  "http://localhost:8003/", // cloud server -> weight 3
];

let current = 0,
  server;

let { total, success } = loadFileMemory() ?? 0;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  total += 1;
  writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));

  current = roundRobin(servers.length, current)
  server = servers[current];
  const { fibonacci } = req.query ?? 0;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });
    if(response.status === 200) {
      success += 1;
      writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
    }
    console.log(`response from ${server}\n`);
    res.json(response.data);
  } catch (error) {
    console.log(`proxy to ${server} failed: ${error}`);
    handler(req, res);
  }
}

app.use('/balance',(req, res) => { handler(req, res) });

app.use('/health-check', async(req, res) => {
  console.info(`[load-balancer] health-check request received at ${new Date().toISOString()}`);
  res
      .status(200)
      .send({
          "result": "OK"
      });
});

app.listen(port, () => {
    console.log(`\nStarting round-robin server on port ${port} 🔥🔥🔥\n`);
})
