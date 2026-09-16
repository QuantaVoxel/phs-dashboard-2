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

export async function testTelegramPing(botToken: string, chatId: string) {
  if (!botToken || !chatId) {
    throw new Error("Both Bot Token and Chat ID are required for testing.");
  }
  
  const { sendTelegramMessage } = await import("@/lib/telegram");

  await sendTelegramMessage({
    botToken,
    chatId,
    message: "🔔 <b>PING TEST SUCCESSFUL</b>\n\nYour dashboard telemetry configuration is correctly wired and capable of dispatching notifications.\n\n<i>Timestamp: " + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + " WIB</i>",
  });

  return { success: true };
}
