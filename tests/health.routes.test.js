import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import { afterEach, describe, it } from 'node:test';
import { createHealthRouter } from '../dist/routes/health.routes.js';

const servers = new Set();

afterEach(async () => {
  await Promise.all([...servers].map((server) => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  })));
  servers.clear();
});

async function requestHealth(connection) {
  const app = express();
  app.use('/health', createHealthRouter(connection));
  const server = app.listen(0, '127.0.0.1');
  servers.add(server);
  await once(server, 'listening');
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/health`);

  return {
    status: response.status,
    body: await response.json(),
  };
}

describe('GET /health', () => {
  it('returns healthy only after MongoDB ping succeeds', async () => {
    let pingCount = 0;
    const result = await requestHealth({
      readyState: 1,
      db: {
        admin: () => ({
          ping: async () => {
            pingCount += 1;
            return { ok: 1 };
          },
        }),
      },
    });

    assert.equal(result.status, 200);
    assert.deepEqual(result.body, {
      status: 'ok',
      database: 'connected',
    });
    assert.equal(pingCount, 1);
  });

  it('returns 503 without pinging when the MongoDB connection is not ready', async () => {
    let pingCount = 0;
    const result = await requestHealth({
      readyState: 0,
      db: {
        admin: () => ({
          ping: async () => {
            pingCount += 1;
            return { ok: 1 };
          },
        }),
      },
    });

    assert.equal(result.status, 503);
    assert.deepEqual(result.body, {
      status: 'unavailable',
      database: 'unavailable',
    });
    assert.equal(pingCount, 0);
  });

  it('returns a sanitized 503 when the MongoDB ping fails', async () => {
    const result = await requestHealth({
      readyState: 1,
      db: {
        admin: () => ({
          ping: async () => {
            throw new Error('private MongoDB connection details');
          },
        }),
      },
    });

    assert.equal(result.status, 503);
    assert.deepEqual(result.body, {
      status: 'unavailable',
      database: 'unavailable',
    });
  });
});
