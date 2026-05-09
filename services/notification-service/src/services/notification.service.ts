import { prisma } from '../config/prisma';
import { buildRecommendationEmail, sendEmail } from './email.service';
import type { RecommendationGeneratedEvent } from '../models/notification.model';

export async function processRecommendation(event: RecommendationGeneratedEvent): Promise<void> {
  const hasEmail  = typeof event.userEmail === 'string' && event.userEmail.includes('@');
  const isRealUser = event.userId !== 'anonymous';

  if (hasEmail) {
    const emailPayload = buildRecommendationEmail(event);
    await sendEmail(emailPayload);
  } else {
    console.log(`[notification-service] no valid email for userId=${event.userId} — skipping email send`);
  }

  if (isRealUser) {
    await prisma.notification.create({
      data: {
        userId:  event.userId,
        farmId:  event.farmId,
        message: event.recommendation,
        channel: 'email',
      },
    });
    console.log(`[notification-service] notification saved for userId=${event.userId} farmId=${event.farmId}`);
  }
}
