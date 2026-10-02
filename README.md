<div align="center">

# 🎵 Sistem Pendapatan & Piutang — Salwa Music

**Sistem administrasi kursus musik berbasis web untuk mengelola data siswa, katalog program, tagihan bulanan, pencatatan pembayaran, dan pemantauan piutang secara real-time.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-yunistyasm.github.io-142D4C?style=for-the-badge)](https://yunistyasm.github.io/Sistem-Pendapatan-Piutang-Kursus-Musik-Salwa/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-181717?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)

![Status](https://img.shields.io/badge/Status-Prototipe_/_Internal-BF9E5F?style=flat-square)
![Snapshot](https://img.shields.io/badge/Snapshot-1_Oktober_2026-8B6B2E?style=flat-square)
![License](https://img.shields.io/badge/License-Internal-5A7358?style=flat-square)

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
