const leastConnections = require('../algorithms/least-connection');

const urls = [
  new URL('http://server1.com'),
  new URL('http://server2.com'),
  new URL('http://server3.com')
];
// todo: aplicar camada de express e handle aqui
const balancer = leastConnections.New(urls);
const [nextURL, done] = balancer.next();
