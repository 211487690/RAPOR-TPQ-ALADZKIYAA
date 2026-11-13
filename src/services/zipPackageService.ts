import JSZip from 'jszip';
import { LembagaProfile } from '../types';
import { phpTemplates } from './phpTemplates';

const escSql = (val?: string): string =>
  (val || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

async function fetchLogoBytes(logoUrl?: string): Promise<Uint8Array | null> {
  const candidates = [
    logoUrl?.trim(),
    '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'
  ].filter((v): v is string => Boolean(v));

  for (const src of candidates) {
    try {
      if (src.startsWith('data:image/')) {
        const base64Part = src.split(',')[1];
        if (!base64Part) continue;
        const binStr = atob(base64Part);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        return bytes;
      }

      const res = await fetch(src);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 0) {
        return new Uint8Array(buf);
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export const zipPackageService = {
  // Generate complete SQL dump for MariaDB / MySQL
  generateDatabaseSQL(lembaga: LembagaProfile): string {
    const nama = escSql(lembaga.nama || 'TPQ Al-Adzkiyaa’');
    const yayasan = escSql(lembaga.yayasan || 'Yayasan Pendidikan Al Ma\'arif Miftahul Huda Singosari');
    const nstpq = escSql(lembaga.nstpq || lembaga.nspq || '');
    const telepon = escSql(lembaga.telepon || '');
    const website = escSql(lembaga.website || '');
    const alamat = escSql(lembaga.alamat || '');
    const kelurahan = escSql(lembaga.kelurahan || '');
    const kecamatan = escSql(lembaga.kecamatan || '');
    const kota = escSql(lembaga.kota || '');
    const provinsi = escSql(lembaga.provinsi || '');
    const kepalaTpq = escSql(lembaga.kepalaTpq || 'Kepala TPQ');
    const nipKepala = escSql(lembaga.nipKepala || '');
    const jabatan = escSql(lembaga.jabatanPenandatangan || 'Kepala TPQ');
    const kotaPenerbitan = escSql(lembaga.kotaPenerbitan || 'Malang');
    const footnote = escSql(lembaga.footnote || 'Copyright © Umar Izzularab 2026 All Rights Reserved');

    return `-- ========================================================
-- RAPOR TPQ AL-ADZKIYAA’ - DATABASE SCHEMA & INITIAL SEED
-- Sistem Penilaian & Manajemen TPQ Terpadu
-- Target DBMS: MySQL 8+ / MariaDB 10.4+
-- Author: Umar Izzularab (All Rights Reserved)
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- --------------------------------------------------------
-- 1. Table structure for table \`users\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin','kepala','ustadz','santri','operator') NOT NULL DEFAULT 'ustadz',
  \`ref_id\` VARCHAR(50) DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`nama\`, \`role\`, \`ref_id\`) VALUES
(1, 'admin', MD5('admin123'), 'Administrator TPQ', 'admin', NULL),
(2, 'kepala', MD5('password123'), '${kepalaTpq}', 'kepala', '1'),
(3, 'ustadz1', MD5('password123'), 'Ust. Ahmad Fauzi, S.Pd.', 'ustadz', '2'),
(4, 'santri1', MD5('password123'), 'Muhammad Rayhan Pratama', 'santri', '1');

-- --------------------------------------------------------
-- 2. Table structure for table \`settings\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`settings\`;
CREATE TABLE \`settings\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`setting_key\` VARCHAR(100) NOT NULL UNIQUE,
  \`setting_value\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`settings\` (\`setting_key\`, \`setting_value\`) VALUES
('app_name', 'RAPOR TPQ AL-ADZKIYAA’'),
('theme_color', 'emerald'),
('paper_size', 'A4'),
('footer_text', '${footnote}'),
('min_passing_score', '70');

-- --------------------------------------------------------
-- 3. Table structure for table \`lembaga\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`lembaga\`;
CREATE TABLE \`lembaga\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(150) NOT NULL,
  \`yayasan\` VARCHAR(200) NOT NULL,
  \`nstpq\` VARCHAR(50) NOT NULL,
  \`nspq\` VARCHAR(50) DEFAULT NULL,
  \`telepon\` VARCHAR(50) DEFAULT NULL,
  \`website\` VARCHAR(150) DEFAULT NULL,
  \`alamat\` TEXT NOT NULL,
  \`kelurahan\` VARCHAR(100) DEFAULT NULL,
  \`kecamatan\` VARCHAR(100) DEFAULT NULL,
  \`kota\` VARCHAR(100) DEFAULT NULL,
  \`provinsi\` VARCHAR(100) DEFAULT NULL,
  \`kepala_tpq\` VARCHAR(100) NOT NULL,
  \`nip_kepala\` VARCHAR(50) DEFAULT NULL,
  \`jabatan_penandatangan\` VARCHAR(50) DEFAULT 'Kepala TPQ',
  \`kota_penerbitan\` VARCHAR(100) DEFAULT 'Malang',
  \`logo_url\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`lembaga\` (\`id\`, \`nama\`, \`yayasan\`, \`nstpq\`, \`nspq\`, \`telepon\`, \`website\`, \`alamat\`, \`kelurahan\`, \`kecamatan\`, \`kota\`, \`provinsi\`, \`kepala_tpq\`, \`nip_kepala\`, \`jabatan_penandatangan\`, \`kota_penerbitan\`, \`logo_url\`) VALUES
(1, '${nama}', '${yayasan}', '${nstpq}', '${nstpq}', '${telepon}', '${website}', '${alamat}', '${kelurahan}', '${kecamatan}', '${kota}', '${provinsi}', '${kepalaTpq}', '${nipKepala}', '${jabatan}', '${kotaPenerbitan}', 'assets/img/logo-tpq.png');

-- --------------------------------------------------------
-- 4. Table structure for table \`tahun_pelajaran\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`tahun_pelajaran\`;
CREATE TABLE \`tahun_pelajaran\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`tahun\` VARCHAR(20) NOT NULL,
  \`semester_aktif\` ENUM('Ganjil','Genap') NOT NULL DEFAULT 'Ganjil',
  \`is_aktif\` TINYINT(1) NOT NULL DEFAULT 1,
  \`is_locked\` TINYINT(1) NOT NULL DEFAULT 0,
  \`tgl_rapor_ganjil\` VARCHAR(60) DEFAULT NULL,
  \`tgl_rapor_genap\` VARCHAR(60) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`tahun_pelajaran\` (\`id\`, \`tahun\`, \`semester_aktif\`, \`is_aktif\`, \`is_locked\`, \`tgl_rapor_ganjil\`, \`tgl_rapor_genap\`) VALUES
(1, '2025/2026', 'Ganjil', 1, 0, '2025-12-20', '2026-06-20'),
(2, '2024/2025', 'Genap', 0, 1, '2024-12-21', '2025-06-21');

-- --------------------------------------------------------
-- 5. Table structure for table \`semester\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`semester\`;
CREATE TABLE \`semester\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` ENUM('Ganjil','Genap') NOT NULL,
  \`keterangan\` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`semester\` (\`id\`, \`nama\`, \`keterangan\`) VALUES
(1, 'Ganjil', 'Semester Pertama'),
(2, 'Genap', 'Semester Kedua (Kenaikan Kelas/Jilid)');

-- --------------------------------------------------------
-- 6. Table structure for table \`ustadz\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`ustadz\`;
CREATE TABLE \`ustadz\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nip\` VARCHAR(50) DEFAULT NULL,
  \`nama\` VARCHAR(100) NOT NULL,
  \`foto\` VARCHAR(255) DEFAULT NULL,
  \`jk\` ENUM('L','P') NOT NULL DEFAULT 'L',
  \`tempat_lahir\` VARCHAR(100) DEFAULT NULL,
  \`tanggal_lahir\` DATE DEFAULT NULL,
  \`alamat\` TEXT DEFAULT NULL,
  \`no_hp\` VARCHAR(30) DEFAULT NULL,
  \`pendidikan\` VARCHAR(100) DEFAULT NULL,
  \`status\` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  \`username\` VARCHAR(50) DEFAULT NULL,
  \`password\` VARCHAR(255) DEFAULT NULL,
  \`role\` ENUM('ustadz','kepala','admin') NOT NULL DEFAULT 'ustadz',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`ustadz\` (\`id\`, \`nip\`, \`nama\`, \`jk\`, \`no_hp\`, \`pendidikan\`, \`status\`, \`username\`, \`role\`) VALUES
(1, '19890412201501', '${kepalaTpq}', 'L', '${telepon}', 'S1 Pendidikan Agama Islam', 'aktif', 'kepala', 'kepala'),
(2, '19920815201802', 'Ust. Ahmad Fauzi, S.Pd.', 'L', '0812-3344-5566', 'S1 Bahasa Arab', 'aktif', 'ustadz1', 'ustadz'),
(3, '19950320202003', 'Ustadzah Siti Aminah, S.Ag.', 'P', '0813-7788-9900', 'S1 Ilmu Al-Quran', 'aktif', 'ustadzah1', 'ustadz');

-- --------------------------------------------------------
-- 7. Table structure for table \`kelas\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`kelas\`;
CREATE TABLE \`kelas\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama_kelas\` VARCHAR(100) NOT NULL,
  \`tingkatan\` VARCHAR(50) DEFAULT NULL,
  \`ustadz_id\` INT(11) DEFAULT NULL,
  \`urutan\` INT(11) NOT NULL DEFAULT 1,
  \`kapasitas\` INT(11) NOT NULL DEFAULT 25,
  \`keterangan\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`kelas\` (\`id\`, \`nama_kelas\`, \`tingkatan\`, \`ustadz_id\`, \`urutan\`, \`kapasitas\`) VALUES
(1, 'Halaqoh Bilqolam Dasar (Abu Bakar)', 'Pemula', 2, 1, 25),
(2, 'Halaqoh Juz Amma (Umar bin Khattab)', 'Menengah', 2, 2, 25),
(3, 'Halaqoh Al-Quran & Tartil (Utsman bin Affan)', 'Lanjutan', 3, 3, 20);

-- --------------------------------------------------------
-- 8. Table structure for table \`santri\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`santri\`;
CREATE TABLE \`santri\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nis\` VARCHAR(30) NOT NULL UNIQUE,
  \`nama_lengkap\` VARCHAR(150) NOT NULL,
  \`nama_panggilan\` VARCHAR(50) DEFAULT NULL,
  \`jk\` ENUM('L','P') NOT NULL DEFAULT 'L',
  \`tempat_lahir\` VARCHAR(100) DEFAULT NULL,
  \`tanggal_lahir\` DATE DEFAULT NULL,
  \`alamat\` TEXT DEFAULT NULL,
  \`nama_ayah\` VARCHAR(100) DEFAULT NULL,
  \`nama_ibu\` VARCHAR(100) DEFAULT NULL,
  \`no_hp_ortu\` VARCHAR(30) DEFAULT NULL,
  \`tanggal_masuk\` DATE DEFAULT NULL,
  \`foto\` VARCHAR(255) DEFAULT NULL,
  \`kelas_id\` INT(11) DEFAULT NULL,
  \`metode_id\` INT(11) DEFAULT NULL,
  \`jilid_id\` INT(11) DEFAULT NULL,
  \`status\` ENUM('aktif','lulus','pindah','nonaktif') NOT NULL DEFAULT 'aktif',
  \`username\` VARCHAR(50) DEFAULT NULL,
  \`password\` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`santri\` (\`id\`, \`nis\`, \`nama_lengkap\`, \`nama_panggilan\`, \`jk\`, \`tempat_lahir\`, \`tanggal_lahir\`, \`alamat\`, \`nama_ayah\`, \`nama_ibu\`, \`no_hp_ortu\`, \`tanggal_masuk\`, \`kelas_id\`, \`metode_id\`, \`jilid_id\`, \`status\`, \`username\`) VALUES
(1, '2025001', 'Muhammad Rayhan Pratama', 'Rayhan', 'L', 'Malang', '2017-06-12', 'Dusun Ngujung RT 02 / RW 02 Toyomarto, Singosari', 'Budi Santoso', 'Siti Rohmah', '0812-3456-7801', '2023-07-15', 1, 1, 3, 'aktif', 'santri1'),
(2, '2025002', 'Aisyah Nur Kamila', 'Kamila', 'P', 'Malang', '2016-11-04', 'Jl. Patih RT 01 / RW 02 Toyomarto, Singosari', 'Ahmad Fauzi', 'Nur Laili', '0813-9876-5402', '2023-07-15', 2, 2, 8, 'aktif', 'santri2'),
(3, '2025003', 'Fathan Al-Ghifari', 'Fathan', 'L', 'Surabaya', '2015-08-20', 'Perumahan Singosari Permai Blok C4', 'Rahmat Hidayat', 'Dewi Sartika', '0857-1122-3303', '2022-07-10', 3, 3, 11, 'aktif', 'santri3');

-- --------------------------------------------------------
-- 9. Table structure for table \`anggota_kelas\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`anggota_kelas\`;
CREATE TABLE \`anggota_kelas\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`kelas_id\` INT(11) NOT NULL,
  \`tahun_id\` INT(11) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`anggota_kelas\` (\`santri_id\`, \`kelas_id\`, \`tahun_id\`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1);

-- --------------------------------------------------------
-- 10. Table structure for table \`metode\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`metode\`;
CREATE TABLE \`metode\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(100) NOT NULL,
  \`deskripsi\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`metode\` (\`id\`, \`nama\`, \`deskripsi\`) VALUES
(1, 'Metode Bilqolam', 'Metode cepat dan tepat membaca Al-Quran dengan kaidah bilqolam'),
(2, 'Tahfidz Juz Amma', 'Hafalan surat-surat pendek dalam Juz 30'),
(3, 'Al-Quran 30 Juz', 'Tadarus Al-Quran tartil dan fashohah');

-- --------------------------------------------------------
-- 11. Table structure for table \`jilid\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`jilid\`;
CREATE TABLE \`jilid\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`metode_id\` INT(11) NOT NULL,
  \`nama\` VARCHAR(100) NOT NULL,
  \`urutan\` INT(11) NOT NULL,
  \`target\` TEXT DEFAULT NULL,
  \`syarat_lulus\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`jilid\` (\`id\`, \`metode_id\`, \`nama\`, \`urutan\`, \`target\`, \`syarat_lulus\`) VALUES
(1, 1, 'Bilqolam Jilid 1', 1, 'Mengenal huruf tunggal berharokat', 'Lancar tanpa dieja'),
(2, 1, 'Bilqolam Jilid 2', 2, 'Huruf sambung dan kasroh dhommah', 'Bedakan 1 harokat'),
(3, 1, 'Bilqolam Jilid 3', 3, 'Mad thobii dan tanwin', 'Membedakan panjang 2 harokat'),
(4, 1, 'Bilqolam Jilid 4', 4, 'Sukun, tasydid, qolqolah', 'Membaca mantap'),
(5, 1, 'Bilqolam Jilid 5', 5, 'Idghom, ikhfa, izhhar, gunnah', 'Dengung sempurna'),
(6, 1, 'Bilqolam Jilid 6 / Ghorib', 6, 'Ghorib dan tajwid lengkap', 'Siap masuk Al-Quran'),
(7, 2, 'Level 1 (An-Naas s/d Al-Humazah)', 1, '10 surat pendek', 'Hafalan mutqin'),
(8, 2, 'Level 2 (Al-Ashr s/d Adh-Dhuha)', 2, 'Pertengahan juz 30', 'Tartil dan fashih'),
(9, 2, 'Level 3 (Al-Lail s/d An-Naba)', 3, 'Khatam juz 30', 'Ujian komprehensif'),
(10, 3, 'Tadarus Juz 1 - 10', 1, 'Kelancaran tilawah', 'Makhroj tepat'),
(11, 3, 'Tadarus Juz 11 - 20', 2, 'Waqof dan fashohah', 'Tartil berkaidah'),
(12, 3, 'Tadarus Juz 21 - 30 (Khotam)', 3, 'Khatam 30 Juz', 'Siap munaqosyah');

-- --------------------------------------------------------
-- 12. Table structure for table \`komponen_penilaian\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`komponen_penilaian\`;
CREATE TABLE \`komponen_penilaian\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(100) NOT NULL,
  \`bobot\` INT(11) NOT NULL DEFAULT 15,
  \`urutan\` INT(11) NOT NULL DEFAULT 1,
  \`kategori\` VARCHAR(50) DEFAULT 'Al-Quran & Tajwid',
  \`is_aktif\` TINYINT(1) NOT NULL DEFAULT 1,
  \`show_in_rapor\` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`komponen_penilaian\` (\`id\`, \`nama\`, \`bobot\`, \`urutan\`, \`kategori\`, \`is_aktif\`, \`show_in_rapor\`) VALUES
(1, 'Kelancaran Membaca', 20, 1, 'Al-Quran & Tajwid', 1, 1),
(2, 'Tajwid & Makhorijul Huruf', 20, 2, 'Al-Quran & Tajwid', 1, 1),
(3, 'Fashohah & Irama (Tartil)', 15, 3, 'Al-Quran & Tajwid', 1, 1),
(4, 'Hafalan Surat Pendek', 15, 4, 'Hafalan', 1, 1),
(5, 'Praktik Ibadah & Doa Harian', 15, 5, 'Praktik Ibadah', 1, 1),
(6, 'Adab, Akhlak & Kedisiplinan', 15, 6, 'Akhlak & Adab', 1, 1);

-- --------------------------------------------------------
-- 13. Table structure for table \`bobot_penilaian\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`bobot_penilaian\`;
CREATE TABLE \`bobot_penilaian\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`predikat\` VARCHAR(10) NOT NULL,
  \`label\` VARCHAR(50) NOT NULL,
  \`min_score\` INT(11) NOT NULL,
  \`max_score\` INT(11) NOT NULL,
  \`keterangan\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`bobot_penilaian\` (\`id\`, \`predikat\`, \`label\`, \`min_score\`, \`max_score\`, \`keterangan\`) VALUES
(1, 'A', 'Sangat Baik (Mumtaz)', 86, 100, 'Sangat memuaskan, tartil dan adab terpuji'),
(2, 'B', 'Baik (Jayyid Jiddan)', 76, 85, 'Baik, kelancaran memadai dan disiplin'),
(3, 'C', 'Cukup (Jayyid)', 65, 75, 'Cukup, telah mencapai kkm perlu latihan lagi'),
(4, 'D', 'Perlu Bimbingan (Maqbul)', 0, 64, 'Perlu bimbingan intensif ustadz dan orang tua');

-- --------------------------------------------------------
-- 14. Table structure for table \`nilai\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`nilai\`;
CREATE TABLE \`nilai\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`tahun_id\` INT(11) NOT NULL,
  \`semester\` ENUM('Ganjil','Genap') NOT NULL,
  \`komponen_id\` INT(11) NOT NULL,
  \`nilai_angka\` DECIMAL(5,2) NOT NULL,
  \`catatan\` TEXT DEFAULT NULL,
  \`ustadz_id\` INT(11) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_nilai\` (\`santri_id\`, \`tahun_id\`, \`semester\`, \`komponen_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`nilai\` (\`santri_id\`, \`tahun_id\`, \`semester\`, \`komponen_id\`, \`nilai_angka\`, \`catatan\`, \`ustadz_id\`) VALUES
(1, 1, 'Ganjil', 1, 88.00, 'Lancar membaca', 2),
(1, 1, 'Ganjil', 2, 85.00, 'Makhroj mantap', 2),
(1, 1, 'Ganjil', 3, 82.00, 'Irama baik', 2),
(1, 1, 'Ganjil', 4, 90.00, 'Hafalan lancar', 2),
(1, 1, 'Ganjil', 5, 86.00, 'Sholat subuh tuntas', 2),
(1, 1, 'Ganjil', 6, 92.00, 'Sangat santun', 2),
(2, 1, 'Ganjil', 1, 94.00, 'Sangat fasih', 2),
(2, 1, 'Ganjil', 2, 95.00, 'Tajwid akurat', 2),
(2, 1, 'Ganjil', 3, 92.00, 'Tartil merdu', 2),
(2, 1, 'Ganjil', 4, 96.00, 'Hafalan mutqin', 2),
(2, 1, 'Ganjil', 5, 90.00, 'Praktik baik', 2),
(2, 1, 'Ganjil', 6, 95.00, 'Teladan akhlak', 2);

-- --------------------------------------------------------
-- 15. Table structure for table \`deskripsi_nilai\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`deskripsi_nilai\`;
CREATE TABLE \`deskripsi_nilai\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`tahun_id\` INT(11) NOT NULL,
  \`semester\` ENUM('Ganjil','Genap') NOT NULL,
  \`catatan_wali\` TEXT DEFAULT NULL,
  \`catatan_kepala\` TEXT DEFAULT NULL,
  \`capaian_hafalan\` TEXT DEFAULT NULL,
  \`capaian_ibadah\` TEXT DEFAULT NULL,
  \`sakit\` INT(11) DEFAULT 0,
  \`izin\` INT(11) DEFAULT 0,
  \`alpa\` INT(11) DEFAULT 0,
  \`keputusan\` VARCHAR(150) DEFAULT 'Lulus Naik Jilid / Tingkat Selanjutnya',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_desc\` (\`santri_id\`, \`tahun_id\`, \`semester\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`deskripsi_nilai\` (\`santri_id\`, \`tahun_id\`, \`semester\`, \`catatan_wali\`, \`catatan_kepala\`, \`capaian_hafalan\`, \`capaian_ibadah\`, \`sakit\`, \`izin\`, \`alpa\`, \`keputusan\`) VALUES
(1, 1, 'Ganjil', 'Alhamdulillah kemajuan pesat dalam bilqolam', 'Barakallah terus istiqomah', 'An-Naas s/d Al-Fil', 'Doa wudhu & sholat subuh', 1, 1, 0, 'Lulus Naik Jilid / Tingkat Selanjutnya (Bilqolam Jilid 4)'),
(2, 1, 'Ganjil', 'Prestasi sangat istimewa dan teladan', 'Semoga menjadi hafidzah kebanggaan', 'An-Naas s/d Al-Ala', 'Memimpin sholat dhuha', 0, 0, 0, 'Lulus Naik Level Juz Amma');

-- --------------------------------------------------------
-- 16. Table structure for table \`evaluasi_kenaikan\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`evaluasi_kenaikan\`;
CREATE TABLE \`evaluasi_kenaikan\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`metode_id\` INT(11) NOT NULL,
  \`dari_jilid\` INT(11) NOT NULL,
  \`ke_jilid\` INT(11) NOT NULL,
  \`nilai_ujian\` DECIMAL(5,2) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL,
  \`penguji\` VARCHAR(100) NOT NULL,
  \`catatan\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 17. Table structure for table \`riwayat_kenaikan_jilid\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`riwayat_kenaikan_jilid\`;
CREATE TABLE \`riwayat_kenaikan_jilid\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`jilid_lama\` VARCHAR(100) NOT NULL,
  \`jilid_baru\` VARCHAR(100) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`keterangan\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 18. Table structure for table \`riwayat_kenaikan_kelas\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`riwayat_kenaikan_kelas\`;
CREATE TABLE \`riwayat_kenaikan_kelas\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`dari_kelas\` VARCHAR(100) NOT NULL,
  \`ke_kelas\` VARCHAR(100) NOT NULL,
  \`tahun_ajaran\` VARCHAR(50) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 19. Table structure for table \`rapor\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`rapor\`;
CREATE TABLE \`rapor\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`santri_id\` INT(11) NOT NULL,
  \`tahun_id\` INT(11) NOT NULL,
  \`semester\` ENUM('Ganjil','Genap') NOT NULL,
  \`rata_rata\` DECIMAL(5,2) NOT NULL,
  \`predikat\` VARCHAR(10) NOT NULL,
  \`status_cetak\` TINYINT(1) DEFAULT 0,
  \`tgl_cetak\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 20. Table structure for table \`piagam\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`piagam\`;
CREATE TABLE \`piagam\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nomor_piagam\` VARCHAR(100) NOT NULL,
  \`santri_id\` INT(11) NOT NULL,
  \`tahun_id\` INT(11) NOT NULL,
  \`semester\` ENUM('Ganjil','Genap') NOT NULL,
  \`kelas_id\` INT(11) NOT NULL,
  \`kategori\` VARCHAR(150) NOT NULL,
  \`juara\` TINYINT(4) NOT NULL,
  \`nilai_akhir\` DECIMAL(5,2) NOT NULL,
  \`tanggal_terbit\` DATE NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`piagam\` (\`nomor_piagam\`, \`santri_id\`, \`tahun_id\`, \`semester\`, \`kelas_id\`, \`kategori\`, \`juara\`, \`nilai_akhir\`, \`tanggal_terbit\`) VALUES
('PG/TPQ-ADZ/2025/001', 2, 1, 'Ganjil', 2, 'Prestasi Akademik Rapor Semester Ganjil', 1, 94.00, '2025-12-20'),
('PG/TPQ-ADZ/2025/002', 1, 1, 'Ganjil', 1, 'Prestasi Akademik Rapor Semester Ganjil', 1, 87.80, '2025-12-20');

-- --------------------------------------------------------
-- 21. Table structure for table \`backup\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`backup\`;
CREATE TABLE \`backup\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`filename\` VARCHAR(255) NOT NULL,
  \`filesize\` VARCHAR(50) DEFAULT NULL,
  \`created_by\` VARCHAR(100) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 22. Table structure for table \`activity_logs\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`activity_logs\`;
CREATE TABLE \`activity_logs\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`user_id\` INT(11) DEFAULT NULL,
  \`action\` VARCHAR(255) NOT NULL,
  \`ip_address\` VARCHAR(50) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 23. Table structure for table \`chat\` (Internal coordination)
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`chat\`;
CREATE TABLE \`chat\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`sender_id\` VARCHAR(50) NOT NULL,
  \`sender_name\` VARCHAR(100) NOT NULL,
  \`recipient_id\` VARCHAR(50) NOT NULL,
  \`recipient_name\` VARCHAR(100) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`is_read\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
`;
  },

  // Generate includes/sidebar.php (Exact match with React Sidebar.tsx roles, icons, spacing & logo)
  generateSidebarPHP(): string {
    return `<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$role = $_SESSION['user']['role'] ?? 'ustadz';

$sidebarSections = [
    [
        'title' => 'UTAMA',
        'items' => [
            ['file' => 'dashboard.php', 'label' => 'Beranda', 'icon' => 'bi-grid', 'roles' => ['admin', 'kepala', 'ustadz']],
            ['file' => 'profil_santri.php', 'label' => 'Profil Santri', 'icon' => 'bi-person', 'roles' => ['admin', 'santri', 'ustadz']],
            ['file' => 'chat.php', 'label' => 'Pesan Internal', 'icon' => 'bi-chat-square-text', 'roles' => ['admin', 'kepala', 'ustadz']],
        ]
    ],
    [
        'title' => 'MASTER DATA',
        'items' => [
            ['file' => 'tahun_semester.php', 'label' => 'Tahun &amp; Semester', 'icon' => 'bi-calendar3', 'roles' => ['admin', 'kepala']],
            ['file' => 'ustadz.php', 'label' => 'Ustadz / Ustadzah', 'icon' => 'bi-person-check', 'roles' => ['admin', 'kepala']],
            ['file' => 'santri.php', 'label' => 'Data Santri', 'icon' => 'bi-people', 'roles' => ['admin', 'kepala', 'ustadz']],
            ['file' => 'kelas.php', 'label' => 'Kelas / Halaqoh', 'icon' => 'bi-building', 'roles' => ['admin', 'kepala', 'ustadz']],
            ['file' => 'metode_jilid.php', 'label' => 'Metode &amp; Jilid', 'icon' => 'bi-bookmark-check', 'roles' => ['admin', 'kepala']],
            ['file' => 'komponen_nilai.php', 'label' => 'Komponen Nilai', 'icon' => 'bi-sliders', 'roles' => ['admin', 'kepala']],
        ]
    ],
    [
        'title' => 'PENILAIAN &amp; AKADEMIK',
        'items' => [
            ['file' => 'isi_nilai.php', 'label' => 'Isi Nilai Santri', 'icon' => 'bi-pencil-square', 'roles' => ['admin', 'ustadz']],
            ['file' => 'kumpulan_nilai.php', 'label' => 'Leger &amp; Ranking Nilai', 'icon' => 'bi-award', 'roles' => ['admin', 'kepala', 'ustadz']],
            ['file' => 'kenaikan_jilid.php', 'label' => 'Kenaikan Jilid', 'icon' => 'bi-arrow-up-circle', 'roles' => ['admin', 'ustadz']],
            ['file' => 'kenaikan_kelas.php', 'label' => 'Kenaikan Kelas', 'icon' => 'bi-mortarboard', 'roles' => ['admin', 'kepala']],
        ]
    ],
    [
        'title' => 'DOKUMEN &amp; CETAK',
        'items' => [
            ['file' => 'rapor.php', 'label' => 'Cetak Rapor Santri', 'icon' => 'bi-file-earmark-text', 'roles' => ['admin', 'kepala', 'ustadz', 'santri']],
            ['file' => 'piagam.php', 'label' => 'Piagam Penghargaan', 'icon' => 'bi-trophy', 'roles' => ['admin', 'kepala', 'ustadz']],
        ]
    ],
    [
        'title' => 'SISTEM',
        'items' => [
            ['file' => 'backup.php', 'label' => 'Cadangan Database', 'icon' => 'bi-database', 'roles' => ['admin', 'kepala', 'ustadz']],
            ['file' => 'pengaturan.php', 'label' => 'Pengaturan TPQ', 'icon' => 'bi-gear', 'roles' => ['admin', 'kepala', 'ustadz']],
        ]
    ]
];

$renderSidebarMenu = function() use ($sidebarSections, $role, $currentPage) {
    foreach ($sidebarSections as $section) {
        $visible = array_filter($section['items'], fn($it) => in_array($role, $it['roles'], true));
        if (empty($visible)) continue;
        echo '<div class="mb-4">';
        echo '<div class="text-uppercase fw-bold px-3 mb-2" style="font-size: 11px; letter-spacing: 0.08em; color: rgba(52, 211, 153, 0.9);">' . $section['title'] . '</div>';
        echo '<div class="nav flex-column gap-1">';
        foreach ($visible as $item) {
            $active = ($currentPage === $item['file']);
            $cls = $active ? 'sidebar-link-active' : 'sidebar-link-item';
            echo '<a href="' . $item['file'] . '" class="nav-link d-flex align-items-center gap-3 rounded-3 ' . $cls . '">';
            echo '<i class="bi ' . $item['icon'] . ' fs-6"></i>';
            echo '<span class="text-truncate">' . $item['label'] . '</span>';
            echo '</a>';
        }
        echo '</div></div>';
    }
};
?>
<!-- Desktop Static Scrollable Sidebar -->
<aside class="d-none d-lg-flex flex-column shrink-0 text-white border-end no-print" id="sidebar-wrapper" style="width: 276px; position: sticky; top: 0; height: 100vh; background-color: #0f172a; border-color: #1e293b !important;">
    <div class="d-flex align-items-center gap-3 px-4 py-3 border-bottom" style="border-color: #1e293b !important;">
        <div class="bg-white bg-opacity-10 rounded-3 p-1 d-flex align-items-center justify-content-center shrink-0" style="width: 42px; height: 42px;">
            <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo TPQ" style="max-width: 34px; max-height: 34px; object-fit: contain;" onerror="this.style.display='none';">
        </div>
        <div class="min-w-0">
            <div class="fw-bold text-white text-truncate" style="font-size: 14px; line-height: 1.25;"><?= htmlspecialchars($lembaga['nama']) ?></div>
            <small style="color: #34d399; font-size: 11px;">Sistem Rapor Digital</small>
        </div>
    </div>

    <div class="flex-grow-1 overflow-y-auto custom-scrollbar px-3 py-4">
        <?php $renderSidebarMenu(); ?>
    </div>

    <div class="p-3 border-top text-center" style="border-color: #1e293b !important; background-color: rgba(2, 6, 23, 0.55);">
        <div class="fw-bold text-white small text-truncate"><?= htmlspecialchars($lembaga['nama']) ?></div>
        <div class="text-secondary" style="font-size: 11px;"><?= htmlspecialchars($lembaga['kecamatan'] ?: 'Singosari') ?> · <?= htmlspecialchars($lembaga['kota'] ?: 'Kab. Malang') ?></div>
    </div>
</aside>

<!-- Mobile Offcanvas Drawer Sidebar -->
<div class="offcanvas offcanvas-start text-white no-print" tabindex="-1" id="mobileSidebar" style="width: 280px; background-color: #0f172a;">
    <div class="offcanvas-header border-bottom" style="border-color: #1e293b !important;">
        <div class="d-flex align-items-center gap-2 min-w-0">
            <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo" style="width: 36px; height: 36px; object-fit: contain;" class="rounded bg-white bg-opacity-10 p-1">
            <div class="min-w-0">
                <h6 class="offcanvas-title fw-bold text-white text-truncate mb-0"><?= htmlspecialchars($lembaga['nama']) ?></h6>
                <small style="color: #34d399; font-size: 11px;">Sistem Rapor Digital</small>
            </div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Tutup"></button>
    </div>
    <div class="offcanvas-body custom-scrollbar px-3 py-3">
        <?php $renderSidebarMenu(); ?>
    </div>
</div>`;
  },

  // Generate includes/header.php (Sticky Top Header with Logo, Institution Name & Logout)
  generateHeaderPHP(): string {
    return `<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top px-3 px-md-4 py-2 no-print" style="z-index: 1020; min-height: 58px;">
    <div class="container-fluid p-0 d-flex justify-content-between align-items-center gap-2">
        <div class="d-flex align-items-center gap-2 min-w-0">
            <button class="btn btn-light border d-lg-none px-2 py-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-label="Buka Menu">
                <i class="bi bi-list fs-5"></i>
            </button>
            <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo TPQ" class="rounded shrink-0" style="width: 34px; height: 34px; object-fit: contain;" onerror="this.style.display='none';">
            <div class="min-w-0 d-none d-sm-block">
                <div class="fw-bold text-dark text-truncate" style="font-size: 14px; line-height: 1.2;"><?= htmlspecialchars($lembaga['nama']) ?></div>
                <div class="text-muted text-truncate" style="font-size: 11.5px;"><?= htmlspecialchars($lembaga['yayasan']) ?></div>
            </div>
        </div>

        <div class="d-flex align-items-center gap-3 shrink-0">
            <div class="text-end d-none sm-block d-sm-block">
                <div class="fw-semibold text-dark text-truncate" style="max-width: 190px; font-size: 13.5px;"><?= htmlspecialchars($_SESSION['user']['nama'] ?? 'User') ?></div>
                <div class="text-muted text-capitalize" style="font-size: 11px;"><?= htmlspecialchars($_SESSION['user']['role'] ?? '') ?></div>
            </div>
            <a href="logout.php" class="btn btn-outline-danger btn-sm px-3 fw-semibold">
                <i class="bi bi-box-arrow-right me-1"></i><span class="d-none d-md-inline">Keluar</span>
            </a>
        </div>
    </div>
</nav>`;
  },

  // Generate CSS file for Bootstrap custom styling
  generateCSS(): string {
    return `/* Custom Modern Islamic Styles for RAPOR TPQ AL-ADZKIYAA’ */
:root {
  --tpq-primary: #059669;
  --tpq-secondary: #047857;
  --tpq-gold: #d97706;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
}

.text-success {
  color: var(--tpq-primary) !important;
}

.btn-success {
  background-color: var(--tpq-primary);
  border-color: var(--tpq-primary);
}

.btn-success:hover {
  background-color: var(--tpq-secondary);
  border-color: var(--tpq-secondary);
}

/* Sidebar Styling */
.sidebar-link-item {
  color: #e2e8f0 !important;
  font-size: 14.5px;
  font-weight: 500;
  padding: 0.65rem 0.95rem !important;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.sidebar-link-item:hover {
  background-color: #1e293b !important;
  color: #ffffff !important;
}

.sidebar-link-item i {
  color: #94a3b8;
}

.sidebar-link-active {
  background-color: #059669 !important;
  color: #ffffff !important;
  font-size: 14.5px;
  font-weight: 600;
  padding: 0.65rem 0.95rem !important;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.28);
}

.sidebar-link-active i {
  color: #ffffff !important;
}

/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(71, 85, 105, 0.6) rgba(15, 23, 42, 0.4);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.6);
  border-radius: 4px;
}

.hover-shadow {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

@media print {
  #sidebar-wrapper, .navbar, footer, .no-print, .offcanvas {
    display: none !important;
  }
  body, #page-content-wrapper {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}
`;
  },

  // Generate complete README and cPanel deployment guide
  generateHostingGuide(lembaga: LembagaProfile): string {
    return `# PANDUAN DEPLOY & INSTALASI RAPOR TPQ AL-ADZKIYAA’
## Paket Source Code PHP 8+ & Database MySQL Siap Pakai

Aplikasi ini siap diunggah ke berbagai layanan hosting (Rumahweb, Niagahoster, cPanel, DirectAdmin, VPS, XAMPP, Laragon, dll).

---

### A. PERSYARATAN SERVER:
1. **PHP**: Versi 8.0, 8.1, 8.2, atau 8.3
2. **Database**: MySQL 5.7+ / 8.0+ atau MariaDB 10.4+
3. **Ekstensi PHP Aktif**:
   - \`pdo\` dan \`pdo_mysql\`
   - \`mbstring\`
   - \`json\`
   - \`session\`

---

### B. LANGKAH INSTALASI DI CPANEL / RUMAH HOSTING:
1. **Ekstrak File ZIP**:
   - Buka **cPanel** > **File Manager**.
   - Masuk ke folder domain Anda (misalnya \`public_html\` atau folder addon domain/subdomain).
   - Unggah (\`Upload\`) file **Paket_Deploy_PHP_MySQL_RAPOR_TPQ_AL_ADZKIYAA.zip**.
   - Klik kanan file ZIP tersebut lalu pilih **Extract**.
   - Pastikan folder \`assets/img/logo-tpq.png\` ikut terekstrak dengan benar.

2. **Buat Database MySQL**:
   - Di cPanel, buka menu **MySQL® Databases**.
   - Buat database baru, contoh: \`cpaneluser_tpq\`.
   - Buat pengguna baru, contoh: \`cpaneluser_admin\` dengan password yang kuat.
   - Tambahkan pengguna tersebut ke database dengan memberikan centang **ALL PRIVILEGES**.

3. **Impor File SQL**:
   - Buka menu **phpMyAdmin** di cPanel.
   - Pilih database yang baru Anda buat di panel sebelah kiri.
   - Klik tab **Import** di bagian atas.
   - Pilih file \`database.sql\` yang ada di dalam paket ini.
   - Klik tombol **Import / Go**. Seluruh 23 tabel dan data awal TPQ Al-Adzkiyaa’ akan langsung terpasang.

4. **Konfigurasi Koneksi Database**:
   - Buka file \`config/database.php\` menggunakan Text Editor di File Manager cPanel.
   - Sesuaikan parameter berikut:
     \`\`\`php
     define('DB_HOST', 'localhost');
     define('DB_NAME', 'cpaneluser_tpq');
     define('DB_USER', 'cpaneluser_admin');
     define('DB_PASS', 'PasswordDatabaseAnda');
     \`\`\`
   - Simpan perubahan (\`Save Changes\`).

5. **Selesai & Login**:
   - Buka domain website Anda di browser.
   - Login dengan akun awal:
     - **Administrator**: \`admin\` / \`admin123\`
     - **Kepala TPQ**: \`kepala\` / \`password123\`
     - **Ustadz**: \`ustadz1\` / \`password123\`
     - **Santri**: \`santri1\` / \`password123\`
   - Ganti password admin di menu **Pengaturan TPQ** setelah login.

---

### C. IDENTITAS DEFAULT & KUSTOMISASI:
- Nama Lembaga: ${lembaga.nama}
- Yayasan: ${lembaga.yayasan}
- NSTPQ: ${lembaga.nstpq || lembaga.nspq || '-'}
- Alamat: ${lembaga.alamat}
- Kepala TPQ: ${lembaga.kepalaTpq}
- Logo & Profil Lembaga dapat diubah langsung dari menu **Pengaturan TPQ**.

---
*${lembaga.footnote}*
`;
  },

  // 7. santri.php (Full CRUD + Search + Filter)
  generateSantriPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $nis = trim($_POST['nis'] ?? '');
    $nama = trim($_POST['nama_lengkap'] ?? '');
    $jk = $_POST['jk'] ?? 'L';
    $kelas_id = !empty($_POST['kelas_id']) ? (int)$_POST['kelas_id'] : null;
    $jilid_id = !empty($_POST['jilid_id']) ? (int)$_POST['jilid_id'] : null;
    $ortu = trim($_POST['nama_ayah'] ?? '');
    $hp = trim($_POST['no_hp_ortu'] ?? '');
    $alamat = trim($_POST['alamat'] ?? '');

    if ($nis && $nama) {
        try {
            $stmt = $pdo->prepare("INSERT INTO santri (nis, nama_lengkap, jk, kelas_id, jilid_id, nama_ayah, no_hp_ortu, alamat, status, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)");
            $stmt->execute([$nis, $nama, $jk, $kelas_id, $jilid_id, $ortu, $hp, $alamat, $nis]);
            $newSantriId = $pdo->lastInsertId();
            // Buat akun login santri default (username = NIS, password = password123)
            $insUser = $pdo->prepare("INSERT IGNORE INTO users (username, password, nama, role, ref_id, is_active) VALUES (?, ?, ?, 'santri', ?, 1)");
            $insUser->execute([$nis, md5('password123'), $nama, (string)$newSantriId]);
            $msg = "Santri berhasil ditambahkan! Akun login santri: username " . $nis . " / password123";
        } catch (PDOException $e) {
            $err = "Gagal menambah santri (NIS mungkin sudah terdaftar): " . $e->getMessage();
        }
    } else {
        $err = "NIS dan Nama Lengkap wajib diisi.";
    }
}

if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    $stmt = $pdo->prepare("DELETE FROM santri WHERE id = ?");
    $stmt->execute([$delId]);
    $msg = "Santri berhasil dihapus.";
}

$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$jilidList = $pdo->query("SELECT * FROM jilid ORDER BY urutan ASC")->fetchAll();

$kelasFilter = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : 0;
$qFilter = trim($_GET['q'] ?? '');

$sql = "SELECT s.*, k.nama_kelas, j.nama AS jilid_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN jilid j ON s.jilid_id = j.id WHERE 1=1";
$params = [];
if ($kelasFilter > 0) {
    $sql .= " AND s.kelas_id = ?";
    $params[] = $kelasFilter;
}
if ($qFilter !== '') {
    $sql .= " AND (s.nama_lengkap LIKE ? OR s.nis LIKE ?)";
    $params[] = '%' . $qFilter . '%';
    $params[] = '%' . $qFilter . '%';
}
$sql .= " ORDER BY s.nama_lengkap ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$santriList = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Santri - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Kelola Data Santri</h3>
                    <p class="text-muted small mb-0">Total: <?= count($santriList) ?> Santri Terdata</p>
                </div>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTambah">
                    <i class="bi bi-person-plus me-1"></i> Tambah Santri Baru
                </button>
            </div>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm p-3 mb-3 rounded-3">
                <form method="GET" action="santri.php" class="row g-2 align-items-center small">
                    <div class="col-md-4">
                        <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                            <option value="0">-- Semua Kelas / Halaqoh --</option>
                            <?php foreach ($kelasList as $k): ?>
                                <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasFilter ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-5">
                        <div class="input-group input-group-sm">
                            <input type="text" name="q" value="<?= htmlspecialchars($qFilter) ?>" class="form-control" placeholder="Cari nama santri atau NIS...">
                            <button class="btn btn-success" type="submit"><i class="bi bi-search"></i> Cari</button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3">No</th>
                                    <th>NIS</th>
                                    <th>Nama Lengkap</th>
                                    <th>JK</th>
                                    <th>Kelas / Halaqoh</th>
                                    <th>Jilid Aktif</th>
                                    <th>No HP Ortu</th>
                                    <th>Status</th>
                                    <th class="text-center pe-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($santriList)): ?>
                                    <tr><td colspan="9" class="text-center py-4 text-muted">Belum ada data santri.</td></tr>
                                <?php else: foreach ($santriList as $idx => $s): ?>
                                    <tr>
                                        <td class="ps-3"><?= $idx + 1 ?></td>
                                        <td class="fw-semibold font-monospace"><?= htmlspecialchars($s['nis']) ?></td>
                                        <td class="fw-bold text-dark"><?= htmlspecialchars($s['nama_lengkap']) ?></td>
                                        <td><?= $s['jk'] === 'L' ? '<span class="badge bg-primary">L</span>' : '<span class="badge bg-danger">P</span>' ?></td>
                                        <td><?= htmlspecialchars($s['nama_kelas'] ?? 'Belum Ditentukan') ?></td>
                                        <td><span class="badge bg-success-subtle text-success"><?= htmlspecialchars($s['jilid_nama'] ?? 'Dasar') ?></span></td>
                                        <td><?= htmlspecialchars($s['no_hp_ortu'] ?? '-') ?></td>
                                        <td><span class="badge bg-success"><?= strtoupper($s['status']) ?></span></td>
                                        <td class="text-center pe-3 text-nowrap">
                                            <a href="profil_santri.php?santri_id=<?= $s['id'] ?>" class="btn btn-outline-secondary btn-sm py-0 px-2" title="Profil"><i class="bi bi-person"></i></a>
                                            <a href="rapor.php?santri_id=<?= $s['id'] ?>" target="_blank" class="btn btn-outline-success btn-sm py-0 px-2" title="Cetak Rapor"><i class="bi bi-printer"></i></a>
                                            <a href="santri.php?delete_id=<?= $s['id'] ?>" onclick="return confirm('Hapus santri ini?')" class="btn btn-outline-danger btn-sm py-0 px-2" title="Hapus"><i class="bi bi-trash"></i></a>
                                        </td>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>

<!-- Modal Tambah -->
<div class="modal fade" id="modalTambah" tabindex="-1">
    <div class="modal-dialog">
        <form method="POST" action="santri.php" class="modal-content">
            <input type="hidden" name="action" value="create">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Tambah Data Santri</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body small">
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nomor Induk Santri (NIS) *</label>
                    <input type="text" name="nis" class="form-control form-control-sm" required placeholder="Contoh: 2025004">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nama Lengkap Santri *</label>
                    <input type="text" name="nama_lengkap" class="form-control form-control-sm" required>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Jenis Kelamin</label>
                    <select name="jk" class="form-select form-select-sm">
                        <option value="L">Laki-laki (Putra)</option>
                        <option value="P">Perempuan (Putri)</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Kelas / Halaqoh</label>
                    <select name="kelas_id" class="form-select form-select-sm">
                        <option value="">-- Pilih Kelas --</option>
                        <?php foreach ($kelasList as $k): ?>
                            <option value="<?= $k['id'] ?>"><?= htmlspecialchars($k['nama_kelas']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Tingkat Jilid Saat Ini</label>
                    <select name="jilid_id" class="form-select form-select-sm">
                        <option value="">-- Pilih Jilid --</option>
                        <?php foreach ($jilidList as $j): ?>
                            <option value="<?= $j['id'] ?>"><?= htmlspecialchars($j['nama']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nama Orang Tua (Ayah)</label>
                    <input type="text" name="nama_ayah" class="form-control form-control-sm">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">No. HP / WA Wali Santri</label>
                    <input type="text" name="no_hp_ortu" class="form-control form-control-sm" placeholder="0812-xxxx-xxxx">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Alamat Lengkap</label>
                    <textarea name="alamat" class="form-control form-control-sm" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-success btn-sm">Simpan Santri</button>
            </div>
        </form>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 8. isi_nilai.php (Input & Save Nilai + Kehadiran + Catatan Wali)
  generateIsiNilaiPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$err = '';
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: ['id' => 1, 'tahun' => '2025/2026', 'semester_aktif' => 'Ganjil'];
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$komponenList = $pdo->query("SELECT * FROM komponen_penilaian WHERE is_aktif = 1 ORDER BY urutan ASC")->fetchAll();

$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nilai'])) {
    $scores = $_POST['nilai'];
    $descData = $_POST['desc'] ?? [];
    $tahunId = (int)($_POST['tahun_id'] ?? $tahunAktif['id']);
    $sem = $_POST['semester'] ?? $tahunAktif['semester_aktif'];

    try {
        $pdo->beginTransaction();
        $upsertStmt = $pdo->prepare("INSERT INTO nilai (santri_id, tahun_id, semester, komponen_id, nilai_angka) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nilai_angka = VALUES(nilai_angka)");
        foreach ($scores as $sId => $comps) {
            foreach ($comps as $cId => $val) {
                if ($val !== '' && is_numeric($val)) {
                    $num = max(0, min(100, (float)$val));
                    $upsertStmt->execute([(int)$sId, $tahunId, $sem, (int)$cId, $num]);
                }
            }
        }

        $upsertDesc = $pdo->prepare("INSERT INTO deskripsi_nilai (santri_id, tahun_id, semester, sakit, izin, alpa, catatan_wali, keputusan) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE sakit = VALUES(sakit), izin = VALUES(izin), alpa = VALUES(alpa), catatan_wali = VALUES(catatan_wali), keputusan = VALUES(keputusan)");
        foreach ($descData as $sId => $d) {
            $upsertDesc->execute([
                (int)$sId,
                $tahunId,
                $sem,
                (int)($d['sakit'] ?? 0),
                (int)($d['izin'] ?? 0),
                (int)($d['alpa'] ?? 0),
                trim($d['catatan_wali'] ?? ''),
                trim($d['keputusan'] ?? 'Lulus Naik Jilid / Tingkat Selanjutnya')
            ]);
        }

        $pdo->commit();
        $msg = "Nilai dan kehadiran santri berhasil disimpan ke database!";
    } catch (PDOException $e) {
        $pdo->rollBack();
        $err = "Gagal menyimpan nilai: " . $e->getMessage();
    }
}

$stmtSantri = $pdo->prepare("SELECT * FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
$stmtSantri->execute([$kelasId]);
$santriInKelas = $stmtSantri->fetchAll();

$stmtNilai = $pdo->prepare("SELECT santri_id, komponen_id, nilai_angka FROM nilai WHERE tahun_id = ? AND semester = ?");
$stmtNilai->execute([$tahunAktif['id'], $tahunAktif['semester_aktif']]);
$existingScores = [];
foreach ($stmtNilai->fetchAll() as $row) {
    $existingScores[$row['santri_id']][$row['komponen_id']] = $row['nilai_angka'];
}

$stmtDesc = $pdo->prepare("SELECT * FROM deskripsi_nilai WHERE tahun_id = ? AND semester = ?");
$stmtDesc->execute([$tahunAktif['id'], $tahunAktif['semester_aktif']]);
$existingDesc = [];
foreach ($stmtDesc->fetchAll() as $d) {
    $existingDesc[$d['santri_id']] = $d;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Isi Nilai Santri - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <h3 class="fw-bold mb-1">Pengisian Nilai &amp; Absensi Santri</h3>
            <p class="text-muted small">Tahun Pelajaran: <?= htmlspecialchars($tahunAktif['tahun']) ?> (Semester <?= htmlspecialchars($tahunAktif['semester_aktif']) ?>)</p>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm p-3 mb-4 rounded-3">
                <form method="GET" action="isi_nilai.php" class="row g-2 align-items-center">
                    <div class="col-auto"><label class="small fw-semibold">Pilih Halaqoh / Kelas:</label></div>
                    <div class="col-auto">
                        <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                            <?php foreach ($kelasList as $k): ?>
                                <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasId ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </form>
            </div>

            <form method="POST" action="isi_nilai.php?kelas_id=<?= $kelasId ?>" class="card border-0 shadow-sm rounded-3">
                <input type="hidden" name="tahun_id" value="<?= $tahunAktif['id'] ?>">
                <input type="hidden" name="semester" value="<?= htmlspecialchars($tahunAktif['semester_aktif']) ?>">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-bordered align-middle mb-0 small">
                            <thead class="table-light text-center">
                                <tr>
                                    <th style="width: 38px;">No</th>
                                    <th style="width: 85px;">NIS</th>
                                    <th style="min-width: 170px;" class="text-start">Nama Santri</th>
                                    <?php foreach ($komponenList as $c): ?>
                                        <th style="min-width: 78px;" title="<?= htmlspecialchars($c['nama']) ?> (<?= $c['bobot'] ?>%)">
                                            <?= htmlspecialchars(mb_substr($c['nama'], 0, 11)) ?><br><span class="text-muted fw-normal">(<?= $c['bobot'] ?>%)</span>
                                        </th>
                                    <?php endforeach; ?>
                                    <th style="width: 55px;" title="Sakit">S</th>
                                    <th style="width: 55px;" title="Izin">I</th>
                                    <th style="width: 55px;" title="Alpa">A</th>
                                    <th style="min-width: 160px;">Catatan Wali</th>
                                    <th style="min-width: 170px;">Keputusan Rapor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($santriInKelas)): ?>
                                    <tr><td colspan="<?= 8 + count($komponenList) ?>" class="text-center py-4 text-muted">Belum ada santri terdaftar di kelas ini.</td></tr>
                                <?php else: foreach ($santriInKelas as $idx => $s):
                                    $desc = $existingDesc[$s['id']] ?? ['sakit' => 0, 'izin' => 0, 'alpa' => 0, 'catatan_wali' => '', 'keputusan' => 'Lulus Naik Jilid / Tingkat Selanjutnya'];
                                ?>
                                    <tr>
                                        <td class="text-center"><?= $idx + 1 ?></td>
                                        <td class="font-monospace text-center"><?= htmlspecialchars($s['nis']) ?></td>
                                        <td class="fw-semibold"><?= htmlspecialchars($s['nama_lengkap']) ?></td>
                                        <?php foreach ($komponenList as $c):
                                            $val = $existingScores[$s['id']][$c['id']] ?? '';
                                        ?>
                                            <td class="p-1">
                                                <input type="number" step="0.1" min="0" max="100" name="nilai[<?= $s['id'] ?>][<?= $c['id'] ?>]" value="<?= htmlspecialchars((string)$val) ?>" class="form-control form-control-sm text-center">
                                            </td>
                                        <?php endforeach; ?>
                                        <td class="p-1"><input type="number" min="0" name="desc[<?= $s['id'] ?>][sakit]" value="<?= (int)$desc['sakit'] ?>" class="form-control form-control-sm text-center"></td>
                                        <td class="p-1"><input type="number" min="0" name="desc[<?= $s['id'] ?>][izin]" value="<?= (int)$desc['izin'] ?>" class="form-control form-control-sm text-center"></td>
                                        <td class="p-1"><input type="number" min="0" name="desc[<?= $s['id'] ?>][alpa]" value="<?= (int)$desc['alpa'] ?>" class="form-control form-control-sm text-center"></td>
                                        <td class="p-1"><input type="text" name="desc[<?= $s['id'] ?>][catatan_wali]" value="<?= htmlspecialchars($desc['catatan_wali'] ?? '') ?>" class="form-control form-control-sm" placeholder="Catatan pembinaan..."></td>
                                        <td class="p-1"><input type="text" name="desc[<?= $s['id'] ?>][keputusan]" value="<?= htmlspecialchars($desc['keputusan'] ?? '') ?>" class="form-control form-control-sm" placeholder="Keputusan kenaikan..."></td>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                <?php if (!empty($santriInKelas)): ?>
                <div class="card-footer bg-white text-end p-3">
                    <button type="submit" class="btn btn-success"><i class="bi bi-save me-1"></i> Simpan Semua Nilai &amp; Kehadiran</button>
                </div>
                <?php endif; ?>
            </form>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 9. rapor.php (Public QR Validation + Single Print + Bulk Print + Weighted Score + Logo + NSTPQ + Strict A4 Containment)
  generateRaporPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';

// 1. Endpoint Publik Validasi QR Code (?verify=rapor&nis=...)
if (isset($_GET['verify']) && $_GET['verify'] === 'rapor') {
    $nis = trim($_GET['nis'] ?? '');
    $thnId = isset($_GET['tahun_id']) ? (int)$_GET['tahun_id'] : 0;
    $sem = trim($_GET['semester'] ?? 'Ganjil');

    $stmtV = $pdo->prepare("SELECT s.*, k.nama_kelas, j.nama AS jilid_nama, m.nama AS metode_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN jilid j ON s.jilid_id = j.id LEFT JOIN metode m ON s.metode_id = m.id WHERE s.nis = ? LIMIT 1");
    $stmtV->execute([$nis]);
    $vSantri = $stmtV->fetch();

    $tahunRow = $thnId > 0
        ? $pdo->query("SELECT * FROM tahun_pelajaran WHERE id = " . $thnId)->fetch()
        : $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validasi Keaslian Rapor - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body class="bg-light d-flex align-items-center min-vh-100 p-3">
<div class="container" style="max-width: 540px;">
    <div class="card border-0 shadow rounded-4 overflow-hidden">
        <div class="bg-success text-white text-center p-4">
            <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo TPQ" class="bg-white rounded-3 p-1 mb-2" style="width: 64px; height: 64px; object-fit: contain;" onerror="this.style.display='none';">
            <h5 class="fw-bold mb-0"><?= htmlspecialchars($lembaga['nama']) ?></h5>
            <small class="text-white-50">NSTPQ: <?= htmlspecialchars($lembaga['nstpq']) ?></small>
        </div>
        <div class="card-body p-4">
            <?php if ($vSantri):
                $stmtVN = $pdo->prepare("SELECT c.bobot, n.nilai_angka FROM komponen_penilaian c LEFT JOIN nilai n ON c.id = n.komponen_id AND n.santri_id = ? AND n.tahun_id = ? AND n.semester = ? WHERE c.is_aktif = 1");
                $stmtVN->execute([$vSantri['id'], $tahunRow['id'] ?? 1, $sem]);
                $totBobotScore = 0; $totBobot = 0;
                foreach ($stmtVN->fetchAll() as $nr) {
                    if ($nr['nilai_angka'] !== null) {
                        $totBobotScore += ((float)$nr['nilai_angka'] * ((int)$nr['bobot'] / 100));
                    }
                    $totBobot += (int)$nr['bobot'];
                }
                $avg = $totBobot > 0 ? round($totBobotScore / ($totBobot / 100), 1) : 0;
                $pred = hitung_predikat($avg);
            ?>
                <div class="alert alert-success d-flex align-items-center gap-2 small fw-semibold mb-3">
                    <i class="bi bi-patch-check-fill fs-5"></i>
                    <span>DOKUMEN RAPOR TERVALIDASI ASLI DAN TERDAFTAR DI SISTEM</span>
                </div>
                <table class="table table-sm table-borderless small mb-0">
                    <tr><td class="text-muted" style="width: 40%;">Nama Santri</td><td class="fw-bold">: <?= htmlspecialchars($vSantri['nama_lengkap']) ?></td></tr>
                    <tr><td class="text-muted">NIS</td><td class="font-monospace">: <?= htmlspecialchars($vSantri['nis']) ?></td></tr>
                    <tr><td class="text-muted">Kelas / Halaqoh</td><td>: <?= htmlspecialchars($vSantri['nama_kelas'] ?? '-') ?></td></tr>
                    <tr><td class="text-muted">Metode / Jilid</td><td>: <?= htmlspecialchars(($vSantri['metode_nama'] ?? '-') . ' - ' . ($vSantri['jilid_nama'] ?? '-')) ?></td></tr>
                    <tr><td class="text-muted">Tahun / Semester</td><td>: <?= htmlspecialchars($tahunRow['tahun'] ?? '-') ?> (<?= htmlspecialchars($sem) ?>)</td></tr>
                    <tr><td class="text-muted">Rata-rata Nilai</td><td class="fw-bold text-success">: <?= $avg ?> (Predikat <?= $pred['predikat'] ?> - <?= $pred['label'] ?>)</td></tr>
                </table>
            <?php else: ?>
                <div class="alert alert-danger d-flex align-items-center gap-2 small fw-semibold mb-0">
                    <i class="bi bi-x-octagon-fill fs-5"></i>
                    <span>Data validasi rapor dengan NIS tersebut tidak ditemukan di database.</span>
                </div>
            <?php endif; ?>
        </div>
        <div class="card-footer bg-white text-center small text-muted py-2">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </div>
    </div>
</div>
</body>
</html>
<?php exit(); }

// 2. Autentikasi untuk preview / cetak rapor
check_auth(['admin', 'kepala', 'ustadz', 'santri']);
$role = $_SESSION['user']['role'];

$tahunList = $pdo->query("SELECT * FROM tahun_pelajaran ORDER BY tahun DESC")->fetchAll();
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: ['id' => 1, 'tahun' => '2025/2026', 'semester_aktif' => 'Ganjil', 'tgl_rapor_ganjil' => date('Y-m-d'), 'tgl_rapor_genap' => date('Y-m-d')];

$tahunId = isset($_GET['tahun_id']) ? (int)$_GET['tahun_id'] : (int)$tahunAktif['id'];
$semester = isset($_GET['semester']) && in_array($_GET['semester'], ['Ganjil', 'Genap'], true) ? $_GET['semester'] : $tahunAktif['semester_aktif'];
foreach ($tahunList as $tl) {
    if ((int)$tl['id'] === $tahunId) { $tahunAktif = $tl; break; }
}

$bobotList = $pdo->query("SELECT * FROM bobot_penilaian ORDER BY min_score DESC")->fetchAll();
$santriId = isset($_GET['santri_id']) ? (int)$_GET['santri_id'] : 0;
$isMassal = isset($_GET['massal']) && $_GET['massal'] == '1' && $role !== 'santri';
$massalKelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : 0;

if ($role === 'santri') {
    $santriId = find_santri_id_for_user($pdo, $_SESSION['user']);
    $isMassal = false;
}

$targetIds = [];
if ($isMassal) {
    if ($massalKelasId > 0) {
        $st = $pdo->prepare("SELECT id FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
        $st->execute([$massalKelasId]);
    } else {
        $st = $pdo->query("SELECT id FROM santri WHERE status = 'aktif' ORDER BY nama_lengkap ASC");
    }
    $targetIds = array_map('intval', $st->fetchAll(PDO::FETCH_COLUMN));
} elseif ($santriId > 0) {
    $targetIds = [$santriId];
}

// Helper hitung rapor lengkap per santri
$buildRaporData = function($sid) use ($pdo, $tahunAktif, $semester, $bobotList) {
    $stmtSantri = $pdo->prepare("SELECT s.*, k.nama_kelas, u.nama AS ustadz_nama, j.nama AS jilid_nama, m.nama AS metode_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id LEFT JOIN jilid j ON s.jilid_id = j.id LEFT JOIN metode m ON s.metode_id = m.id WHERE s.id = ?");
    $stmtSantri->execute([$sid]);
    $santri = $stmtSantri->fetch();
    if (!$santri) return null;

    $stmtNilai = $pdo->prepare("SELECT c.nama, c.bobot, n.nilai_angka, n.catatan FROM komponen_penilaian c LEFT JOIN nilai n ON c.id = n.komponen_id AND n.santri_id = ? AND n.tahun_id = ? AND n.semester = ? WHERE c.is_aktif = 1 AND c.show_in_rapor = 1 ORDER BY c.urutan ASC");
    $stmtNilai->execute([$sid, $tahunAktif['id'], $semester]);
    $nilaiRows = $stmtNilai->fetchAll();

    $totalBobotScore = 0;
    $totalBobot = 0;
    $hasScore = false;
    foreach ($nilaiRows as $nr) {
        if ($nr['nilai_angka'] !== null) {
            $hasScore = true;
            $totalBobotScore += ((float)$nr['nilai_angka'] * ((int)$nr['bobot'] / 100));
        }
        $totalBobot += (int)$nr['bobot'];
    }
    $rataRata = ($totalBobot > 0 && $hasScore) ? round($totalBobotScore / ($totalBobot / 100), 1) : 0;
    $predInfo = hitung_predikat($rataRata, $bobotList);

    // Hitung ranking berbobot akurat dalam kelas
    $ranking = 1;
    $totalInClass = 1;
    if (!empty($santri['kelas_id'])) {
        $stmtPeers = $pdo->prepare("SELECT id FROM santri WHERE kelas_id = ? AND status = 'aktif'");
        $stmtPeers->execute([$santri['kelas_id']]);
        $peerIds = $stmtPeers->fetchAll(PDO::FETCH_COLUMN);
        $totalInClass = max(1, count($peerIds));

        $peerScores = [];
        $stmtPVal = $pdo->prepare("SELECT c.bobot, n.nilai_angka FROM komponen_penilaian c LEFT JOIN nilai n ON c.id = n.komponen_id AND n.santri_id = ? AND n.tahun_id = ? AND n.semester = ? WHERE c.is_aktif = 1");
        foreach ($peerIds as $pid) {
            $stmtPVal->execute([$pid, $tahunAktif['id'], $semester]);
            $pBobScore = 0; $pTotBob = 0;
            foreach ($stmtPVal->fetchAll() as $pRow) {
                if ($pRow['nilai_angka'] !== null) $pBobScore += ((float)$pRow['nilai_angka'] * ((int)$pRow['bobot'] / 100));
                $pTotBob += (int)$pRow['bobot'];
            }
            $peerScores[(int)$pid] = $pTotBob > 0 ? round($pBobScore / ($pTotBob / 100), 2) : 0;
        }
        arsort($peerScores);
        $pos = 1;
        foreach ($peerScores as $pid => $sc) {
            if ((int)$pid === (int)$sid) { $ranking = $pos; break; }
            $pos++;
        }
    }

    $stmtDesc = $pdo->prepare("SELECT * FROM deskripsi_nilai WHERE santri_id = ? AND tahun_id = ? AND semester = ? LIMIT 1");
    $stmtDesc->execute([$sid, $tahunAktif['id'], $semester]);
    $desc = $stmtDesc->fetch() ?: [
        'sakit' => 0, 'izin' => 0, 'alpa' => 0,
        'catatan_wali' => 'Terus semangat dalam murojaah hafalan dan perbaikan bacaan Al-Quran.',
        'catatan_kepala' => 'Barakallah, semoga menjadi anak sholih/sholihah yang istiqomah.',
        'keputusan' => 'Lulus Naik Jilid / Tingkat Selanjutnya'
    ];

    return [
        'santri' => $santri,
        'nilaiRows' => $nilaiRows,
        'rataRata' => $rataRata,
        'predikat' => $predInfo['predikat'],
        'keterangan' => $predInfo['label'],
        'ranking' => $ranking,
        'totalInClass' => $totalInClass,
        'desc' => $desc
    ];
};

$raporSheets = [];
foreach ($targetIds as $tid) {
    $data = $buildRaporData($tid);
    if ($data) $raporSheets[] = $data;
}

if (!empty($raporSheets)) {
    $tglRaw = ($semester === 'Genap') ? ($tahunAktif['tgl_rapor_genap'] ?? date('Y-m-d')) : ($tahunAktif['tgl_rapor_ganjil'] ?? date('Y-m-d'));
    $tglCetak = format_tgl_indo($tglRaw);
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $dir = rtrim(dirname($_SERVER['PHP_SELF']), '/\\\\');
    $baseVerifyUrl = $scheme . '://' . $host . $dir . '/rapor.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Rapor Santri - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 12.5px; color: #0f172a; background: #f1f5f9; }
        .rapor-sheet {
            max-width: 210mm;
            background: #ffffff;
            margin: 0 auto 20px auto;
            padding: 10mm 12mm;
            border-radius: 6px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            box-sizing: border-box;
            overflow: hidden;
        }
        .border-double-kop { border-bottom: 3px double #059669; }
        .rapor-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .rapor-table th, .rapor-table td { word-break: break-word; overflow-wrap: break-word; vertical-align: middle; }
        .rapor-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #fff; break-inside: avoid; page-break-inside: avoid; word-break: break-word; overflow-wrap: break-word; }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        @media print {
            @page { size: A4 portrait; margin: 6mm 8mm; }
            .no-print { display: none !important; }
            body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }
            .rapor-sheet { box-shadow: none !important; margin: 0 auto !important; padding: 0 !important; max-width: 194mm !important; border-radius: 0 !important; overflow: hidden !important; }
            .page-break { page-break-after: always; break-after: page; }
            .rapor-table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
    </style>
</head>
<body class="p-3 p-md-4">
<div class="no-print mb-4 text-center d-flex flex-wrap justify-content-center gap-2">
    <button onclick="window.print()" class="btn btn-success btn-sm px-4 fw-semibold"><i class="bi bi-printer me-1"></i> Cetak Dokumen Rapor (PDF/Printer)</button>
    <?php if ($role !== 'santri'): ?>
        <a href="rapor.php" class="btn btn-secondary btn-sm px-3">Kembali ke Daftar Santri</a>
    <?php else: ?>
        <a href="profil_santri.php" class="btn btn-secondary btn-sm px-3">Kembali ke Profil Saya</a>
    <?php endif; ?>
</div>

<?php foreach ($raporSheets as $sheetIdx => $sheet):
    $santri = $sheet['santri'];
    $verifyUrl = $baseVerifyUrl . '?verify=rapor&nis=' . urlencode($santri['nis']) . '&tahun_id=' . $tahunAktif['id'] . '&semester=' . urlencode($semester);
    $qrDivId = 'qr_' . $sheetIdx . '_' . (int)$santri['id'];
    $isLast = ($sheetIdx === count($raporSheets) - 1);
?>
<div class="rapor-sheet <?= !$isLast ? 'page-break' : '' ?>">
    <!-- KOP LEMBAGA -->
    <div class="d-flex align-items-center justify-content-between gap-3 pb-2 mb-3 border-double-kop">
        <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo TPQ" style="width: 64px; height: 64px; object-fit: contain;" onerror="this.style.display='none';">
        <div class="text-center flex-grow-1">
            <div class="fw-bold text-uppercase text-secondary" style="font-size: 11px; letter-spacing: 0.5px;"><?= htmlspecialchars($lembaga['yayasan']) ?></div>
            <div class="fw-bold text-uppercase text-success" style="font-size: 19px; line-height: 1.15;"><?= htmlspecialchars($lembaga['nama']) ?></div>
            <div style="font-size: 10.5px;" class="text-muted">
                NSTPQ: <?= htmlspecialchars($lembaga['nstpq']) ?> · <?= htmlspecialchars($lembaga['alamat']) ?>, <?= htmlspecialchars($lembaga['kota']) ?> · Telp: <?= htmlspecialchars($lembaga['telepon']) ?>
            </div>
        </div>
        <div style="width: 64px;"></div>
    </div>

    <h6 class="text-center fw-bold text-uppercase mb-3" style="letter-spacing: 1px;">LAPORAN HASIL BELAJAR SANTRI (RAPOR)</h6>

    <!-- Identitas -->
    <div class="row g-2 mb-3 small">
        <div class="col-6">
            <table class="table table-sm table-borderless mb-0" style="font-size: 12px;">
                <tr><td style="width: 42%;">Nama Santri</td><td>: <strong><?= htmlspecialchars($santri['nama_lengkap']) ?></strong></td></tr>
                <tr><td>Nomor Induk (NIS)</td><td>: <?= htmlspecialchars($santri['nis']) ?></td></tr>
                <tr><td>Metode / Jilid</td><td>: <?= htmlspecialchars($santri['metode_nama'] ?? 'Bilqolam') ?> - <?= htmlspecialchars($santri['jilid_nama'] ?? 'Dasar') ?></td></tr>
            </table>
        </div>
        <div class="col-6">
            <table class="table table-sm table-borderless mb-0" style="font-size: 12px;">
                <tr><td style="width: 42%;">Kelas / Halaqoh</td><td>: <?= htmlspecialchars($santri['nama_kelas'] ?? 'Umum') ?></td></tr>
                <tr><td>Wali Pengampu</td><td>: <?= htmlspecialchars($santri['ustadz_nama'] ?? '-') ?></td></tr>
                <tr><td>Semester / Tahun</td><td>: <?= htmlspecialchars($semester) ?> (<?= htmlspecialchars($tahunAktif['tahun']) ?>)</td></tr>
            </table>
        </div>
    </div>

    <!-- A. Tabel Nilai -->
    <div class="fw-bold text-success mb-1 small">A. CAPAIAN KOMPONEN PENILAIAN</div>
    <table class="table table-bordered table-sm rapor-table mb-3" style="font-size: 12px;">
        <thead class="table-light text-center">
            <tr>
                <th style="width: 7%;">No</th>
                <th style="width: 38%;" class="text-start">Komponen Penilaian</th>
                <th style="width: 11%;">Bobot</th>
                <th style="width: 11%;">Nilai</th>
                <th style="width: 11%;">Predikat</th>
                <th style="width: 22%;" class="text-start">Keterangan / Catatan</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($sheet['nilaiRows'] as $i => $row):
                $hasV = ($row['nilai_angka'] !== null);
                $score = $hasV ? (float)$row['nilai_angka'] : 0;
                $pRow = hitung_predikat($score, $bobotList);
            ?>
                <tr>
                    <td class="text-center"><?= $i + 1 ?></td>
                    <td><?= htmlspecialchars($row['nama']) ?></td>
                    <td class="text-center"><?= $row['bobot'] ?>%</td>
                    <td class="text-center fw-bold"><?= $hasV ? $row['nilai_angka'] : '-' ?></td>
                    <td class="text-center fw-bold"><?= $hasV ? $pRow['predikat'] : '-' ?></td>
                    <td class="text-muted" style="font-size: 11px;"><?= htmlspecialchars($row['catatan'] ?: ($hasV ? $pRow['label'] : 'Belum dinilai')) ?></td>
                </tr>
            <?php endforeach; ?>
            <tr class="table-light fw-bold">
                <td colspan="3" class="text-center">RATA-RATA NILAI AKHIR</td>
                <td class="text-center text-success fs-6"><?= $sheet['rataRata'] ?></td>
                <td class="text-center text-success fs-6"><?= $sheet['predikat'] ?></td>
                <td class="text-success" style="font-size: 11.5px; line-height: 1.3;">
                    <div><?= htmlspecialchars($sheet['keterangan']) ?></div>
                    <div class="text-dark fw-semibold">(Peringkat <?= $sheet['ranking'] ?>/<?= $sheet['totalInClass'] ?>)</div>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- B. Kehadiran, Keputusan & Catatan -->
    <div class="fw-bold text-success mb-1 small">B. KEHADIRAN, KEPUTUSAN &amp; CATATAN</div>
    <div class="row g-2 mb-3 avoid-break" style="font-size: 11.5px;">
        <div class="col-6">
            <div class="rapor-box h-100">
                <div class="fw-bold text-success mb-1">Kehadiran (Absensi) Semester Ini:</div>
                <div>Sakit: <?= (int)$sheet['desc']['sakit'] ?> hari &nbsp;|&nbsp; Izin: <?= (int)$sheet['desc']['izin'] ?> hari &nbsp;|&nbsp; Alpa: <?= (int)$sheet['desc']['alpa'] ?> hari</div>
                <div class="mt-2">
                    <strong>Keputusan:</strong>
                    <div class="text-success fw-bold mt-0.5"><?= htmlspecialchars($sheet['desc']['keputusan'] ?: 'Lulus Naik Jilid / Tingkat Selanjutnya') ?></div>
                </div>
            </div>
        </div>
        <div class="col-6">
            <div class="rapor-box h-100">
                <div class="fw-bold text-success mb-1">Catatan Wali Kelas &amp; Kepala TPQ:</div>
                <div><strong>Wali:</strong> <?= htmlspecialchars($sheet['desc']['catatan_wali'] ?: '-') ?></div>
                <div class="mt-1"><strong>Kepala TPQ:</strong> <?= htmlspecialchars($sheet['desc']['catatan_kepala'] ?: '-') ?></div>
            </div>
        </div>
    </div>

    <!-- Tanda Tangan + QR Code Validasi -->
    <div class="row text-center mt-3 pt-2 align-items-end avoid-break" style="font-size: 11.5px;">
        <div class="col-3">
            <div>Mengetahui,</div>
            <div>Orang Tua / Wali Santri</div>
            <div style="height: 48px;"></div>
            <div>( ................................. )</div>
        </div>
        <div class="col-3">
            <div>Wali Kelas / Halaqoh</div>
            <div style="height: 48px;"></div>
            <div class="fw-bold">( <?= htmlspecialchars($santri['ustadz_nama'] ?? 'Ustadz Pengampu') ?> )</div>
        </div>
        <div class="col-2 d-flex flex-column align-items-center justify-content-center">
            <div id="<?= $qrDivId ?>" data-qr-url="<?= htmlspecialchars($verifyUrl) ?>" class="p-1 border rounded bg-white"></div>
            <div class="text-muted mt-1" style="font-size: 9px; line-height: 1.1;">Scan Validasi Keaslian</div>
        </div>
        <div class="col-4">
            <div><?= htmlspecialchars($lembaga['kota_penerbitan']) ?>, <?= htmlspecialchars($tglCetak) ?></div>
            <div><?= htmlspecialchars($lembaga['jabatan_penandatangan'] ?? 'Kepala TPQ') ?> <?= htmlspecialchars($lembaga['nama']) ?></div>
            <div style="height: 48px;"></div>
            <div class="fw-bold">( <?= htmlspecialchars($lembaga['kepala_tpq']) ?> )</div>
        </div>
    </div>

    <div class="text-center text-muted mt-3 pt-2 border-top" style="font-size: 10px;">
        <?= htmlspecialchars($lembaga['footnote']) ?>
    </div>
</div>
<?php endforeach; ?>

<script>
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-qr-url]').forEach(function(el) {
        var url = el.getAttribute('data-qr-url');
        if (typeof QRCode !== 'undefined' && url) {
            new QRCode(el, {
                text: url,
                width: 68,
                height: 68,
                correctLevel: QRCode.CorrectLevel.M
            });
        } else {
            el.innerHTML = '<span style="font-size:9px;">QR Valid</span>';
        }
    });
});
</script>
</body>
</html>
<?php exit(); }

