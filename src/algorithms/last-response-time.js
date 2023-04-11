function lastResponseTime(servers) {
  let minResponseTime = Infinity;
  let selectedServer = null;

  for (let i = 0; i < servers.length; i++) {
    if (servers[i].responseTime < minResponseTime) {
      minResponseTime = servers[i].responseTime;
      selectedServer = servers[i];
    }
  }

  return selectedServer;
}

module.exoprts = lastResponseTime;
