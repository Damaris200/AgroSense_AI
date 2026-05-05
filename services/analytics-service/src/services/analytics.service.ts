import { prisma } from '../config/prisma';
import type { EventLogRecord } from '../models/analytics.model';

export async function logEvent(
  eventType: string,
  submissionId: string,
  payload: unknown,
): Promise<EventLogRecord> {
  return prisma.eventLog.create({
    data: {
      eventType,
      submissionId,
      payloadJson: payload as object,
    },
  });
}

export async function getEventsBySubmission(submissionId: string): Promise<EventLogRecord[]> {
  return prisma.eventLog.findMany({
    where:   { submissionId },
    orderBy: { loggedAt: 'asc' },
  });
}

export async function getRecentEvents(limit = 100): Promise<EventLogRecord[]> {
  return prisma.eventLog.findMany({
    orderBy: { loggedAt: 'desc' },
    take:    limit,
  });
}
