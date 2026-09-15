"use server";

import { prisma } from "@/lib/prisma";

export async function getWebsiteFormOptions() {
  const clients = await prisma.client.findMany({ 
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });
  const packages = await prisma.package.findMany({ 
    select: { id: true, name: true, durationDays: true }, 
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });
  return { clients, packages };
}
