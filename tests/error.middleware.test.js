import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Writable } from 'node:stream';
import { transports } from 'winston';
import { errorHandler } from '../dist/middlewares/error.middleware.ts.js';
import { AppError } from '../dist/utils/errors.js';
import { logger } from '../dist/utils/logger.js';

describe('errorHandler', () => {
  let originalTransports;
  let captureTransport;
  let logOutput;

  before(() => {
    originalTransports = [...logger.transports];
    captureTransport = new transports.Stream({
      stream: new Writable({
        write(chunk, _encoding, callback) {
          logOutput += chunk.toString();
          callback();
        },
      }),
    });
    logger.clear();
    logger.add(captureTransport);
  });

  after(() => {
    logger.clear();
    for (const transport of originalTransports) {
      logger.add(transport);
    }
  });

  beforeEach(() => {
    logOutput = '';
  });

  function invokeMiddleware(error) {
    let statusCode;
    let body;
    const request = {
      method: 'GET',
      baseUrl: '/api/auth',
      route: { path: '/verify-email' },
      originalUrl: '/api/auth/verify-email?token=token-that-must-not-be-logged',
    };
    const response = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(value) {
        body = value;
        return this;
      },
    };

    errorHandler(error, request, response, () => {});
    return { statusCode, body };
  }

  it('does not expose internal messages or details in server errors', () => {
    const secret = 'mongodb://user:password@private-host/database';
    const result = invokeMiddleware(new Error(secret));

    assert.equal(result.statusCode, 500);
    assert.equal(result.body.message, 'Ocurrió un error inesperado en el servidor.');
    assert.equal(result.body.details, undefined);
    assert.equal(JSON.stringify(result.body).includes(secret), false);
    assert.equal(logOutput.includes(secret), false);
    assert.equal(logOutput.includes('token-that-must-not-be-logged'), false);
    const logEntry = JSON.parse(logOutput);
    assert.deepEqual({
      ...logEntry,
      timestamp: '<timestamp>',
    }, {
      timestamp: '<timestamp>',
      level: 'error',
      message: 'http.request.failed',
      event: 'http.request.failed',
      method: 'GET',
      route: '/api/auth/verify-email',
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      error: { name: 'Error' },
    });
  });

  it('preserves client-safe validation messages and details', () => {
    const result = invokeMiddleware(new AppError(
      'Los datos no son válidos.',
      400,
      'VALIDATION_ERROR',
      { fieldErrors: { correo: 'El correo no es válido.' } },
    ));

    assert.equal(result.statusCode, 400);
    assert.equal(result.body.message, 'Los datos no son válidos.');
    assert.deepEqual(result.body.details, {
      fieldErrors: { correo: 'El correo no es válido.' },
    });
  });

  it('does not expose details for application errors with server status', () => {
    const result = invokeMiddleware(new AppError(
      'Database failure with internal context',
      503,
      'DATABASE_ERROR',
      { originalError: 'private connection details' },
    ));

    assert.equal(result.statusCode, 503);
    assert.equal(result.body.message, 'Ocurrió un error inesperado en el servidor.');
    assert.equal(result.body.details, undefined);
  });
});
