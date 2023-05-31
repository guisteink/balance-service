const express = require('express');
const axios = require('axios');
const WRR = require('../../algorithms/weighted-round-robin');

const port = 9000;
const app = express();
const servers = new WRR();

for(let i = 0; i <= 2; i++) {
    servers.add({
        uri: `http://localhost:800${i+1}/`,
        weight: i+1
    });
}

let server;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  server = servers.get().uri;
  const { fibonacci } = req.query ?? 0;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });
    const { result, timeSpent } = response?.data ?? {};

    console.log(`${timestamp},${fibonacci},${timeSpent}`)

    return res.json({
      value: result,
      time: 0,
      service: lastService
    });
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

app.listen(port, () => {})

module.exports = app;
