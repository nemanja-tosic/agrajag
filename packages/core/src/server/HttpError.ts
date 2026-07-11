export class HttpError extends Error {
  readonly status: 400 | 401 | 403 | 404;
  readonly title: string;

  constructor(status: 400 | 401 | 403 | 404, title: string, message?: string) {
    super(message ?? title);
    this.status = status;
    this.title = title;
  }
}

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(400, 'Bad Request', message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(401, 'Unauthorized', message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(403, 'Forbidden', message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(404, 'Not Found', message);
  }
}
