"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertClient(data: {
  id?: string;
  name: string;
  email?: string;
  whatsappNumber?: string;
  telegramChatId?: string;
  telegramBotToken?: string;
}) {
  if (data.id) {
    await prisma.client.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email || null,
        whatsappNumber: data.whatsappNumber || null,
        telegramChatId: data.telegramChatId || null,
        telegramBotToken: data.telegramBotToken || null,
      },
    });
  } else {
    await prisma.client.create({
      data: {
        name: data.name,
        email: data.email || null,
        whatsappNumber: data.whatsappNumber || null,
        telegramChatId: data.telegramChatId || null,
        telegramBotToken: data.telegramBotToken || null,
      },
    });
  }

  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({
    where: { id },
  });
  revalidatePath("/clients");
}
