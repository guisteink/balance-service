class ConsistentHashing {
  constructor(servers) {
    this.servers = servers;
    this.hashRing = {};
    for (let i = 0; i < this.servers.length; i++) {
      let server = this.servers[i];
      for (let j = 0; j < 3; j++) { // replicate server to 3 virtual nodes
        let hash = this._hash(server.host + ':' + server.port + ':' + j);
        this.hashRing[hash] = server;
      }
    }
    this.sortedHashes = Object.keys(this.hashRing).sort();
  }

  getServer(request) {
    let hash = parseInt(this._hash(request.originalUrl));
    let index = this._findServerIndex(hash);
    return this.hashRing[this.sortedHashes[index]];
  }

  _findServerIndex(hash) {
    let low = 0;
    let high = this.sortedHashes.length - 1;

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      if (hash <= this.sortedHashes[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    if (low >= this.sortedHashes.length) {
      return 0;
    } else {
      return low;
    }
  }

  _hash(key) {
    if (typeof key !== 'string' || !key) return null;
    key = Buffer.from(key, 'utf-8');
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(key);
    return hash.digest('hex');
  }
}

module.exports = ConsistentHashing;
