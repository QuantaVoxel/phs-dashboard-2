"use server";

import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";
import { pingWebsiteCore } from "@/lib/ping";

export async function triggerWebsiteCheck(websiteId: string) {
  const result = await pingWebsiteCore(websiteId);
  
  if (result.changed) {
    let notifyType = "";
    if (result.newStatus === "ONLINE") notifyType = "WEBSITE_RECOVERED";
    else if (result.newStatus === "BLOCKED") notifyType = "WEBSITE_BLOCKED";
    else notifyType = "WEBSITE_DOWN";
    
    await inngest.send({
      name: "notification/send",
      data: { websiteId, type: notifyType }
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function triggerGlobalCheck() {
  const { prisma } = await import("@/lib/prisma");
  
  const websites = await prisma.website.findMany({ 
    where: { isActive: true },
    select: { id: true }
  });

  if (websites.length > 0) {
    const events = websites.map((w) => ({
      name: "website/check.requested" as const,
      data: { websiteId: w.id },
    }));
    await inngest.send(events);
  }

  return { success: true };
}

export async function getRecentLogs(page: number, take: number = 10) {
  const { prisma } = await import("@/lib/prisma");
  return await prisma.notificationLog.findMany({
    orderBy: { createdAt: 'desc' },
    skip: page * take,
    take
  });
}
