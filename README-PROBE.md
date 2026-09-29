# PHS Probe Worker

Probe worker adalah script Node.js ringan (tanpa dependency tambahan) yang berjalan di VPS Indonesia Anda untuk mengecek status website dari dalam jaringan lokal (mendeteksi pemblokiran ISP seperti Telkomsel/Indihome).

## Persyaratan
- Node.js versi 18 atau lebih baru.
- VPS berlokasi di Indonesia.

## Cara Instalasi & Menjalankan

1. Copy file `probe-dist/probe.js` ke VPS Anda.
2. Buat file `.env` di VPS (atau set langsung di environment/PM2), berisi:
   ```env
   API_URL=https://dashboard-anda.com
   PROBE_TOKEN=token_rahasia_probe_anda
   INTERVAL_MS=60000
   ```
3. Jalankan menggunakan **PM2** agar tetap hidup di background:
   ```bash
   npm install -g pm2
   pm2 start probe.js --name "phs-probe"
   pm2 save
   pm2 startup
   ```

## Menambahkan Probe di Database
Sebelum menjalankan script ini, Anda harus menambahkan data probe di database utama Anda (tabel `probes`):
1. Buat token rahasia bebas, misal `rahasia123`.
2. Hash token tersebut menggunakan SHA-256 (bisa pakai tool online atau script). Hash dari `rahasia123` adalah `2a1068bd...`.
3. Masukkan ke tabel `probes`:
   - `id`: `probe-1`
   - `name`: `Worker Telkomsel JKT`
   - `isp`: `telkomsel`
   - `tokenHash`: `<hasil_hash_sha256>`
4. Gunakan token asli (`rahasia123`) sebagai `PROBE_TOKEN` di VPS Anda.

## Konfigurasi Block Signatures
Sistem mengandalkan database untuk mendeteksi halaman blokir. Tambahkan data di tabel `block_signatures`:
- **KEYWORD**: misal `internetpositif`, `situs terlarang`, `kominfo`
- **HOSTNAME**: misal `internetpositif.uzone.id`
- **IP**: misal `118.98.66.50` (IP block page Telkom)

Data ini akan dikirim otomatis ke Probe Worker setiap kali ia meminta antrian job.
