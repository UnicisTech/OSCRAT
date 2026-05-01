import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@oscrat/model/server';

export const isPrismaError = (error: any): boolean => {
  return (
    error instanceof PrismaClientKnownRequestError ||
    error instanceof PrismaClientUnknownRequestError ||
    error instanceof PrismaClientRustPanicError ||
    error instanceof PrismaClientInitializationError ||
    error instanceof PrismaClientValidationError
  );
};

export class ApiError extends Error {
  status: number;
  code?: string;
  values?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    options?: { code?: string; values?: Record<string, string> }
  ) {
    super(message);
    this.status = status;
    this.code = options?.code;
    this.values = options?.values;
  }
}
