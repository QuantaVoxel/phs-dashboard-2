# UI/UX Plan — Dark Mode (Vercel / Dokploy style)

## 1. Prinsip Desain
- **Dark mode default & satu-satunya mode** di v1.
- Minimalis, banyak whitespace, border tipis (bukan shadow tebal) untuk memisahkan section — ciri khas Vercel/Dokploy.
- Data-dense tapi tetap scannable: tabel jadi elemen utama, badge warna untuk status, monospace font untuk data teknis (URL, token, ID).
- Semua aksi berat (create/edit) pakai **drawer/side panel** dari kanan, bukan pindah halaman — biar konteks list tidak hilang.

## 2. Design Tokens

| Token | Value | Pemakaian |
|---|---|---|
| `--bg-base` | `#0a0a0a` | Background utama |
| `--bg-surface` | `#111113` | Card, sidebar, table row |
| `--bg-surface-hover` | `#1a1a1d` | Hover state |
| `--border` | `#26262b` | Border tipis 1px di semua card/table |
| `--text-primary` | `#fafafa` | Judul, teks utama |
| `--text-secondary` | `#a1a1aa` | Label, metadata |
| `--text-muted` | `#6b6b70` | Placeholder, disabled |
| `--accent` | `#3b82f6` (biru) | Link, primary button, focus ring |
| `--success` | `#22c55e` | Status Online |
| `--warning` | `#eab308` | Status Not Found / Expiring soon |
| `--danger` | `#ef4444` | Status Blocked / Offline / Error |
| `--neutral-status` | `#71717a` | Status Unknown |

**Font**: `Geist Sans` (atau `Inter`) untuk UI; `Geist Mono` / `JetBrains Mono` untuk URL, token, chat ID, angka teknis.
**Radius**: `8px` (card, input), `6px` (badge, button kecil).
**Shadow**: nyaris tidak dipakai — andalkan `border` + sedikit perbedaan `bg-surface` vs `bg-base`.

## 3. Layout Global
```text
┌──────────┬─────────────────────────────────────────┐
│          │  Topbar: Breadcrumb        [⌘K] [Admin▾]│
│ Sidebar  ├─────────────────────────────────────────┤
│  Logo    │                                         │
│  Nav:    │              Page Content               │
│  - Dash  │                                         │
│  - Client│                                         │
│  - Web   │                                         │
│  - Pkg   │                                         │
│  - Set   │                                         │
└──────────┴─────────────────────────────────────────┘
```
- Sidebar kiri fixed, collapsible (icon-only mode).
- Topbar: breadcrumb kontekstual + command palette (`⌘K`) untuk quick search client/website + dropdown profil admin (logout).
- Konten utama max-width dengan padding konsisten, mirip dashboard Vercel.

## 4. Halaman

### 4.1 Dashboard (Overview)
- 4 stat card di atas: **Total Client**, **Total Website**, **Website Bermasalah** (down+blocked, warna merah kalau >0), **Package akan Expired (7 hari)**.
- Section "Status Distribusi": mini donut/bar sederhana (Online vs Down vs Blocked vs Unknown).
- Tabel "Perlu Perhatian": website dengan status ≠ Online, atau `expiresAt` mendekat — sortable, klik row → detail website.
- Feed "Notifikasi Terbaru": list singkat dari `NotificationLog` (icon sesuai tipe, timestamp relatif "5 menit lalu").

### 4.2 Clients (List)
- Tabel: Nama | WhatsApp | Telegram Chat ID | Jumlah Website | Bot Token (badge "Default" / "Custom") | Aksi.
- Search bar + tombol "Add Client" (buka drawer form kanan).
- Klik row → halaman detail client.

### 4.3 Client Detail
- Header card: nama, kontak (WA, Telegram chat ID), tombol Edit.
- Section token: tampilkan status token (Default sistem / Custom) + tombol ganti.
- Tabel website milik client ini (reuse komponen tabel website, difilter by client).
- Tab "Riwayat Notifikasi": log notifikasi yang pernah dikirim ke client ini.

