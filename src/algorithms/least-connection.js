class Conn {
  constructor(url) {
    this.url = url;
    this.cnt = 0;
  }
}

class LeastConnections {
  constructor(urls) {
    if (urls.length === 0) {
      throw new Error("servers do not exist");
    }

    this.conns = urls.map((url) => new Conn(url));
    this.mu = new Mutex();
  }

  next() {
    let min = -1;
    let idx = 0;

    this.mu.lock();

    for (let i = 0; i < this.conns.length; i++) {
      const conn = this.conns[i];
      if (min === -1 || conn.cnt < min) {
        min = conn.cnt;
        idx = i;
      }
    }
    this.conns[idx].cnt++;

    this.mu.unlock();

    let done = false;
    return [
      this.conns[idx].url,
      () => {
        this.mu.lock();
        if (!done) {
          this.conns[idx].cnt--;
          done = true;
        }
        this.mu.unlock();
      },
    ];
  }
}

class Mutex {
  constructor() {
    this.isLocked = false;
    this.queue = [];
  }

  lock() {
    return new Promise((resolve) => {
      if (!this.isLocked) {
        this.isLocked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.isLocked = false;
    }
  }
}

function New(urls) {
  return new LeastConnections(urls);
}

module.exports = { New };
