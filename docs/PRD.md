# PRD — Client Website Management Dashboard

## 1. Ringkasan
Dashboard internal untuk **1 admin** mengelola banyak **Client**, di mana tiap Client bisa memiliki **banyak Website**. Setiap website berlangganan 1 **Package** (menentukan harga & masa aktif) dan dipantau otomatis tiap 30 menit oleh background job. Notifikasi Telegram dikirim ke Client & Admin **hanya saat status website berubah jadi bermasalah (down/blocked)** atau **package mendekati/sudah expired** — bukan tiap kali check.

**Stack**
- Next.js 16 (App Router)
- Prisma ORM
- PostgreSQL
- Inngest (scheduled + event-driven background job)
- Dark mode UI, gaya Vercel / Dokploy

---

## 2. Aktor
| Aktor | Deskripsi |
|---|---|
| **Admin** | Satu akun admin (single admin, tanpa role berjenjang di v1). Mengelola semua data lewat dashboard. |
| **Client** | Bukan user yang login. Murni data yang dikelola Admin — punya kontak WhatsApp & Telegram untuk menerima notifikasi soal website miliknya. |

---

## 3. Entitas Utama (Glossary)
- **Settings** — konfigurasi sistem: default Telegram bot token, bot token & chat ID admin, interval check, threshold notifikasi expiry.
- **Client** — pelanggan admin. Punya WhatsApp number, Telegram chat ID, dan (opsional) Telegram bot token sendiri — kalau kosong, pakai default dari `Settings`.
- **Package** — paket langganan: nama, harga, durasi aktif (hari).
- **Website** — milik 1 Client, memakai 1 Package aktif, punya URL yang bisa diganti kapan saja.
- **WebsitePackageHistory** — riwayat setiap kali website assign/ganti package (snapshot harga & tanggal berlaku), sumber perhitungan `expiresAt`.
- **WebsiteCheckLog** — hasil tiap pengecekan status (tiap 30 menit).
- **NotificationLog** — jejak notifikasi Telegram yang terkirim (ke client/admin).

---

## 4. Fitur

### 4.1 Client Management
- CRUD Client: nama, email, WhatsApp number, Telegram chat ID, Telegram bot token (opsional).
- List Client: search, jumlah website per client, status ringkas (berapa online/down).
- Detail Client: info kontak, daftar semua website miliknya, riwayat notifikasi yang pernah dikirim ke client tsb.
- Indikator jelas di UI kalau Client sedang pakai **bot token default sistem** vs **bot token custom**.

### 4.2 Website Management
- CRUD Website: nama/label, URL, assign ke Client, assign Package awal.
- **Ganti URL** kapan saja (update langsung, `updatedAt` tercatat).
- **Ganti/upgrade Package**: memilih package baru → sistem membuat entri baru di `WebsitePackageHistory` (snapshot harga saat itu) dan menghitung ulang `expiresAt` (lihat aturan di §4.2.1).
- **Info Deployment**: setiap website mencatat platform tempat website di-deploy — pilihan: `Vercel`, `Railway`, `Netlify`, `VPS`, `cPanel`, atau `Lainnya`. Ada field opsional `deploymentInfo` untuk detail tambahan (misal nama project di platform tsb, subdomain `.vercel.app`, region server, dsb).
- **Keterangan**: field catatan bebas (`notes`) per website — dipakai admin untuk info tambahan apa saja (misal "akses cPanel titip ke tim X", "perlu approval sebelum matikan", dll). Ditampilkan di detail website, opsional saat create.
- Status real-time dengan badge warna: `Online` (hijau), `Not Found` (kuning), `Blocked` (merah), `Offline/Error` (abu/merah), `Unknown` (belum pernah dicek).
- Tombol **Check Now** untuk trigger manual check (via Inngest event) di luar jadwal 30 menit.
- Riwayat check (grafik uptime sederhana + tabel log terbaru).
- Filter & sort: by status, by client, by package, by platform deployment, by "expiring soon".

**4.2.1 Aturan perhitungan `expiresAt`**
- Saat package pertama kali di-assign: `expiresAt = now + package.durationDays`.
- Saat ganti/upgrade package: default **replace** — `expiresAt = now + newPackage.durationDays` (opsi "extend dari sisa masa aktif" bisa jadi toggle di form ganti package untuk fleksibilitas admin).

### 4.3 Package Management
- CRUD Package: nama, harga, durasi (hari), deskripsi, status aktif/nonaktif.
- List Package menampilkan jumlah website yang sedang memakainya.
- Package yang masih dipakai website aktif **tidak bisa dihapus**, hanya bisa dinonaktifkan (soft delete via `isActive = false`) agar tidak bisa dipilih untuk website baru, tapi data historis tetap utuh.

