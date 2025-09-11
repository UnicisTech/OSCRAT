import { PrismaClient } from '@oscrat/model/server';

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    //log: ["error"],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
