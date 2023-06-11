const express = require('express');
const axios = require('axios');
const leastConnections = require('../algorithms/least-connection');

const port = 7000;
const app = express();

const servers = [
  new URL("http://localhost:8001/"),
  new URL("http://localhost:8002/"),
  new URL("http://localhost:8003/")
];

let current = 0,
  server,
  fibonacciKey = [];

const balancer = leastConnections.New(servers);

const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  fibonacciKey = [];

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  const [nextURL] = balancer.next();
  const { origin } = nextURL ?? {};
  server = origin;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });

    const { result, timeSpent } = response?.data ?? {};

    console.log(`${timestamp},${timeSpent},${fibonacci}`)

    return res.json({
      value: result,
      time: 0,
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

app.listen(port, () => {})

module.exports = app;