### 4.4 Settings
- Default Telegram Bot Token (fallback untuk semua Client tanpa token sendiri).
- Admin Telegram Bot Token & Chat ID (khusus notifikasi ke admin).
- Interval check website (default 30 menit, bisa diubah).
- Threshold hari sebelum expired untuk mulai notifikasi (default H-3).
- Tombol "Test Notification" untuk validasi token/chat ID langsung dari UI.

### 4.5 Background Job (Inngest)

**Job 1 — `check-all-websites` (cron, tiap 30 menit / sesuai Settings)**
1. Ambil semua Website dengan `isActive = true`.
2. Fan-out: kirim event `website/check.requested` per website (paralel, dengan retry & timeout dari Inngest).
3. Tiap check: request HTTP ke URL, tentukan status:
   - `200–299` → `ONLINE`
   - `404` → `NOT_FOUND`
   - `403` / terindikasi halaman blokir ISP/Kominfo → `BLOCKED`
   - Timeout / DNS gagal / connection refused → `OFFLINE`
   - `5xx` lain → `ERROR`
4. Simpan hasil ke `WebsiteCheckLog`.
5. Update `Website.status` & `Website.lastCheckedAt`.
6. **Kalau status baru ≠ status sebelumnya DAN status baru termasuk `BLOCKED`/`OFFLINE`/`NOT_FOUND`/`ERROR`** → kirim event `notification/send` (tipe `WEBSITE_DOWN` / `WEBSITE_BLOCKED`).
7. *(Opsional, boleh dinonaktifkan)* kalau status pulih dari bermasalah → `ONLINE`, kirim `WEBSITE_RECOVERED`.

**Job 2 — `check-package-expiry` (cron harian)**
1. Ambil Website dengan `expiresAt` ≤ `now + thresholdDays` dan belum expired.
2. Kirim `notification/send` tipe `PACKAGE_EXPIRING` — **maksimal 1x per hari per website** (cek `NotificationLog` hari ini agar tidak spam).
3. Untuk yang sudah lewat `expiresAt` → tipe `PACKAGE_EXPIRED`, dan opsional set `Website.isActive = false` (dikonfirmasi terpisah, karena berdampak besar).

**Job 3 — `send-telegram-notification` (event-driven, dipicu Job 1 & 2)**
1. Tentukan bot token: Client custom token → fallback `Settings.defaultTelegramBotToken`.
2. Kirim ke Client via Telegram Bot API (`chatId` milik Client).
3. Kirim salinan ke Admin via `Settings.adminTelegramBotToken` + `Settings.adminTelegramChatId`.
4. Catat hasil (sukses/gagal) ke `NotificationLog`.

### 4.6 Notification Triggers (final, sesuai konfirmasi)
| Event | Ke Client | Ke Admin |
|---|---|---|
| Website berubah jadi Down/Not Found/Blocked/Error | ✅ | ✅ |
| Website pulih ke Online (opsional) | ✅ | ✅ |
| Package akan expired (H-3 default) | ✅ | ✅ |
| Package sudah expired | ✅ | ✅ |

*(Tidak ada notifikasi untuk setiap hasil check rutin yang statusnya tetap Online — sesuai keputusan.)*

---

## 5. Non-Functional Requirements
- **UI**: Dark mode (default & satu-satunya mode di v1), estetika minimalis ala Vercel/Dokploy — lihat `UI-UX-PLAN.md`.
- **Auth**: Login sederhana untuk 1 admin (credentials + session, tidak perlu role management).
- **Reliability**: Check job harus punya retry policy (Inngest built-in) agar 1 website gagal di-fetch tidak menghentikan batch lainnya.
- **Auditability**: Semua perubahan package & URL tercatat (via `updatedAt` / `WebsitePackageHistory`).
- **Performance**: Dashboard overview harus tetap cepat walau jumlah website ratusan — gunakan pagination & index yang tepat (lihat schema).

## 6. Out of Scope (v1)
- Client self-service portal/login.
- Payment gateway (sistem hanya *mencatat* harga, tidak memproses pembayaran).
- Multi-admin / role-based access control.
- Notifikasi via WhatsApp (nomor WA disimpan untuk referensi/kontak, tidak dipakai kirim notifikasi otomatis di v1 — bisa jadi fase 2).

## 7. Success Metrics
- 100% website aktif ter-check tiap siklus 30 menit tanpa job gagal total.
- Notifikasi terkirim < 1 menit setelah perubahan status terdeteksi.
- Admin bisa menilai kesehatan seluruh portofolio website dari 1 halaman dashboard.
