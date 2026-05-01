import { Prisma } from '@prisma/client';

export const toJsonInput = <T>(
  value: T | null | undefined
): Prisma.InputJsonValue | typeof Prisma.JsonNull =>
  value == null ? Prisma.JsonNull : (value as unknown as Prisma.InputJsonValue);

export const fromJson = <T>(
  value: Prisma.JsonValue | null | undefined
): T | null => (value == null ? null : (value as unknown as T));

export const fromJsonObject = <T extends object>(
  value: Prisma.JsonValue | null | undefined
): T => (value == null ? ({} as T) : (value as unknown as T));
