import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log(`Checking if admin user (${email}) exists...`);
  
  // Using Prisma directly to check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`✅ Admin user (${email}) already exists. Skipping seed.`);
    return;
  }

  console.log(`Seeding admin user: ${email}...`);
  
  try {
    // Seed using Better Auth
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    });

    // We can also initialize the default Settings here if needed
    const existingSettings = await prisma.settings.findFirst();
    if (!existingSettings) {
      console.log("Creating default system settings...");
      await prisma.settings.create({
        data: {
          checkIntervalMinutes: 30,
          packageExpiringThresholdDays: 3,
        }
      });
    }

    console.log("✅ Database seeded successfully!");
    console.log("Admin User ID:", user.user.id);
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