// 3. Halaman Daftar Santri untuk Pencetakan Rapor
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$filterKelas = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : 0;
$qSearch = trim($_GET['q'] ?? '');

$sqlList = "SELECT s.*, k.nama_kelas FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id WHERE s.status = 'aktif'";
$paramsList = [];
if ($filterKelas > 0) {
    $sqlList .= " AND s.kelas_id = ?";
    $paramsList[] = $filterKelas;
}
if ($qSearch !== '') {
    $sqlList .= " AND (s.nama_lengkap LIKE ? OR s.nis LIKE ?)";
    $paramsList[] = '%' . $qSearch . '%';
    $paramsList[] = '%' . $qSearch . '%';
}
$sqlList .= " ORDER BY s.nama_lengkap ASC";
$stmtList = $pdo->prepare($sqlList);
$stmtList->execute($paramsList);
$santriList = $stmtList->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Rapor Santri - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Pencetakan Rapor Santri</h3>
                    <p class="text-muted small mb-0">Cetak rapor satuan atau cetak massal seluruh santri per kelas (dilengkapi QR Code Validasi)</p>
                </div>
                <a href="rapor.php?massal=1&kelas_id=<?= $filterKelas ?>" target="_blank" class="btn btn-success btn-sm">
                    <i class="bi bi-printer-fill me-1"></i> Cetak Massal <?= $filterKelas > 0 ? 'Kelas Terpilih' : 'Semua Santri' ?>
                </a>
            </div>

            <div class="card border-0 shadow-sm p-3 mb-3 rounded-3">
                <form method="GET" action="rapor.php" class="row g-2 align-items-center small">
                    <div class="col-md-4">
                        <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                            <option value="0">-- Semua Kelas / Halaqoh --</option>
                            <?php foreach ($kelasList as $k): ?>
                                <option value="<?= $k['id'] ?>" <?= $k['id'] == $filterKelas ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-5">
                        <div class="input-group input-group-sm">
                            <input type="text" name="q" value="<?= htmlspecialchars($qSearch) ?>" class="form-control" placeholder="Cari nama santri atau NIS...">
                            <button class="btn btn-success" type="submit"><i class="bi bi-search"></i> Cari</button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3">No</th><th>NIS</th><th>Nama Santri</th><th>Kelas</th><th class="text-end pe-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($santriList)): ?>
                                    <tr><td colspan="5" class="text-center py-4 text-muted">Tidak ada data santri.</td></tr>
                                <?php else: foreach ($santriList as $idx => $s): ?>
                                    <tr>
                                        <td class="ps-3"><?= $idx + 1 ?></td>
                                        <td class="font-monospace"><?= htmlspecialchars($s['nis']) ?></td>
                                        <td class="fw-bold"><?= htmlspecialchars($s['nama_lengkap']) ?></td>
                                        <td><?= htmlspecialchars($s['nama_kelas'] ?? 'Umum') ?></td>
                                        <td class="text-end pe-3">
                                            <a href="rapor.php?santri_id=<?= $s['id'] ?>" target="_blank" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Cetak Rapor</a>
                                        </td>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 10. ustadz.php
  generateUstadzPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$msg = '';
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $nama = trim($_POST['nama'] ?? '');
    $nip = trim($_POST['nip'] ?? '');
    $jk = $_POST['jk'] ?? 'L';
    $no_hp = trim($_POST['no_hp'] ?? '');
    $pendidikan = trim($_POST['pendidikan'] ?? '');
    $role = $_POST['role'] ?? 'ustadz';
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? 'password123');

    if ($nama) {
        try {
            $stmt = $pdo->prepare("INSERT INTO ustadz (nama, nip, jk, no_hp, pendidikan, role, username, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aktif')");
            $stmt->execute([$nama, $nip, $jk, $no_hp, $pendidikan, $role, $username, md5($password)]);

            if ($username) {
                $stmtUser = $pdo->prepare("INSERT INTO users (username, password, nama, role, is_active) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE nama = VALUES(nama), role = VALUES(role)");
                $stmtUser->execute([$username, md5($password), $nama, $role]);
            }
            $msg = "Data Ustadz/Ustadzah berhasil disimpan!";
        } catch (PDOException $e) {
            $err = "Gagal menyimpan data: " . $e->getMessage();
        }
    } else {
        $err = "Nama lengkap wajib diisi.";
    }
}

