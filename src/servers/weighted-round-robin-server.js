const express = require('express');
const axios = require('axios');
const WRR = require('../algorithms/weighted-round-robin');
require('dotenv').config();

const cloud_server = process.env.CLOUD;
const fog_server = process.env.FOG;
const edge_server = process.env.EDGE;

const port = 9000;
const app = express();
const servers = new WRR();

servers.add({ uri: `${edge_server}:8001/`, weight: 1 }); // edge server -> weight 1
servers.add({ uri: `${fog_server}:3000/`, weight: 2 }); // fog server -> weight 2
servers.add({ uri: `${cloud_server}:3000/`, weight: 3 }); // cloud server -> weight 3

let server;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  server = servers.get().uri;
  const { fibonacci } = req.query ?? 0;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });
    const { result, time } = response?.data ?? {};

    console.log(`${server},${timestamp},${time},${fibonacci}`)

    return res.json({
      value: result,
      time,
      server
    });
  } catch (error) {
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

app.listen(port, () => {})

module.exports = app;
