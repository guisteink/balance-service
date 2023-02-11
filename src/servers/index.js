const express = require('express');
const axios = require('axios');
const { writeFileSync } = require('fs');
const redis = require('redis');

const roundRobin = require('../algorithms/round-robin');
const loadFileMemory = require('../helpers/handleFileMemory');

const app = express();
const port = 8000;
const servers = [
  "http://localhost:8001/", // edge server -> weight 1
  // "http://15.228.239.16:8000/", // edge server on aws -> weight 1 :

  "http://localhost:8002/", // fog server -> weight 2

  "http://localhost:8003/", // cloud server -> weight 3
  // "http://35.178.232.188:8000/", // cloud server on aws -> weight 3
];

let current = 0,
  server,
  redisClient,
  cacheKey,
  fibonacciKey = [],
  isCached = false,
  lastService = 0;

(async () => {
  redisClient = new redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

let { total, success } = loadFileMemory() ?? {};

// * LOAD BALANCING ALGORITHM *
const handler = async (req, res) => {
  total += 1;
  fibonacciKey = [];
  lastService = await redisClient.get('lastService') ?? 0;

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push('fibonacci=0');

  cacheKey = `http://localhost:800${lastService}/balance?` + fibonacciKey.join('&');
  const cache = await redisClient.get(cacheKey);

  if(cache) {
    isCached = true;

    console.log(`Founded this fibonacci in cache: ${cacheKey}\ntimeSpent: 0 seconds\n`);

    const result = JSON.parse(cache);

    res.json({
      isCached,
      timeSpent: `${0} seconds`,
      result: `The result for the ${fibonacci}th fibonacci number is: ${result}`,
      value: result,
      time: 0,
      service: parseInt(lastService)
    });
  }
  else {
    current = roundRobin(servers.length, current);
    server = servers[current];
    cacheKey = `http://localhost:800${current}/balance?` + fibonacciKey.join('&');

    await redisClient.set('lastService', current);
    try {
      const response = await axios(server, { method: 'GET', params: { fibonacci } });
      if(response.status === 200) {
        success += 1;
        writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
      }

      const { result, timeSpent } = response?.data ?? {};

      await redisClient.set(cacheKey, JSON.stringify(result));
      console.log(`Not founded in cache, computational processing required: ${cacheKey}\ntimeSpent: ${timeSpent} seconds\n`);

      res.json({
        isCached,
        timeSpent: `${timeSpent} seconds`,
        result: `The result for the ${fibonacci}th fibonacci number is: ${result}`,
        value: result,
        time: timeSpent,
        service: parseInt(current)
      });

    } catch (error) {
      console.log(`proxy to ${server} failed: ${error}`);
      throw new Error(`proxy to ${server} failed: ${error}`);
    }
  }
  writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
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
    console.log(`\nStarting round-robin server on port ${port} 🔥🔥🔥\n`);
})

module.exports = app;
