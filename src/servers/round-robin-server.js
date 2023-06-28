const express = require('express');
const axios = require('axios');
const roundRobin = require('../algorithms/round-robin');

const app = express();
//todo: .env
const port = 8000;
// const servers = [
//   // "http://localhost:8001/", // edge server -> weight 1
//   // "http://localhost:8002/", // fog server -> weight 2
//   // "http://localhost:8003/", // cloud server -> weight 3
// ];

const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  "http://15.229.85.148:3000/", // fog server -> weight 2
  "http://54.78.193.27:3000/", // cloud server -> weight 3
];

let current = 0,
  server,
  fibonacciKey = [];

// * LOAD BALANCING HANDLER *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  fibonacciKey = [];

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  current = roundRobin(servers.length, current);
  server = servers[current];

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });

    const { result, time } = response?.data ?? {};

    console.log(`${server},${timestamp},${time},${fibonacci}`)

    return res.json({
      value: result,
      time,
      server
    });
  }
  catch (error) {
    // todo: testar ponto de falha caso 1 server caia, redirect handler
    // console.log(`proxy to ${server} failed: ${error}`);
    // handler(req, res);
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

app.listen(port)

module.exports = app;
