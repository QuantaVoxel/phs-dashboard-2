"use server";

import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export async function triggerWebsiteCheck(websiteId: string) {
  // Wait for 1 second just to simulate the delay of queuing a task in UI if needed
  // Send the event to Inngest
  await inngest.send({
    name: "website/check.requested",
    data: {
      websiteId,
    },
  });

  // Revalidate the dashboard
  revalidatePath("/");
  
  return { success: true };
}
