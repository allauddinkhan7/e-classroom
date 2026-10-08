import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { createBullMqConnection } from './bullmq-connection';
import { REMINDERS_QUEUE_NAME } from './reminders.queue';

@Injectable()
export class RemindersProcessor implements OnModuleInit {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
   const worker = new Worker(
      REMINDERS_QUEUE_NAME,
      async (job) => {
        this.logger.log(`Processing job ${job.id} for session ${job.data.scheduledSessionId}`);

        const { scheduledSessionId } = job.data;

        const session = await this.prisma.scheduledSession.findUnique({
          where: { id: scheduledSessionId },
          include: {
            classroom: {
              include: { enrollments: { include: { user: true } } },
            },
          },
        });

        // The teacher may have deleted/cancelled this session after scheduling
        // it but before the job fired — nothing to send in that case.
        if (!session || session.reminderSent) {
          return;
        }

        const students = session.classroom.enrollments
          .map((e) => e.user)
          .filter((u) => u.id !== session.createdBy);

        await Promise.all(
          students.map((student) =>
            this.emailService.sendMail(
              student.email,
              `Your class "${session.classroom.name}" starts in 5 minutes`,
              `<p>Hi ${student.fullName},</p><p>Your class <strong>${session.classroom.name}</strong> is starting in 5 minutes. See you there!</p>`,
            ),
          ),
        );

        await this.prisma.scheduledSession.update({
          where: { id: scheduledSessionId },
          data: { reminderSent: true },
        });

        this.logger.log(`Sent reminder for session ${scheduledSessionId} to ${students.length} students`);
      },
      { connection: createBullMqConnection() },
    );


    worker.on("completed", (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
      this.logger.error(`Job ${job?.id} FAILED: ${err.message}`, err.stack);
    });

    worker.on("error", (err) => {
      this.logger.error(`Worker connection error: ${err.message}`, err.stack);
    });

    this.logger.log("Reminders worker started, listening for scheduled jobs");
  }
}