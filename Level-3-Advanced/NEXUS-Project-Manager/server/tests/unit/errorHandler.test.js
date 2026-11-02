const errorHandler = require('../../middleware/errorHandler');

describe('Unit: Centralized Error Handler Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { method: 'POST', originalUrl: '/api/test' };
    res = {
      statusCode: 200,
      jsonData: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.jsonData = data;
        return this;
      }
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('converts body-parser 413 payload error to HTTP 413 with clear message', () => {
    const err = new Error('request entity too large');
    err.status = 413;
    err.type = 'entity.too.large';

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(413);
    expect(res.jsonData).toEqual({
      success: false,
      message: 'Request payload exceeds the maximum allowed size of 100KB'
    });
  });

  test('converts Mongoose CastError on _id to HTTP 400', () => {
    const err = new Error('Cast error');
    err.name = 'CastError';
    err.path = '_id';
    err.value = 'invalid-mongo-id-123';

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.message).toContain('Invalid identifier format: invalid-mongo-id-123');
  });

  test('converts Mongoose ValidationError to HTTP 400', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {
      name: { message: 'Project name is required' },
      priority: { message: 'Priority is invalid' }
    };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.message).toContain('Validation Failed: Project name is required, Priority is invalid');
  });

  test('converts MongoDB duplicate key error code 11000 to HTTP 409', () => {
    const err = new Error('Duplicate key');
    err.code = 11000;
    err.keyValue = { name: 'Duplicate Project' };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.message).toContain("Duplicate field value entered for 'name'");
  });

  test('falls back to HTTP 500 for unhandled operational errors', () => {
    const err = new Error('Unexpected database failure');

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.jsonData).toEqual({
      success: false,
      message: 'Unexpected database failure'
    });
  });
});

