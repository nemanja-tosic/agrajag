import { Response } from './ServerBuilder.js';
import { HttpError } from './HttpError.js';

export const createErrorResponse = (error: Error): Response => {
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
          detail: 'An unexpected error occurred',
          title: 'Internal Server Error',
        },
      ],
    },
    status: 500,
  };
};
