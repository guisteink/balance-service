const server = require('../../src/servers/weighted-round-robin-server');
const request = require('supertest');

describe('Weighted round robin express server', () => {
  it('[health-check] should return 200 and "OK"', async () => {
    const expectedResponseBody = {
      "result": "OK"
    }
    const response = await request(server).get('/health-check');
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expectedResponseBody);
  });
});
