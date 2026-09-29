# Rencana Implementasi: Fitur Deteksi Website Terblokir (Censorship Detection)

## Tahap 1: Persiapan Database (Prisma)
Akan ditambahkan tabel dan field baru pada `prisma/schema.prisma`:
- Model `Probe`: `id`, `name`, `isp`, `location`, `tokenHash`, `lastSeenAt`
- Model `BlockSignature`: `id`, `type` (IP, HOSTNAME, KEYWORD), `value`, `isp`
- Model `CheckResult`: `id`, `websiteId`, `probeId`, `status`, `blockType`, `stage`, `resolvedIps`, `httpStatus`, dll.
- Modifikasi `Website`: Menambahkan field `blockType` (opsional) dan status `BLOCKED` (sudah ada).
- Jalankan migrasi dan regenerate client.

## Tahap 2: Library `packages/checker`
Membuat folder `src/lib/checker` yang berisi logika pengecekan murni:
- Pengecekan DNS menggunakan `dns.promises` dan DoH (Cloudflare/Google).
- Pengecekan TCP port 443 dan TLS (menggunakan `net` dan `tls`).
- Pengecekan HTTP dengan mengikuti rantai redirect secara manual.
- Fungsi utilitas untuk membandingkan hasil dengan `block_signatures`.
- Fungsi `runCheck(domain)` yang mengeksekusi semua tahapan secara berurutan dan mengembalikan `CheckResult`.

## Tahap 3: Agregasi dan API Endpoint (Next.js)
Membuat fungsionalitas di sisi Next.js:
- API Route `/api/probe/results` untuk menerima data dari worker (probe). Payload akan divalidasi dengan Zod, dan `token` akan di-hash dan diverifikasi dengan tabel `probes`.
- Logika agregasi: Menyimpan hasil ke `CheckResult` dan membandingkan hasil probe dengan hasil server (global). Jika probe gagal namun global sukses = `BLOCKED`. Jika keduanya gagal = `DOWN`. Memperbarui status di tabel `Website`.
- Tambahkan API Route atau server action yang dipanggil oleh cron Inngest untuk mendelegasikan pengecekan server global.

## Tahap 4: Worker `apps/probe`
Membuat package standalone Node.js (`src/probe-worker` atau repository terpisah/folder terpisah):
- Berjalan sebagai script daemon/PM2 di VPS.
- Melakukan polling atau mem-push data ke API Next.js. Karena ini sistem berbasis event atau scheduling, probe akan mengambil antrian dari Next.js (atau Next.js mengirimkan target, namun arsitektur pull lebih aman dari sisi firewall). Pendekatan tersederhana: Probe memiliki daftar target (diambil dari Next.js) dan mengeksekusi check, lalu POST hasilnya.

## Tahap 5: Pembaruan UI
- Menambahkan badge khusus untuk status `BLOCKED` di dashboard (dengan tampilan yang membedakannya dari DOWN).
- Menampilkan alasan/tipe blokir (`blockType`) dan hasil probe-per-ISP pada halaman detail website.

## Asumsi & Manual Action (Untuk User):
- User perlu mengisi tabel `BlockSignature` secara manual melalui database/seeder dengan IP Internet Positif atau URL redirect Telkomsel (karena ini berubah-ubah).
- Menyiapkan VPS di Indonesia dan menjalankan `probe-worker` secara manual.

Saya akan mulai dari Tahap 1.
