"use server";

import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export async function triggerWebsiteCheck(websiteId: string) {
  await inngest.send({
    name: "website/check.requested",
    data: {
      websiteId,
    },
  });

  revalidatePath("/");
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

  revalidatePath("/");
  return { success: true };
}
