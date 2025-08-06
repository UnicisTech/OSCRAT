// Server-only exports - DO NOT import this on the client side
export { PrismaClient } from '@prisma/client';

// Re-export runtime library for error handling
export {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
