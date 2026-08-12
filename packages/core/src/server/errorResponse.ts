import { Response } from './ServerBuilder.js';
import { HttpError } from './HttpError.js';

export interface ErrorResponseOptions {
  /**
   * Whether the generic 500 names the underlying error (name, message, and
   * the head of the stack in `meta.stack`) instead of "An unexpected error
   * occurred". Off by default: the detail describes server internals, which
   * belongs in logs unless a deployment deliberately trades that exposure
   * for client-side debuggability (e.g. a QA environment without log access).
   */
  exposeErrorDetail?: boolean;
}

export const createErrorResponse = (
  error: Error,
  options: ErrorResponseOptions = {},
): Response => {
  if (error instanceof HttpError) {
    return {
      body: {
        errors: [
          {
            status: String(error.status),
            title: error.title,
            detail: error.message,
          },
        ],
      },
      status: error.status,
    };
  }

  return {
    body: {
      errors: [
        {
          status: '500',
          detail: options.exposeErrorDetail
            ? `${error.name}: ${error.message}`
            : 'An unexpected error occurred',
          title: 'Internal Server Error',
          ...(options.exposeErrorDetail && error.stack
            ? { meta: { stack: error.stack.split('\n').slice(0, 6) } }
            : {}),
        },
      ],
    },
    status: 500,
  };
};
