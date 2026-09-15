"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertWebsite(data: {
  id?: string;
  name: string;
  url: string;
  clientId: string;
  packageId: string;
  deploymentPlatform: string;
  deploymentInfo?: string;
  notes?: string;
  isActive: boolean;
}) {
  const cleanUrl = data.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (data.id) {
    const existing = await prisma.website.findUnique({ where: { id: data.id } });
    
    const updated = await prisma.website.update({
      where: { id: data.id },
      data: {
        name: data.name,
        url: cleanUrl,
        clientId: data.clientId,
        packageId: data.packageId,
        deploymentPlatform: data.deploymentPlatform as any,
        deploymentInfo: data.deploymentInfo || null,
        notes: data.notes || null,
        isActive: data.isActive,
      },
    });

    // If package changed, record history (simplification: real app might check if packageId changed)
    if (existing && existing.packageId !== data.packageId) {
       const newPkg = await prisma.package.findUnique({ where: { id: data.packageId }});
       if (newPkg) {
         const newExpiresAt = new Date();
         newExpiresAt.setDate(newExpiresAt.getDate() + newPkg.durationDays);

         await prisma.website.update({
           where: { id: data.id },
           data: { expiresAt: newExpiresAt }
         });

         await prisma.websitePackageHistory.create({
           data: {
             websiteId: data.id,
             packageId: data.packageId,
             price: newPkg.price,
             endDate: newExpiresAt
           }
         });
       }
    }

  } else {
    // Create new
    const pkg = await prisma.package.findUnique({ where: { id: data.packageId }});
    if (!pkg) throw new Error("Package not found");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

    const website = await prisma.website.create({
      data: {
        name: data.name,
        url: cleanUrl,
        clientId: data.clientId,
        packageId: data.packageId,
        deploymentPlatform: data.deploymentPlatform as any,
        deploymentInfo: data.deploymentInfo || null,
        notes: data.notes || null,
        isActive: data.isActive,
        expiresAt: expiresAt,
        status: "UNKNOWN"
      },
    });

    // Record initial history
    await prisma.websitePackageHistory.create({
      data: {
        websiteId: website.id,
        packageId: pkg.id,
        price: pkg.price,
        endDate: expiresAt
      }
    });
  }

  revalidatePath("/websites");
}

export async function deleteWebsite(id: string) {
  await prisma.website.delete({
    where: { id },
  });
  revalidatePath("/websites");
}

export async function updateWebsiteUrl(id: string, url: string) {
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  await prisma.website.update({
    where: { id },
    data: { url: cleanUrl }
  });
  revalidatePath("/websites");
}
