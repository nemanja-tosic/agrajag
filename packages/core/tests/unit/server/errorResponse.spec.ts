import { expect } from 'chai';
import { createErrorResponse } from '../../../src/server/errorResponse.js';
import {
  BadRequestError,
  ForbiddenError,
  HttpError,
  NotFoundError,
  UnauthorizedError,
} from '../../../src/server/HttpError.js';
import type { ErrorObject } from '../../../src/resources/Error.js';

describe('createErrorResponse', () => {
  const errorsOf = (body: unknown) => (body as ErrorObject).errors;

  it('maps a ForbiddenError to a 403 JSON:API error', () => {
    const response = createErrorResponse(new ForbiddenError('not your match'));

    expect(response.status).to.equal(403);
    expect(errorsOf(response.body)).to.deep.equal([
      { status: '403', title: 'Forbidden', detail: 'not your match' },
    ]);
  });

  it('maps each typed error to its status', () => {
    expect(createErrorResponse(new BadRequestError()).status).to.equal(400);
    expect(createErrorResponse(new UnauthorizedError()).status).to.equal(401);
    expect(createErrorResponse(new NotFoundError()).status).to.equal(404);
  });

  it('defaults the detail to the title when no message is given', () => {
    const response = createErrorResponse(new UnauthorizedError());

    expect(errorsOf(response.body)[0].detail).to.equal('Unauthorized');
  });

  it('maps a direct HttpError with a custom title', () => {
    const response = createErrorResponse(
      new HttpError(404, 'No Such Thing', 'gone'),
    );

    expect(response.status).to.equal(404);
    expect(errorsOf(response.body)[0].title).to.equal('No Such Thing');
  });

  it('hides untyped errors behind a generic 500', () => {
    const response = createErrorResponse(new Error('secret internals'));

    expect(response.status).to.equal(500);
    expect(errorsOf(response.body)).to.deep.equal([
      {
        status: '500',
        detail: 'An unexpected error occurred',
        title: 'Internal Server Error',
      },
    ]);
  });
});

// The generic 500 deliberately hides the cause from the client — so the
// server console must be the place where the cause survives. A deployment
// with nothing but pod logs has no other way to diagnose an unexpected throw.
describe('createErrorResponse logging', () => {
  const captured: unknown[][] = [];
  const original = console.error;

  beforeEach(() => {
    captured.length = 0;
    console.error = (...args: unknown[]) => void captured.push(args);
  });

  afterEach(() => {
    console.error = original;
  });

  it('logs the unexpected error it hides behind the generic 500', () => {
    const cause = new Error('projection column missing');
    const response = createErrorResponse(cause);

    expect(response.status).to.equal(500);
    expect(captured).to.have.length(1);
    expect(captured[0]).to.include(cause);
  });

  it('does not log a typed HttpError — refusals are expected control flow', () => {
    const response = createErrorResponse(new ForbiddenError('not yours'));

    expect(response.status).to.equal(403);
    expect(captured).to.have.length(0);
  });
});
