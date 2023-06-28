const express = require('express');
const axios = require('axios');
const leastConnections = require('../algorithms/least-connection');

const port = 7000;
const app = express();

// const servers = [
//   new URL("http://localhost:8001/"),
//   new URL("http://localhost:8002/"),
//   new URL("http://localhost:8003/")
// ];
const servers = [
  new URL("http://localhost:8001/"),
  new URL("http://15.229.85.148:3000/"),
  new URL("http://54.78.193.27:3000/")
];

let server,
  fibonacciKey = [];

const lc = leastConnections.New(servers);

// * LOAD BALANCING HANDLER *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  fibonacciKey = [];

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  const [nextURL, done] = lc.next();
  const { origin } = nextURL ?? {};
  server = origin;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });

    done();

    const { result, time } = response?.data ?? {};

    console.log(`${server},${timestamp},${time},${fibonacci}`)

    return res.json({
      value: result,
      time: time,
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
