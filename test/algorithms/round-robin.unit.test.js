const roundRobin = require('../../src/algorithms/round-robin');

describe('round-robin', () => {
  let servers = [
    "http://{{uri}}:8001/",
    "http://{{uri}}:8002/",
    "http://{{uri}}:8003/",
    "http://{{uri}}:8004/",
    "http://{{uri}}:8005/",
  ];

  it('should return the next server to distribute', () => {
    let current = 0;
    current = roundRobin(servers.length, current);
    expect(current).toEqual(1);

    current = roundRobin(servers.length, current);
    expect(current).toEqual(2);

    current = 0;

    current = roundRobin(servers.length, current);
    expect(current).toEqual(1);

    current = 3;

    current = roundRobin(servers.length, current);
    expect(current).toEqual(4);
  });

});
