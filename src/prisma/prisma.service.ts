import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to MySQL successfully.');
    } catch (error) {
      this.logger.warn(
        `Prisma failed to connect to database on startup: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from MySQL.');
  }
}
