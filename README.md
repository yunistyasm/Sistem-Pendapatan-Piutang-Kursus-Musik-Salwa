<div align="center">

<img src="https://img.shields.io/badge/-S-BF9E5F?style=for-the-badge&labelColor=142D4C" height="60" />

# 🎵 Sistem Pendapatan & Piutang
### Salwa Music — Administrasi Kursus

**Sistem administrasi kursus musik berbasis web untuk mengelola data siswa, katalog program, tagihan bulanan, pencatatan pembayaran, dan pemantauan piutang secara real-time.**

<br>

<a href="https://yunistyasm.github.io/Sistem-Pendapatan-Piutang-Kursus-Musik-Salwa/">
  <img src="https://img.shields.io/badge/🌐_KLIK_DI_SINI_UNTUK_BUKA_SISTEM-BF9E5F?style=for-the-badge&labelColor=142D4C&logoColor=white" height="45" />
</a>

<br><br>

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-142D4C?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-7A9478?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-BF9E5F?style=for-the-badge&logo=github&logoColor=142D4C)](https://pages.github.com/)
[![HTML5](https://img.shields.io/badge/HTML5-142D4C?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-BF9E5F?style=for-the-badge&logo=javascript&logoColor=142D4C)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br>

![Status](https://img.shields.io/badge/Status-Prototipe_/_Internal-BF9E5F?style=flat-square&labelColor=142D4C)
![Snapshot](https://img.shields.io/badge/Snapshot-1_Oktober_2026-7A9478?style=flat-square&labelColor=142D4C)
![License](https://img.shields.io/badge/License-Internal-142D4C?style=flat-square)

</div>

---

<div align="center">

### 🎼 *"Musik yang indah, terkelola harmonis."*

</div>

---

## 📖 Tentang Proyek

**Salwa Music** adalah lembaga pendidikan musik yang menyelenggarakan kursus untuk 6 instrumen utama (Biola, Keyboard, Piano, Gitar, dan Vokal). Sistem ini dibangun untuk mengelola seluruh siklus keuangan kursus — mulai dari pendaftaran siswa, penerbitan tagihan bulanan, pencatatan pembayaran (termasuk cicilan), hingga pemantauan piutang secara real-time.

Proyek ini dikembangkan sebagai bagian dari mata kuliah **Pengkodean dan Pemrograman** dengan fokus pada implementasi basis data relasional (PostgreSQL/Supabase) dan integritas data keuangan.

---

## ✨ Fitur Utama

<table>
<tr>
<td width="50%">

### 📊 Dashboard
Ringkasan pendapatan bulan ini, total piutang, siswa aktif, dan program kursus tersedia dalam satu tampilan.

### 👥 Data Siswa
Manajemen identitas siswa terdaftar — nama, kontak, email, tanggal daftar, dan status aktif.

### 🎼 Program Kursus
Katalog 6 program musik dengan tarif bulanan, durasi sesi, dan instrumen.

</td>
<td width="50%">

### 📄 Tagihan
Penerbitan tagihan bulanan per siswa dan program, dilengkapi tanggal jatuh tempo.

### 💰 Pembayaran
Pencatatan penerimaan kas dengan metode Tunai, Transfer Bank, QRIS, atau Lainnya.

### 📈 Laporan
Rekap pendapatan, piutang berjalan, dan status tagihan (Belum Dibayar, Cicilan, Lunas, Lewat Jatuh Tempo).

</td>
</tr>
</table>

---

## 🎨 Tema & Desain

Sistem ini menggunakan palet warna yang mencerminkan identitas **Salwa Music** — profesional, hangat, dan elegan.

| Warna | Kode | Penggunaan |
|---|---|---|
| 🎨 **Navy** | `#142D4C` | Header, judul, tabel header |
| 🏆 **Gold** | `#BF9E5F` | Aksen, highlight, badge |
| 🌿 **Sage** | `#7A9478` | Status lunas, pembayaran diterima |
| ☁️ **Cream** | `#FAF8F4` | Background halaman |---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Database** | PostgreSQL (via Supabase) |
| **Hosting** | GitHub Pages |
| **Charts** | Inline SVG (custom) |
| **Auth (Rencana)** | Supabase Auth |

---

## 🗄️ Arsitektur Basis Data

### Diagram Relasi Entitas (ERD)

```mermaid
erDiagram
    SISWA ||--o{ TAGIHAN : "memiliki"
    PROGRAM_KURSUS ||--o{ TAGIHAN : "diacu"
    TAGIHAN ||--o{ PEMBAYARAN : "menerima"

    SISWA {
        bigint id_siswa PK
        varchar nama_siswa
        varchar no_telepon
        varchar email
        date tanggal_daftar
        boolean aktif
        timestamptz dibuat_pada
    }

    PROGRAM_KURSUS {
        bigint id_program PK
        varchar nama_program
        varchar instrumen
        smallint durasi_menit
        numeric biaya_bulanan
        boolean aktif
        timestamptz dibuat_pada
    }

    TAGIHAN {
        bigint id_tagihan PK
        bigint id_siswa FK
        bigint id_program FK
        varchar periode
        date tanggal_terbit
        date tanggal_jatuh_tempo
        numeric jumlah_tagihan
        text keterangan
        timestamptz dibuat_pada
    }

    PEMBAYARAN {
        bigint id_pembayaran PK
        bigint id_tagihan FK
        date tanggal_bayar
        numeric jumlah_bayar
        varchar metode
        varchar referensi
        timestamptz dibuat_pada
    }
---

## 📦 Bagian 3 dari 3

```markdown
---

## 📊 Snapshot Data Live

**Per 1 Oktober 2026**

| Metrik | Nilai |
|---|---|
| 👥 Siswa Aktif | **13 siswa** |
| 🎼 Program Kursus | **6 program** |
| 📄 Tagihan Terbit | **13 tagihan** |
| 💳 Transaksi Pembayaran | **5 transaksi** |
| 💰 Total Tagihan | **Rp 7.300.000** |
| ✅ Pembayaran Diterima | **Rp 2.050.000** (28,1%) |
| ⏳ Sisa Piutang | **Rp 5.250.000** (71,9%) |
| 📅 Penerimaan Oktober | **Rp 1.050.000** |

---

## 🚀 Cara Menjalankan

### Prasyarat

- Browser modern (Chrome, Firefox, Edge)
- Akun Supabase (untuk koneksi database)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/yunistyasm/Sistem-Pendapatan-Piutang-Kursus-Musik-Salwa.git

# 2. Masuk ke folder proyek
cd Sistem-Pendapatan-Piutang-Kursus-Musik-Salwa

# 3. Buka di browser
# Opsi A: langsung buka file
open index.html

# Opsi B: pakai Live Server (VS Code)
# Klik kanan index.html → Open with Live ServerSistem-Pendapatan-Piutang-Kursus-Musik-Salwa/
│
├── index.html          # Halaman utama aplikasi
├── style.css           # Styling tema (navy + gold)
├── script.js           # Logika aplikasi & interaksi
├── config.js           # Konfigurasi Supabase (URL + key)
├── database.sql        # Skema database & seed data
└── README.md           # Dokumentasi ini
<a href="https://yunistyasm.github.io/Sistem-Pendapatan-Piutang-Kursus-Musik-Salwa/"> <img src="https://img.shields.io/badge/🎵_KLIK_DI_SINI_UNTUK_BUKA_SISTEM-BF9E5F?style=for-the-badge&labelColor=142D4C" height="45" /> </a>
