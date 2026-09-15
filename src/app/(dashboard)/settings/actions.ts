"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertSettings(data: {
  defaultTelegramBotToken: string;
  adminTelegramBotToken: string;
  adminTelegramChatId: string;
  checkIntervalMinutes: number;
  packageExpiringThresholdDays: number;
}) {
  const existing = await prisma.settings.findFirst();

  if (existing) {
    await prisma.settings.update({
      where: { id: existing.id },
      data: {
        defaultTelegramBotToken: data.defaultTelegramBotToken || null,
        adminTelegramBotToken: data.adminTelegramBotToken || null,
        adminTelegramChatId: data.adminTelegramChatId || null,
        checkIntervalMinutes: data.checkIntervalMinutes,
        packageExpiringThresholdDays: data.packageExpiringThresholdDays,
      }
    });
  } else {
    await prisma.settings.create({
      data: {
        defaultTelegramBotToken: data.defaultTelegramBotToken || null,
        adminTelegramBotToken: data.adminTelegramBotToken || null,
        adminTelegramChatId: data.adminTelegramChatId || null,
        checkIntervalMinutes: data.checkIntervalMinutes,
        packageExpiringThresholdDays: data.packageExpiringThresholdDays,
      }
    });
  }

  revalidatePath("/settings");
}
