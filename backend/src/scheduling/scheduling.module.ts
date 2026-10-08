import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { RemindersProcessor } from './reminders.processor';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [SchedulingController],
  providers: [SchedulingService, RemindersProcessor],
})
export class SchedulingModule {}