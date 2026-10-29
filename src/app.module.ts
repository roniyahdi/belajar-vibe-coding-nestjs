import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersRoute } from './routes/users-route';
import { UserService } from './services/user-service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, UsersRoute],
  providers: [AppService, UserService],
})
export class AppModule {}
