import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationController } from './notification/notification.controller';


@Module({
  imports: [HttpModule, UserModule, NotificationModule],
  controllers: [AppController, UserController, NotificationController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
