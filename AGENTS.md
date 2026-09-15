<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# AI Agent System Instructions (AGENTS.md)

## 1. Project Context
**Name**: Client Website Management Dashboard
**Description**: Dashboard internal untuk mengelola Client dan Website milik mereka. Sistem memantau status uptime website setiap 30 menit dan masa aktif paket (package), lalu mengirimkan notifikasi Telegram jika terjadi masalah (down/blocked) atau paket akan expired.
**Target User**: Single Admin (Hanya untuk penggunaan internal 1 orang pengelola).

## 2. Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: Strict TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better Auth (`better-auth`)
- **Background Jobs**: Inngest (Scheduled Cron & Event-Driven)
- **Styling**: Tailwind CSS + Shadcn UI
- **UI/UX**: Dark mode only, terinspirasi dari gaya Vercel / Dokploy (Minimalis, border tipis, data-dense).

## 3. Authentication Implementation (Better Auth)
Sistem ini menggunakan **Better Auth** untuk autentikasi. Karena ini adalah sistem **Single Admin**, AI harus memperhatikan hal berikut:
1. **Schema Update**: Sesuaikan `schema.prisma` untuk menyertakan model bawaan yang diwajibkan oleh Better Auth (`User`, `Session`, `Account`, `Verification`).
2. **Admin Role**: Model `User` dari Better Auth akan bertindak sebagai `Admin` pada sistem ini.
3. **Registration Flow**: Karena ini single-admin, berikan instruksi atau script untuk melakukan *seeding* admin pertama, dan nonaktifkan/blokir endpoint pendaftaran (sign-up) terbuka setelah admin pertama dibuat.
4. **Integration**: Setup Better Auth di `lib/auth.ts` dan buat route handler di `app/api/auth/[...all]/route.ts`. 

## 4. Coding & Architecture Guidelines
- **App Router First**: Gunakan struktur App Router Next.js 16 (`app/page.tsx`, `app/layout.tsx`).
- **Server Components**: Gunakan React Server Components (RSC) secara default untuk performa maksimal. Hanya gunakan `'use client'` untuk komponen yang membutuhkan interaktivitas (seperti drawer, form, chart, atau toast).
- **Server Actions**: Gunakan Server Actions untuk semua mutasi data (Create, Update, Delete) alih-alih membuat rute API terpisah, kecuali untuk integrasi eksternal atau webhook.
- **Inngest Integration**: Semua logic pengecekan website dan pengiriman notifikasi harus diletakkan di dalam folder `inngest/` (misalnya `inngest/functions.ts` dan `inngest/client.ts`).
- **UI Components**: Gunakan komponen dari Shadcn UI. Terapkan prinsip desain "Dark mode default" dengan token warna seperti `--bg-base` (`#0a0a0a`) dan border tipis.
- **Drawer/Sheet untuk Form**: Semua aksi berat seperti menambah Client, menambah Website, atau Edit harus menggunakan komponen *Sheet* atau *Drawer* (panel slide dari kanan), bukan berpindah halaman.

## 5. File References
Saat membuat fitur, jadikan file-file berikut sebagai acuan utama (sumber kebenaran):
- `PRD.md`: Untuk business logic, aturan notifikasi, dan daftar entitas.
- `schema.prisma`: Untuk relasi database. Pastikan tidak mengubah struktur relasi utama tanpa persetujuan.
- `UI-UX-PLAN.md`: Untuk estetika, warna, token desain, dan tata letak.

## 6. Tone & Behavior untuk AI
- Berikan kode yang ringkas, modern, dan siap produksi.
- Jangan berikan penjelasan yang bertele-tele; fokus pada implementasi dan struktur file.
- Selalu tangani state *loading* dan *error* pada UI (contoh: gunakan skeleton loading untuk tabel).
