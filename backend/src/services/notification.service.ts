import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';
import { toNotificationDto } from '../mappers/app.mapper';

export const notificationService = {
  async listForUser(userId: string) {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toNotificationDto);
  },

  async markRead(userId: string, notificationId: string) {
    const notif = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notif) return null;

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return toNotificationDto(updated);
  },

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    data?: Record<string, unknown>;
  }) {
    const row = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        data: data.data ? (data.data as Prisma.InputJsonValue) : undefined,
      },
    });
    return toNotificationDto(row);
  },
};
