function leastConnectionAlgorithm(servers) {
  let server = servers[0];
  for (let i = 1; i < servers.length; i++) {
    if (servers[i].connections < server.connections) {
      server = servers[i];
    }
  }
  server.connections++;
  return server;
}

module.exports = leastConnectionAlgorithm;
