import axios from 'axios';
import type { ApiErrorResponse } from '@lehrstellen/shared';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    return data.message || 'Ein Fehler ist aufgetreten';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ein unerwarteter Fehler ist aufgetreten';
}
