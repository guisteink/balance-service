const express = require('express');
const axios = require('axios');
const roundRobin = require('../algorithms/round-robin');
require('dotenv').config();

const app = express();

const port = 8000;

const cloud_server = process.env.CLOUD;
const fog_server = process.env.FOG;
const edge_server = process.env.EDGE;

const servers = [
  `${edge_server}:8001/`,
  `${fog_server}:3000/`,
  `${cloud_server}:3000/`,
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
