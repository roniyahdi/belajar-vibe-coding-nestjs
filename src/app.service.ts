import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    let dbStatus = 'disconnected';
    let dbError: string | null = null;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
    }

    return {
      status: 'ok',
      service: 'belajar-vibe-coding-nestjs',
      timestamp: new Date().toISOString(),
      database: {
        provider: 'mysql',
        status: dbStatus,
        ...(dbError && { error: dbError }),
      },
    };
  }
}