if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    $stmt = $pdo->prepare("DELETE FROM ustadz WHERE id = ?");
    $stmt->execute([$delId]);
    $msg = "Data Ustadz/Ustadzah berhasil dihapus.";
}

$ustadzList = $pdo->query("SELECT * FROM ustadz ORDER BY nama ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Ustadz &amp; Ustadzah - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Ustadz &amp; Ustadzah Pengajar</h3>
                    <p class="text-muted small mb-0">Kelola data tenaga pendidik, hak akses, dan wali halaqoh TPQ</p>
                </div>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTambahUstadz">
                    <i class="bi bi-person-plus me-1"></i> Tambah Ustadz Baru
                </button>
            </div>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3">No</th>
                                    <th>Nama Lengkap</th>
                                    <th>NIP / Identitas</th>
                                    <th>Jenis Kelamin</th>
                                    <th>No. Handphone / WA</th>
                                    <th>Pendidikan</th>
                                    <th>Peran Akun</th>
                                    <th class="text-end pe-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($ustadzList as $idx => $u): ?>
                                    <tr>
                                        <td class="ps-3"><?= $idx + 1 ?></td>
                                        <td>
                                            <div class="fw-bold text-dark"><?= htmlspecialchars($u['nama']) ?></div>
                                            <small class="text-muted">Username: <?= htmlspecialchars($u['username'] ?? '-') ?></small>
                                        </td>
                                        <td class="font-monospace"><?= htmlspecialchars($u['nip'] ?? '-') ?></td>
                                        <td><?= $u['jk'] === 'L' ? 'Laki-laki' : 'Perempuan' ?></td>
                                        <td><?= htmlspecialchars($u['no_hp'] ?? '-') ?></td>
                                        <td><?= htmlspecialchars($u['pendidikan'] ?? '-') ?></td>
                                        <td>
                                            <span class="badge <?= $u['role'] === 'kepala' ? 'bg-primary' : ($u['role'] === 'admin' ? 'bg-danger' : 'bg-success') ?>">
                                                <?= strtoupper($u['role']) ?>
                                            </span>
                                        </td>
                                        <td class="text-end pe-3">
                                            <a href="ustadz.php?delete_id=<?= $u['id'] ?>" onclick="return confirm('Hapus data ustadz ini?')" class="btn btn-outline-danger btn-sm py-0 px-2" title="Hapus"><i class="bi bi-trash"></i></a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>

<!-- Modal Tambah Ustadz -->
<div class="modal fade" id="modalTambahUstadz" tabindex="-1">
    <div class="modal-dialog">
        <form method="POST" action="ustadz.php" class="modal-content">
            <input type="hidden" name="action" value="create">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Tambah Ustadz / Ustadzah</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body small">
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nama Lengkap &amp; Gelar</label>
                    <input type="text" name="nama" class="form-control form-control-sm" required placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">NIP / Nomor Induk</label>
                    <input type="text" name="nip" class="form-control form-control-sm" placeholder="Opsional">
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select name="jk" class="form-select form-select-sm">
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-semibold">Peran Sistem</label>
                        <select name="role" class="form-select form-select-sm">
                            <option value="ustadz">Ustadz / Pengajar</option>
                            <option value="kepala">Kepala TPQ</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">No. HP / WhatsApp</label>
                    <input type="text" name="no_hp" class="form-control form-control-sm" placeholder="0812-xxxx-xxxx">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Pendidikan Terakhir</label>
                    <input type="text" name="pendidikan" class="form-control form-control-sm" placeholder="S1 Pendidikan Agama Islam">
                </div>
                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label fw-semibold">Username Login</label>
                        <input type="text" name="username" class="form-control form-control-sm" placeholder="ustadz1">
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-semibold">Password Awal</label>
                        <input type="password" name="password" class="form-control form-control-sm" placeholder="password123">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-success btn-sm">Simpan Ustadz</button>
            </div>
        </form>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 11. kelas.php
  generateKelasPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $nama_kelas = trim($_POST['nama_kelas'] ?? '');
    $tingkatan = trim($_POST['tingkatan'] ?? 'Dasar');
    $ustadz_id = !empty($_POST['ustadz_id']) ? (int)$_POST['ustadz_id'] : null;
    $kapasitas = !empty($_POST['kapasitas']) ? (int)$_POST['kapasitas'] : 25;
    $urutan = !empty($_POST['urutan']) ? (int)$_POST['urutan'] : 1;

    if ($nama_kelas) {
        $stmt = $pdo->prepare("INSERT INTO kelas (nama_kelas, tingkatan, ustadz_id, kapasitas, urutan) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nama_kelas, $tingkatan, $ustadz_id, $kapasitas, $urutan]);
        $msg = "Kelas / Halaqoh berhasil ditambahkan!";
    } else {
        $err = "Nama kelas wajib diisi.";
    }
}

if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    $stmt = $pdo->prepare("DELETE FROM kelas WHERE id = ?");
    $stmt->execute([$delId]);
    $msg = "Kelas berhasil dihapus.";
}

