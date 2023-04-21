const express = require('express');
const axios = require('axios');
const { writeFileSync } = require('fs');

const roundRobin = require('../algorithms/round-robin');
const loadFileMemory = require('../helpers/handleFileMemory');

const app = express();
const port = 8000;
const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  // "http://15.228.239.16:8000/", // edge server on aws -> weight 1 :
  "http://localhost:8002/", // fog server -> weight 2
  "http://localhost:8003/", // cloud server -> weight 3
  // "http://35.178.232.188:8000/", // cloud server on aws -> weight 3
];

let current = 0,
  server,
  fibonacciKey = [];

let { total, success } = loadFileMemory() ?? {};

// * LOAD BALANCING HANDLER *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  total += 1;
  fibonacciKey = [];

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  current = roundRobin(servers.length, current);
  server = servers[current];

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });
    if(response.status === 200) {
      success += 1;
      writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
    }

    const { result, timeSpent } = response?.data ?? {};

    console.log(`${timestamp},${fibonacci},${timeSpent}`)

    writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));

    return res.json({
      value: result,
      time: 0,
      service: lastService
    });
  }
  catch (error) {
    throw new Error(`proxy to ${server} failed: ${error}`);
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

app.listen(port, () => {})

module.exports = app;
