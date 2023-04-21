const express = require('express');
const axios = require('axios');
const { writeFileSync } = require('fs');
const redis = require('redis');

const WRR = require('../../algorithms/weighted-round-robin');
const loadFileMemory = require('../../helpers/handleFileMemory');

const port = 9000;
const app = express();
const servers = new WRR();

for(let i = 0; i <= 2; i++) {
    servers.add({
        uri: `http://localhost:800${i+1}/`,
        weight: i+1
    });
}

let server,
  redisClient,
  cacheKey,
  isCached,
  lastService;

let { total, success } = loadFileMemory() ?? 0;

(async () => {
  redisClient = new redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  total += 1;
  fibonacciKey = [];
  lastService = await redisClient.get('lastService') ?? 0;

  writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  cacheKey = `http://localhost:${port}/balance?` + fibonacciKey.join('&');
  const cache = await redisClient.get(cacheKey);

  if(!cache){
    server = servers.get().uri;
    cacheKey = `http://localhost:${port}/balance?` + fibonacciKey.join('&');

    await redisClient.set('lastService', server);

    try {
      const response = await axios(server, { method: 'GET', params: { fibonacci } });
      if(response.status === 200) {
        success += 1;
        writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
      }

      const { result, timeSpent } = response?.data ?? {};
      await redisClient.set(cacheKey, JSON.stringify(result));

      console.log(`${cache ? true : false},${cacheKey},${timestamp},${fibonacci},${timeSpent}`)

      return res.json({
        value: result,
        time: timeSpent,
        service: server
      });
    } catch (error) {
      console.log(`[FAILED] proxy to ${server} failed: ${error}`);
      throw new Error(`proxy to ${server} failed: ${error}`);
    }
  }

  console.log(`${cache ? true : false},${cacheKey},${timestamp},${fibonacci},0`);
  const result = JSON.parse(cache);
  writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));

  return res.json({
    value: result,
    time: 0,
    service: lastService
  });
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

app.listen(port, () => {});

module.exports = app;
