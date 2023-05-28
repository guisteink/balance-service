const leastResponseTime = require('./leastresponsetime');

const urls = [
  new URL('http://server1.com'),
  new URL('http://server2.com'),
  new URL('http://server3.com')
];

// todo: aplicar camada de express e handle aqui
const balancer = leastResponseTime.New(urls);
await leastResponseTime.updateResponseTime(lastUrl, responseTime);

const nextURL = balancer.next();
