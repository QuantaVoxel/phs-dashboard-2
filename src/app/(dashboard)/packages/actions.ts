"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertPackage(data: {
  id?: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
}) {
  if (data.id) {
    await prisma.package.update({
      where: { id: data.id },
      data: {
        name: data.name,
        price: data.price,
        durationDays: data.durationDays,
        description: data.description || null,
      },
    });
  } else {
    await prisma.package.create({
      data: {
        name: data.name,
        price: data.price,
        durationDays: data.durationDays,
        description: data.description || null,
      },
    });
  }

  revalidatePath("/packages");
}

export async function deletePackage(id: string) {
  // Soft delete or hard delete depending on PRD
  // PRD says: "Package yang masih dipakai website aktif tidak bisa dihapus, hanya bisa dinonaktifkan"
  
  const inUse = await prisma.website.count({
    where: { packageId: id }
  });

  if (inUse > 0) {
    await prisma.package.update({
      where: { id },
      data: { isActive: false }
    });
  } else {
    await prisma.package.delete({
      where: { id },
    });
  }

  revalidatePath("/packages");
}
