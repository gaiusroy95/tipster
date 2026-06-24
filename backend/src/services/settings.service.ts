import { prisma } from '../lib/prisma';

export const settingsService = {
  async getOrCreate(userId: string) {
    const existing = await prisma.userSettings.findUnique({ where: { userId } });
    if (existing) return existing;

    return prisma.userSettings.create({
      data: { userId },
    });
  },

  async update(
    userId: string,
    data: Partial<{
      emailNotifications: boolean;
      pushNotifications: boolean;
      showProfilePublic: boolean;
    }>,
  ) {
    await this.getOrCreate(userId);
    return prisma.userSettings.update({
      where: { userId },
      data,
    });
  },
};
