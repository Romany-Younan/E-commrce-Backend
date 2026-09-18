import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiErrorBody | string | null;
    if (typeof body === 'string' && body) return body;
    if (body && typeof body === 'object' && body.message) return body.message;
    if (error.message) return error.message;
  }
  return fallback;
}
