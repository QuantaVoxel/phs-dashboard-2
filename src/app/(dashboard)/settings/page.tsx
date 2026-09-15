import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const settings = await prisma.settings.findFirst();

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">System Configuration</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Core routing & telemetry engine settings
          </p>
        </div>
      </header>

      <SettingsForm initialData={settings} />
    </div>
  );
}
