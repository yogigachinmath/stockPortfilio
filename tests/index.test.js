/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../index');
const conn = require('../database/connection');

jest.setTimeout(30000);
describe('Test the root path', () => {
  test('It should response the GET method', (done) => {
    request(app)
      .get('/')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

describe('Quote Api functionality', () => {
  test('Quote Endpoint should throw error', async (done) => {
    try {
      const response = await request(app).get('/quote/pp');
      done();
    } catch (e) {
      expect(e).toBe(404);
    }
  });
  test('Quote Endpoint should not throw error', async (done) => {
    try {
      const response = await request(app).get('/quote/aapl');
      done();
    } catch (e) {
      expect(e).toBe(200);
    }
  });
});

describe('portfolio Api functionality', () => {
  test('portfolio Endpoint should not throw error', async (done) => {
    try {
      const response = await request(app).get('/portfolio');
      done();
    } catch (e) {
      expect(e).toBe(200);
    }
  });
});

describe('history Api functionality', () => {
  test('history Endpoint should not throw error', async (done) => {
    try {
      const response = await request(app).get('/history');
      done();
    } catch (e) {
      expect(e).toBe(200);
    }
  });
});

describe('transaction Api functionality', () => {
  test('transaction Endpoint should throw error when wrong type is passed in the body', async (done) => {
    try {
      const response = await request(app).get('/transaction').send({
        type: 'pp',
        quantity: 1,
        ticker: 'goog',
      });
      done();
    } catch (e) {
      expect(e).toBe(400);
    }
  });
  test('transaction Endpoint should throw error when wrong decimal value is passed for quantity in the body', async (done) => {
    try {
      const response = await request(app).get('/transaction').send({
        type: 'sell',
        quantity: 1.2,
        ticker: 'goog',
      });
      done();
    } catch (e) {
      expect(e).toBe(400);
    }
  });

  test('transaction Endpoint should throw error when ticker key is missing in the body', async (done) => {
    try {
      const response = await request(app).get('/transaction').send({
        type: 'sell',
        quantity: 1.2,
      });
      done();
    } catch (e) {
      expect(e).toBe(400);
    }
  });
});

describe('transfer Api functionality', () => {
  test('transfer Endpoint should throw error when amount is not an integer', async (done) => {
    try {
      const response = await request(app).get('/transfer').send({
        type: 'add',
        amount: 1.55,
      });
      done();
    } catch (e) {
      expect(e).toBe(400);
    }
  });
  test('transfer Endpoint should throw error when type is add or remove', async (done) => {
    try {
      const response = await request(app).get('/transfer').send({
        type: 'buy',
        amount: 1,
      });
      done();
    } catch (e) {
      expect(e).toBe(400);
    }
  });
  test('transfer Endpoint should throw error when type or amount field is missing', async (done) => {
    try {
      const response = await request(app).get('/transfer').send({
        type: 'sell',
      });
      done();
    } catch (e) {
      expect(e).toBe(400);
    }
  });
});
