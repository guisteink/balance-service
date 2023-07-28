const express = require('express');
const axios = require('axios');
const os = require('os');
const cluster = require('cluster');

const roundRobin = require('../algorithms/round-robin');

require('dotenv').config();

const port = 8000;

const edge_server = process.env.EDGE;
const fog_server = process.env.FOG;
const cloud_server = process.env.CLOUD;

const servers = [
  `${edge_server}:8001/`,
  `${fog_server}:3000/`,
  `${cloud_server}:3000/`,
];

const clusterWorkerSize = os.cpus().length;

if(clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for(let i = 0; i < 2; i++) {
        cluster.fork();
    }

    cluster.on("exit", function(worker) {
        console.log("Worker ", worker.id, " has exitted.")
    });
  } else {
    //* 2 thread handling */
    const app = express();

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

        const { result, time, cpuUsage } = response?.data ?? {};

        console.log(`${server},${timestamp},${time},${fibonacci},${cpuUsage}`)

        return res.json({
          value: result,
          time,
          server,
          cpu_usage: cpuUsage
        });
      }
      catch (error) {
        // todo: testar ponto de falha caso 1 server caia, redirect handler
        console.log(`proxy to ${server} failed: ${error}`);
        handler(req, res);
        // throw new Error(`proxy to ${server} failed: ${error}`);
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

    app.listen(port);
  }
}
else {
  //* 1 thread handling */
  const app = express();

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

      const { result, time, cpuUsage } = response?.data ?? {};

      console.log(`${server},${timestamp},${time},${fibonacci},${cpuUsage}`)

      return res.json({
        value: result,
        time,
        server,
        cpu_usage: cpuUsage
      });
    }
    catch (error) {
      // todo: testar ponto de falha caso 1 server caia, redirect handler
      console.log(`proxy to ${server} failed: ${error}`);
      handler(req, res);
      // throw new Error(`proxy to ${server} failed: ${error}`);
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

  app.listen(port);
}
