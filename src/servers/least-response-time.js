const leastResponseTime = require('../algorithms/least-response-time');
const express = require('express');
const axios = require('axios');

const port = 6000;
const app = express();
const DEFAULT_RESPONSE_TIME = 0;

// const servers = [
//   "http://localhost:8001/",
//   "http://localhost:8002/",
//   "http://localhost:8003/"
// ];

const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  "http://15.229.85.148:3000/", // fog server -> weight 2
  "http://54.78.193.27:3000/", // cloud server -> weight 3
];


let server,
  fibonacciKey = [];

const lrt = leastResponseTime.New(servers);

for(item of servers) {
  lrt.updateResponseTime(item, DEFAULT_RESPONSE_TIME);
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

    const { result, time} = response?.data ?? {};

    lrt.updateResponseTime(server, time);

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

app.listen(port, () => {})

module.exports = app;

// // todo: aplicar camada de express e handle aqui
// const balancer = leastResponseTime.New(urls);
// await leastResponseTime.updateResponseTime(lastUrl, responseTime);

// const nextURL = balancer.next();
