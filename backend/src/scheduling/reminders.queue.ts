import { Queue } from 'bullmq';
import { createBullMqConnection } from './bullmq-connection';

export const REMINDERS_QUEUE_NAME = 'class-reminders';

export const remindersQueue = new Queue(REMINDERS_QUEUE_NAME, {
  connection: createBullMqConnection(),
});