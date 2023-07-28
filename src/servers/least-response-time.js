const express = require('express');
const axios = require('axios');
const os = require('os');
const cluster = require('cluster');

const leastResponseTime = require('../algorithms/least-response-time');

require('dotenv').config();

const DEFAULT_RESPONSE_TIME = 0;

const port = 6000;
const cloud_server = `${process.env.CLOUD}:3000`;
const fog_server = `${process.env.FOG}:3000/`;
const edge_server = `${process.env.EDGE}:8001/`;

const servers = [
  edge_server,
  fog_server,
  cloud_server,
];

let server,
  fibonacciKey = [];

const lrt = leastResponseTime.New(servers);

for(item of servers) {
  lrt.updateResponseTime(item, DEFAULT_RESPONSE_TIME);
}

const clusterWorkerSize = os.cpus().length;

if(clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for(let i = 0; i < 2; i++) cluster.fork();
    cluster.on("exit", function(worker) { console.log("Worker ", worker.id, " has exitted.") });
  } else {
    const app = express();

    app.use('/balance',(req, res) => { handler(req, res) });
    app.use('/health-check', async(req, res) => {
      console.info(`[load-balancer] health-check request received at ${new Date().toISOString()}`);
      res
          .status(200)
          .send({
              "result": "OK"
          });
    });

    app.listen(port);
  }
} else {
  const app = express();

  app.use('/balance',(req, res) => { handler(req, res) });
  app.use('/health-check', async(req, res) => {
    console.info(`[load-balancer] health-check request received at ${new Date().toISOString()}`);
    res
        .status(200)
        .send({
            "result": "OK"
        });
  });

  app.listen(port);
}

// * LOAD BALANCING HANDLER *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  fibonacciKey = [];

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  server = lrt.next();

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });

    const { result, time, cpuUsage } = response?.data ?? {};

    lrt.updateResponseTime(server, time);

    console.log(`${server},${timestamp},${time},${fibonacci},${cpuUsage}`)

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