### 4.4 Websites (List)
- Tabel: Nama | URL (monospace, klik untuk buka tab baru) | Client | Package | Platform (icon: ▲ Vercel / Railway / Netlify / VPS / cPanel / Lainnya) | Status (badge) | Last Checked (relatif) | Expires In (badge warna kalau <7 hari) | Aksi.
- Filter bar: Status (multi-select), Client, Package, **Platform Deployment** (multi-select), "Expiring Soon" toggle.
- Tombol "Add Website" → drawer form (pilih client, isi URL, pilih package, pilih platform deployment, isi keterangan opsional).
- Bulk action opsional: "Check Now" untuk beberapa website sekaligus.

### 4.5 Website Detail
- Header: nama + URL (dengan tombol "Edit URL" inline) + badge status besar + badge platform deployment (dengan icon platform) + tombol **"Check Now"**.
- Card "Deployment Info": platform (dengan tombol edit/ganti platform), `deploymentInfo` (misal nama project/subdomain), dan **Keterangan** (`notes`) ditampilkan sebagai teks — klik untuk edit inline (textarea).
- Card "Package Aktif": nama package, harga, masa aktif (progress bar sisa hari), tombol "Ganti Package" → drawer pilih package baru + opsi "extend dari sisa masa aktif" atau "mulai dari sekarang".
- Chart uptime sederhana (garis waktu 24-48 jam terakhir, warna sesuai status per titik).
- Tabel `WebsiteCheckLog` terbaru (timestamp, status, http code, response time).
- Tab "Riwayat Package" → list dari `WebsitePackageHistory`.
- Tab "Notifikasi" → log notifikasi terkait website ini.

### 4.6 Packages (List)
- Tampilan card grid (bukan tabel) — mirip pricing card: nama, harga besar, durasi, badge "X website aktif pakai ini", toggle aktif/nonaktif.
- Tombol "Add Package" → drawer form.
- Package yang masih dipakai: tombol delete diganti "Nonaktifkan" (disabled kalau mau hard delete, dengan tooltip penjelasan).

### 4.7 Settings
- Form single-page, dikelompokkan per card:
  - **Telegram Default** — Default Bot Token (untuk client tanpa token sendiri).
  - **Telegram Admin** — Admin Bot Token + Admin Chat ID (dipakai buat notifikasi ke admin sendiri), tombol "Kirim Test Notification".
  - **Monitoring** — Interval check (dropdown: 5/15/30/60 menit), Threshold hari sebelum expired untuk mulai notifikasi.
- Semua field token ditampilkan sebagai password field dengan toggle show/hide (ala API key di Vercel).

## 5. Komponen Kunci
- **StatusBadge**: pill kecil dengan dot warna + label (`● Online`, `● Blocked`, dst).
- **PlatformBadge**: pill kecil dengan icon platform (▲ Vercel, Railway, Netlify, VPS, cPanel) + label — dipakai di tabel & detail website.
- **ExpiryBadge**: warna otomatis — hijau (>14 hari), kuning (≤7 hari), merah (≤3 hari / expired).
- **TokenField**: input password-style dengan indikator "Using system default" kalau kosong.
- **Drawer/Sheet**: form create/edit, slide dari kanan, overlay gelap transparan.
- **EmptyState**: ilustrasi minimal + CTA, dipakai saat list kosong (mis. client belum punya website).
- **Toast**: konfirmasi aksi (create/update/delete/test notification) di pojok kanan bawah, gaya Vercel.

## 6. Interaksi & Micro-UX
- Command palette (`⌘K`): cari client/website by nama/URL, langsung loncat ke detail.
- Skeleton loading di semua tabel (bukan spinner tengah layar) saat fetch data.
- Optimistic update untuk toggle aktif/nonaktif package & status client.
- Konfirmasi modal untuk aksi destruktif (nonaktifkan website, hapus package tak terpakai).
- Relative timestamp everywhere ("2 menit lalu") dengan tooltip full date on hover.
