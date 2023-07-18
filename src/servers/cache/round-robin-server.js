const express = require('express');
const axios = require('axios');
require('dotenv').config();
const redis = require('redis');

const roundRobin = require('../../algorithms/round-robin');

const app = express();
const port = 8000;
const cloud_server = process.env.CLOUD;
const fog_server = process.env.FOG;
const edge_server = process.env.EDGE;

const servers = [
  `${edge_server}:8001/`,
  `${fog_server}:3000/`,
  `${cloud_server}:3000/`,
];

let current = 0,
  server,
  redisClient,
  cacheKey,
  fibonacciKey = [],
  lastService = 0;

(async () => {
  redisClient = new redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

// * LOAD BALANCING HANDLER *
const handler = async (req, res) => {
  let timestamp = new Date().getTime();
  fibonacciKey = [];
  lastService = await redisClient.get('lastService') ?? 0;

  const { fibonacci } = req.query ?? 0;
  if(fibonacci) fibonacciKey.push(`fibonacci=${fibonacci}`);
  else fibonacciKey.push(`fibonacci=0`);

  cacheKey = `http://localhost:${port}/balance?` + fibonacciKey.join('&');
  const cache = await redisClient.get(cacheKey);

  if(!cache){
    current = roundRobin(servers.length, current);
    server = servers[current];
    cacheKey = `http://localhost:${port}/balance?` + fibonacciKey.join('&');

    await redisClient.set('lastService', current);
    try {
      const response = await axios(server, { method: 'GET', params: { fibonacci } });

      const { result, time } = response?.data ?? {};
      await redisClient.set(cacheKey, JSON.stringify(result));

      console.log(`${server},${timestamp},${time},${fibonacci}`)

      return res.json({
        value: result,
        time,
        service: current
      });
    }
    catch (error) {
      console.log(`[FAIL] proxy to ${server} failed: ${error}`);
      throw new Error(`proxy to ${server} failed: ${error}`);
    }
  }

  console.log(`${server},${timestamp},${0},${fibonacci}`)

  const result = JSON.parse(cache);

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

app.listen(port)

module.exports = app;
