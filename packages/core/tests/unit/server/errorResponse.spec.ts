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
