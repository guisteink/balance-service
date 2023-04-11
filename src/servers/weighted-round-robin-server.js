const express = require('express');
const axios = require('axios');
const { writeFileSync } = require('fs');

const WRR = require('../algorithms/weighted-round-robin');
const loadFileMemory = require('../helpers/handleFileMemory');

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
let { total, success } = loadFileMemory() ?? 0;

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  total += 1;
  writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));

  server = servers.get().uri;
  const { fibonacci } = req.query ?? 0;

  try {
    const response = await axios(server, { method: 'GET', params: { fibonacci } });
    if(response.status === 200) {
      success += 1;
      writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
    }
    console.log(`response from ${server}\n`);
    res.json(response.data);
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

app.listen(port, () => {
    console.log(`\nStarting weighted-round-robin server on port ${port} 🔥🔥🔥\n`);
})

module.exports = app;