$ustadzList = $pdo->query("SELECT id, nama FROM ustadz WHERE status = 'aktif' ORDER BY nama ASC")->fetchAll();
$kelasList = $pdo->query("SELECT k.*, u.nama AS wali_nama, (SELECT COUNT(*) FROM santri s WHERE s.kelas_id = k.id AND s.status = 'aktif') AS jumlah_santri FROM kelas k LEFT JOIN ustadz u ON k.ustadz_id = u.id ORDER BY k.urutan ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Kelas &amp; Halaqoh - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Kelompok Kelas &amp; Halaqoh</h3>
                    <p class="text-muted small mb-0">Atur struktur kelompok belajar, wali ustadz/ustadzah, dan kapasitas kelas</p>
                </div>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTambahKelas">
                    <i class="bi bi-plus-circle me-1"></i> Tambah Kelas Baru
                </button>
            </div>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="row g-3">
                <?php foreach ($kelasList as $k): ?>
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm rounded-3 p-3 h-100 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <span class="badge bg-success-subtle text-success">Urutan <?= $k['urutan'] ?></span>
                                    <span class="badge bg-light text-muted border"><?= htmlspecialchars($k['tingkatan']) ?></span>
                                </div>
                                <h5 class="fw-bold text-dark mb-1"><?= htmlspecialchars($k['nama_kelas']) ?></h5>
                                <div class="small text-muted mb-2">
                                    <i class="bi bi-person-badge text-success me-1"></i> Wali: <strong><?= htmlspecialchars($k['wali_nama'] ?? 'Belum ditentukan') ?></strong>
                                </div>
                                <div class="small text-muted">
                                    <i class="bi bi-people text-info me-1"></i> Terisi: <strong><?= $k['jumlah_santri'] ?></strong> / <?= $k['kapasitas'] ?> Santri
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
                                <a href="santri.php?kelas_id=<?= $k['id'] ?>" class="btn btn-outline-success btn-sm"><i class="bi bi-eye me-1"></i> Santri</a>
                                <a href="kelas.php?delete_id=<?= $k['id'] ?>" onclick="return confirm('Hapus kelas ini?')" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>

<!-- Modal Tambah Kelas -->
<div class="modal fade" id="modalTambahKelas" tabindex="-1">
    <div class="modal-dialog">
        <form method="POST" action="kelas.php" class="modal-content">
            <input type="hidden" name="action" value="create">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Tambah Kelas / Halaqoh</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body small">
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nama Kelas / Halaqoh</label>
                    <input type="text" name="nama_kelas" class="form-control form-control-sm" required placeholder="Contoh: Halaqoh Bilqolam Jilid 1">
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label fw-semibold">Tingkatan</label>
                        <select name="tingkatan" class="form-select form-select-sm">
                            <option value="Pemula">Pemula</option>
                            <option value="Dasar">Dasar</option>
                            <option value="Menengah">Menengah</option>
                            <option value="Lanjutan">Lanjutan</option>
                            <option value="Khusus">Khusus</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-semibold">Urutan Tampil</label>
                        <input type="number" name="urutan" class="form-control form-control-sm" value="1">
                    </div>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Wali Kelas / Ustadz Pengampu</label>
                    <select name="ustadz_id" class="form-select form-select-sm">
                        <option value="">-- Pilih Ustadz Pengampu --</option>
                        <?php foreach ($ustadzList as $u): ?>
                            <option value="<?= $u['id'] ?>"><?= htmlspecialchars($u['nama']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Kapasitas Maksimal (Santri)</label>
                    <input type="number" name="kapasitas" class="form-control form-control-sm" value="25">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-success btn-sm">Simpan Kelas</button>
            </div>
        </form>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 12. pengaturan.php (Full Institution Settings, Logo Upload, NSTPQ, Tanggal Cetak Rapor & Password)
  generatePengaturanPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$err = '';
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: ['id' => 1, 'tahun' => '2025/2026', 'tgl_rapor_ganjil' => '2025-12-20', 'tgl_rapor_genap' => '2026-06-20'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['update_lembaga'])) {
        $nama = trim($_POST['nama'] ?? '');
        $yayasan = trim($_POST['yayasan'] ?? '');
        $nstpq = trim($_POST['nstpq'] ?? '');
        $telepon = trim($_POST['telepon'] ?? '');
        $website = trim($_POST['website'] ?? '');
        $alamat = trim($_POST['alamat'] ?? '');
        $kelurahan = trim($_POST['kelurahan'] ?? '');
        $kecamatan = trim($_POST['kecamatan'] ?? '');
        $kota = trim($_POST['kota'] ?? '');
        $provinsi = trim($_POST['provinsi'] ?? '');
        $kepala = trim($_POST['kepala_tpq'] ?? '');
        $nip_kepala = trim($_POST['nip_kepala'] ?? '');
        $jabatan = trim($_POST['jabatan_penandatangan'] ?? 'Kepala TPQ');
        $kota_penerbitan = trim($_POST['kota_penerbitan'] ?? 'Malang');
        $tgl_ganjil = trim($_POST['tgl_rapor_ganjil'] ?? '');
        $tgl_genap = trim($_POST['tgl_rapor_genap'] ?? '');

        $logoUrl = $lembaga['logo_url'];
        if (isset($_FILES['logo_file']) && $_FILES['logo_file']['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['logo_file']['name'], PATHINFO_EXTENSION));
            if (in_array($ext, ['png', 'jpg', 'jpeg', 'webp'], true)) {
                $destRel = 'assets/img/logo-tpq.' . $ext;
                $destAbs = __DIR__ . '/' . $destRel;
                if (move_uploaded_file($_FILES['logo_file']['tmp_name'], $destAbs)) {
                    $logoUrl = $destRel;
                }
            } else {
                $err = "Format logo harus PNG, JPG, JPEG, atau WEBP.";
            }
        }

        if (!$err) {
            $stmt = $pdo->prepare("UPDATE lembaga SET nama = ?, yayasan = ?, nstpq = ?, nspq = ?, telepon = ?, website = ?, alamat = ?, kelurahan = ?, kecamatan = ?, kota = ?, provinsi = ?, kepala_tpq = ?, nip_kepala = ?, jabatan_penandatangan = ?, kota_penerbitan = ?, logo_url = ? WHERE id = 1");
            $stmt->execute([$nama, $yayasan, $nstpq, $nstpq, $telepon, $website, $alamat, $kelurahan, $kecamatan, $kota, $provinsi, $kepala, $nip_kepala, $jabatan, $kota_penerbitan, $logoUrl]);

            if (!empty($tahunAktif['id'])) {
                $stmtThn = $pdo->prepare("UPDATE tahun_pelajaran SET tgl_rapor_ganjil = ?, tgl_rapor_genap = ? WHERE id = ?");
                $stmtThn->execute([$tgl_ganjil, $tgl_genap, (int)$tahunAktif['id']]);
                $tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: $tahunAktif;
            }
            $msg = "Identitas lembaga, logo, dan format tanggal cetak rapor berhasil diperbarui!";
            header("Location: pengaturan.php?saved=1");
            exit();
        }
    } elseif (isset($_POST['change_password']) && in_array($_SESSION['user']['role'], ['admin', 'kepala'], true)) {
        $newPass = trim($_POST['new_password'] ?? '');
        if (strlen($newPass) >= 6) {
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
            $stmt->execute([md5($newPass), $_SESSION['user']['username']]);
            $msg = "Password akun berhasil diperbarui!";
        } else {
            $err = "Password baru minimal 6 karakter.";
        }
    }
}

if (isset($_GET['saved'])) {
    $msg = "Perubahan konfigurasi TPQ berhasil disimpan!";
}

$lembagaData = $pdo->query("SELECT * FROM lembaga WHERE id = 1")->fetch() ?: $lembaga;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengaturan Lembaga TPQ - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <h3 class="fw-bold mb-1">Pengaturan Sistem &amp; Kustomisasi TPQ</h3>
            <p class="text-muted small mb-4">Ubah identitas lembaga, logo, kepala TPQ, serta tempat &amp; tanggal cetak rapor</p>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="row g-4">
                <div class="col-lg-8">
                    <form method="POST" action="pengaturan.php" enctype="multipart/form-data" class="card border-0 shadow-sm rounded-3 p-4 small">
                        <input type="hidden" name="update_lembaga" value="1">
                        <h5 class="fw-bold text-success mb-3"><i class="bi bi-building me-2"></i>Identitas, Logo &amp; Format Cetak Rapor</h5>

                        <div class="row g-3">
                            <div class="col-12 d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo Saat Ini" class="border rounded bg-white p-1" style="width: 68px; height: 68px; object-fit: contain;">
                                <div class="flex-grow-1">
                                    <label class="form-label fw-semibold mb-1">Logo Lembaga TPQ (PNG/JPG)</label>
                                    <input type="file" name="logo_file" accept="image/png,image/jpeg,image/webp" class="form-control form-control-sm">
                                    <small class="text-muted">Biarkan kosong jika tidak ingin mengganti logo saat ini.</small>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Lembaga TPQ</label>
                                <input type="text" name="nama" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['nama'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Yayasan Penyelenggara</label>
                                <input type="text" name="yayasan" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['yayasan'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Nomor Statistik (NSTPQ)</label>
                                <input type="text" name="nstpq" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['nstpq'] ?? $lembagaData['nspq'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Nomor Telepon / WA</label>
                                <input type="text" name="telepon" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['telepon'] ?? '') ?>">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Website / Email</label>
                                <input type="text" name="website" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['website'] ?? '') ?>">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-semibold">Alamat Lengkap</label>
                                <textarea name="alamat" class="form-control form-control-sm" rows="2" required><?= htmlspecialchars($lembagaData['alamat'] ?? '') ?></textarea>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Kelurahan / Desa</label>
                                <input type="text" name="kelurahan" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['kelurahan'] ?? '') ?>">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Kecamatan</label>
                                <input type="text" name="kecamatan" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['kecamatan'] ?? '') ?>">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Kabupaten / Kota</label>
                                <input type="text" name="kota" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['kota'] ?? '') ?>">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Provinsi</label>
                                <input type="text" name="provinsi" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['provinsi'] ?? '') ?>">
                            </div>

                            <hr class="my-2">
                            <div class="col-12 fw-bold text-success">Tampilan &amp; Format Cetak Rapor</div>

                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Tempat Cetak Rapor (Kota)</label>
                                <input type="text" name="kota_penerbitan" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['kota_penerbitan'] ?? 'Malang') ?>">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Tgl Cetak Rapor Ganjil</label>
                                <input type="text" name="tgl_rapor_ganjil" class="form-control form-control-sm" value="<?= htmlspecialchars($tahunAktif['tgl_rapor_ganjil'] ?? '2025-12-20') ?>" placeholder="2025-12-20">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Tgl Cetak Rapor Genap</label>
                                <input type="text" name="tgl_rapor_genap" class="form-control form-control-sm" value="<?= htmlspecialchars($tahunAktif['tgl_rapor_genap'] ?? '2026-06-20') ?>" placeholder="2026-06-20">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Jabatan Penandatangan</label>
                                <input type="text" name="jabatan_penandatangan" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['jabatan_penandatangan'] ?? 'Kepala TPQ') ?>">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Nama Kepala TPQ</label>
                                <input type="text" name="kepala_tpq" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['kepala_tpq'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">NIP / NIAT Kepala</label>
                                <input type="text" name="nip_kepala" class="form-control form-control-sm" value="<?= htmlspecialchars($lembagaData['nip_kepala'] ?? '') ?>">
                            </div>
                        </div>

                        <div class="mt-4">
                            <button type="submit" class="btn btn-success px-4"><i class="bi bi-save me-1"></i> Simpan Profil &amp; Pengaturan</button>
                        </div>
                    </form>
                </div>

                <div class="col-lg-4">
                    <?php if (in_array($_SESSION['user']['role'], ['admin', 'kepala'], true)): ?>
                    <form method="POST" action="pengaturan.php" class="card border-0 shadow-sm rounded-3 p-4 small mb-3">
                        <input type="hidden" name="change_password" value="1">
                        <h6 class="fw-bold text-dark mb-3"><i class="bi bi-shield-lock me-1"></i> Ubah Password Akun Saya</h6>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Password Baru</label>
                            <input type="password" name="new_password" class="form-control form-control-sm" required placeholder="Minimal 6 karakter">
                        </div>
                        <button type="submit" class="btn btn-outline-success btn-sm w-100">Perbarui Password</button>
                    </form>
                    <?php endif; ?>

                    <div class="card border-0 shadow-sm rounded-3 p-4 small bg-light">
                        <h6 class="fw-bold text-success mb-2">Informasi Hosting</h6>
                        <p class="text-muted mb-0">Seluruh konfigurasi identitas, logo TPQ, NSTPQ, dan tanggal pembagian rapor tersimpan permanen di database MySQL.</p>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 13. backup.php (Live MySQL Export & Statistics)
  generateBackupPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

if (isset($_GET['download']) && $_GET['download'] === 'sql') {
    $filename = 'tpq_aladzkiyaa_backup_' . date('Ymd_His') . '.sql';
    header('Content-Description: File Transfer');
    header('Content-Type: application/sql; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');

    echo "-- RAPOR TPQ AL-ADZKIYAA LIVE DATABASE BACKUP\\n";
    echo "-- Generated: " . date('Y-m-d H:i:s') . "\\n\\n";
    echo "SET FOREIGN_KEY_CHECKS = 0;\\n\\n";

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        $createRow = $pdo->query("SHOW CREATE TABLE \`" . $table . "\`")->fetch(PDO::FETCH_NUM);
        echo "DROP TABLE IF EXISTS \`" . $table . "\`;\\n";
        echo $createRow[1] . ";\\n\\n";
        $rows = $pdo->query("SELECT * FROM \`" . $table . "\`")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $cols = array_map(fn($c) => "\`" . $c . "\`", array_keys($row));
            $vals = array_map(fn($v) => $v === null ? 'NULL' : $pdo->quote((string)$v), array_values($row));
            echo "INSERT INTO \`" . $table . "\` (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ");\\n";
        }
        echo "\\n";
    }
    echo "SET FOREIGN_KEY_CHECKS = 1;\\n";
    exit();
}

