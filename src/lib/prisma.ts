import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// If on Vercel and using SQLite, copy dev.db to /tmp so it's readable & writable
if (process.env.VERCEL) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.resolve('./prisma/dev.db'),
      ];

      for (const p of candidates) {
        if (fs.existsSync(p)) {
          try {
            fs.copyFileSync(p, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy SQLite db to /tmp:', e);
          }
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
