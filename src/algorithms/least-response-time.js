class Server {
  constructor(url) {
    this.url = url;
    this.responseTime = Infinity;
  }
}

class LeastResponseTime {
  constructor(urls) {
    if (urls.length === 0) {
      throw new Error("servers do not exist");
    }

    this.servers = urls.map((url) => new Server(url));
  }

  updateResponseTime(url, responseTime) {
    const server = this.servers.find((server) => server.url === url);
    if (server) {
      server.responseTime = responseTime;
    }
  }

  next() {
    let min = Infinity;
    let nextURL = null;

    for (let i = 0; i < this.servers.length; i++) {
      const server = this.servers[i];
      if (server.responseTime < min) {
        min = server.responseTime;
        nextURL = server.url;
      }
    }

    return nextURL;
  }
}

function New(urls) {
  return new LeastResponseTime(urls);
}

module.exports = { New };