$countSantri = $pdo->query("SELECT COUNT(*) FROM santri")->fetchColumn();
$countUstadz = $pdo->query("SELECT COUNT(*) FROM ustadz")->fetchColumn();
$countKelas = $pdo->query("SELECT COUNT(*) FROM kelas")->fetchColumn();
$countNilai = $pdo->query("SELECT COUNT(*) FROM nilai")->fetchColumn();
$countTahun = $pdo->query("SELECT COUNT(*) FROM tahun_pelajaran")->fetchColumn();
$countJilid = $pdo->query("SELECT COUNT(*) FROM jilid")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadangan &amp; Database SQL - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <h3 class="fw-bold mb-1">Cadangan &amp; Pemulihan Database</h3>
            <p class="text-muted small mb-4">Unduh dump SQL database MySQL terbaru (realtime seluruh data santri &amp; nilai saat ini)</p>

            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm rounded-3 p-4 h-100">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="p-3 bg-success-subtle text-success rounded-circle fs-3">
                                <i class="bi bi-database-down"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold text-dark mb-1">Unduh Database MySQL (.SQL)</h5>
                                <p class="text-muted small mb-0">Ekspor langsung seluruh struktur &amp; data terkini</p>
                            </div>
                        </div>
                        <p class="text-muted small">
                            Gunakan berkas ini untuk cadangan berkala atau impor langsung melalui phpMyAdmin pada cPanel, Rumah Hosting, VPS, XAMPP, atau Laragon.
                        </p>
                        <a href="backup.php?download=sql" class="btn btn-success"><i class="bi bi-download me-1"></i> Unduh Backup SQL Terbaru</a>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card border-0 shadow-sm rounded-3 p-4 h-100">
                        <h6 class="fw-bold text-dark mb-3">Statistik Data Database Saat Ini</h6>
                        <div class="row g-2 text-center small">
                            <div class="col-4 p-2 bg-light rounded">
                                <div class="fs-4 fw-bold text-success"><?= $countSantri ?></div>
                                <div class="text-muted">Santri</div>
                            </div>
                            <div class="col-4 p-2 bg-light rounded">
                                <div class="fs-4 fw-bold text-primary"><?= $countUstadz ?></div>
                                <div class="text-muted">Ustadz</div>
                            </div>
                            <div class="col-4 p-2 bg-light rounded">
                                <div class="fs-4 fw-bold text-info"><?= $countKelas ?></div>
                                <div class="text-muted">Kelas</div>
                            </div>
                            <div class="col-4 p-2 bg-light rounded">
                                <div class="fs-4 fw-bold text-warning"><?= $countNilai ?></div>
                                <div class="text-muted">Record Nilai</div>
                            </div>
                            <div class="col-4 p-2 bg-light rounded">
                                <div class="fs-4 fw-bold text-secondary"><?= $countJilid ?></div>
                                <div class="text-muted">Tingkat Jilid</div>
                            </div>
                            <div class="col-4 p-2 bg-light rounded">
                                <div class="fs-4 fw-bold text-dark"><?= $countTahun ?></div>
                                <div class="text-muted">Tahun Ajaran</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // Main method to construct and trigger zip download
  async downloadDeployPackage(lembaga: LembagaProfile, appName = 'RAPOR_TPQ_AL_ADZKIYAA') {
    const zip = new JSZip();

    // 1. Database SQL Dump
    zip.file('database.sql', this.generateDatabaseSQL(lembaga));

    // 2. Deployment Documentation & Readme
    zip.file('PANDUAN_HOSTING.md', this.generateHostingGuide(lembaga));
    zip.file(
      'README.txt',
      `========================================================================
RAPOR TPQ AL-ADZKIYAA’ - PAKET DEPLOY SIAP PAKAI
Sistem Pengelolaan Nilai, Rapor, dan Piagam TPQ Terpadu
Bahasa: PHP 8+ | Database: MySQL 8+ / MariaDB 10.4+
========================================================================

1. PETUNJUK INSTALASI SINGKAT:
   - Baca panduan lengkap pada berkas: PANDUAN_HOSTING.md
   - Buat database di cPanel / phpMyAdmin (contoh: tpq_aladzkiyaa)
   - Impor berkas: database.sql
   - Sesuaikan konfigurasi pada berkas: config/database.php
   - Buka website di browser Anda!

2. AKUN LOGIN AWAL:
   - Administrator : username: admin   | password: admin123
   - Kepala TPQ    : username: kepala  | password: password123
   - Ustadz Pengajar: username: ustadz1 | password: password123
   - Santri / Wali : username: santri1 | password: password123

3. STRUKTUR BERKAS LENGKAP:
   ├── index.php                 (Halaman Login dengan Logo TPQ)
   ├── dashboard.php             (Beranda, Statistik, Progress & Grafik)
   ├── logout.php                (Proses Keluar Sistem)
   ├── config/database.php       (Koneksi PDO MySQL & Helper Global)
   ├── includes/header.php       (Navbar Statis dengan Logo TPQ)
   ├── includes/sidebar.php      (Sidebar Role-Based sesuai Aplikasi)
   ├── assets/css/style.css      (Custom Styling & Print Stylesheet A4)
   ├── assets/img/logo-tpq.png   (Asset Logo Lembaga TPQ Resmi)
   ├── santri.php                (Kelola Data Santri)
   ├── ustadz.php                (Kelola Data Ustadz)
   ├── kelas.php                 (Kelola Kelas & Halaqoh)
   ├── tahun_semester.php        (Kelola Tahun Pelajaran & Semester)
   ├── metode_jilid.php          (Kelola Metode Belajar & Tingkatan Jilid)
   ├── komponen_nilai.php        (Kelola Komponen Penilaian & Predikat)
   ├── isi_nilai.php             (Input Nilai, Absensi & Catatan Wali)
   ├── kumpulan_nilai.php        (Leger Nilai & Ranking Kelas + CSV)
   ├── kenaikan_jilid.php        (Evaluasi & Kenaikan Jilid)
   ├── kenaikan_kelas.php        (Kenaikan Kelas Massal)
   ├── rapor.php                 (Cetak Rapor Satuan/Massal + QR Validasi)
   ├── piagam.php                (Cetak Piagam Juara 1-3 Portrait/Landscape)
   ├── chat.php                  (Pesan Internal Antar Ustadz)
   ├── profil_santri.php         (Portal Profil Santri & Wali)
   ├── pengaturan.php            (Kustomisasi Identitas, Logo & Tgl Rapor)
   ├── backup.php                (Ekspor Live SQL Database)
   └── database.sql              (Skema 23 Tabel & Data Awal TPQ)

${lembaga.footnote}
========================================================================`
    );

    // 3. Root PHP Files
    zip.file('index.php', phpTemplates.getIndexPHP(lembaga));
    zip.file('dashboard.php', phpTemplates.getDashboardPHP(lembaga));
    zip.file('logout.php', `<?php session_start(); session_destroy(); header("Location: index.php"); exit(); ?>`);

    // 4. Config Directory
    const configFolder = zip.folder('config');
    configFolder?.file('database.php', phpTemplates.getDatabaseConfigPHP(lembaga));
    configFolder?.file('index.html', '<!doctype html><title>403 Forbidden</title>');

    // 5. Includes Directory
    const includesFolder = zip.folder('includes');
    includesFolder?.file('sidebar.php', this.generateSidebarPHP());
    includesFolder?.file('header.php', this.generateHeaderPHP());
    includesFolder?.file('index.html', '<!doctype html><title>403 Forbidden</title>');

    // 6. Assets Directory (CSS + Real Logo PNG)
    const assetsFolder = zip.folder('assets');
    assetsFolder?.file('index.html', '<!doctype html><title>403 Forbidden</title>');
    const cssFolder = assetsFolder?.folder('css');
    cssFolder?.file('style.css', this.generateCSS());
    cssFolder?.file('index.html', '<!doctype html><title>403 Forbidden</title>');

    const imgFolder = assetsFolder?.folder('img');
    imgFolder?.file('index.html', '<!doctype html><title>403 Forbidden</title>');
    const logoBytes = await fetchLogoBytes(lembaga.logoUrl);
    if (logoBytes) {
      imgFolder?.file('logo-tpq.png', logoBytes);
    }

    // 7. Full Working Application Pages (All 16 operational pages)
    zip.file('santri.php', this.generateSantriPHP(lembaga));
    zip.file('ustadz.php', this.generateUstadzPHP(lembaga));
    zip.file('kelas.php', this.generateKelasPHP(lembaga));
    zip.file('tahun_semester.php', phpTemplates.getTahunSemesterPHP(lembaga));
    zip.file('metode_jilid.php', phpTemplates.getMetodeJilidPHP(lembaga));
    zip.file('komponen_nilai.php', phpTemplates.getKomponenNilaiPHP(lembaga));
    zip.file('isi_nilai.php', this.generateIsiNilaiPHP(lembaga));
    zip.file('kumpulan_nilai.php', phpTemplates.getKumpulanNilaiPHP(lembaga));
    zip.file('kenaikan_jilid.php', phpTemplates.getKenaikanJilidPHP(lembaga));
    zip.file('kenaikan_kelas.php', phpTemplates.getKenaikanKelasPHP(lembaga));
    zip.file('rapor.php', this.generateRaporPHP(lembaga));
    zip.file('piagam.php', phpTemplates.getPiagamPHP(lembaga));
    zip.file('chat.php', phpTemplates.getChatPHP(lembaga));
    zip.file('profil_santri.php', phpTemplates.getProfilSantriPHP(lembaga));
    zip.file('pengaturan.php', this.generatePengaturanPHP(lembaga));
    zip.file('backup.php', this.generateBackupPHP(lembaga));

    // Generate zip blob
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Paket_Deploy_PHP_MySQL_${appName.replace(/\s+/g, '_')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
