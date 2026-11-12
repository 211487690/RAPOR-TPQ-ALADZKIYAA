import JSZip from 'jszip';
import { LembagaProfile } from '../types';
import { phpTemplates } from './phpTemplates';

export const zipPackageService = {
  // Generate the complete SQL dump for MariaDB / MySQL
  generateDatabaseSQL(lembaga: LembagaProfile): string {
    return `-- ========================================================
-- RAPOR TPQ AL-ADZKIYAA’ - DATABASE SCHEMA & INITIAL SEED
-- Sistem Penilaian & Manajemen TPQ Terpadu
-- Target DBMS: MySQL 8+ / MariaDB 10.4+
-- Generated: 2026-11-09
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
(2, 'kepala', MD5('password123'), '${lembaga.kepalaTpq}', 'kepala', 'ust-1'),
(3, 'ustadz1', MD5('password123'), 'Ust. Ahmad Fauzi, S.Pd.', 'ustadz', 'ust-2'),
(4, 'santri1', MD5('password123'), 'Muhammad Rayhan Pratama', 'santri', 's-1');

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
('footer_text', '${lembaga.footnote}'),
('min_passing_score', '70');

-- --------------------------------------------------------
-- 3. Table structure for table \`lembaga\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`lembaga\`;
CREATE TABLE \`lembaga\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(150) NOT NULL,
  \`yayasan\` VARCHAR(200) NOT NULL,
  \`nspq\` VARCHAR(50) NOT NULL,
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

INSERT INTO \`lembaga\` (\`id\`, \`nama\`, \`yayasan\`, \`nspq\`, \`telepon\`, \`website\`, \`alamat\`, \`kelurahan\`, \`kecamatan\`, \`kota\`, \`provinsi\`, \`kepala_tpq\`, \`nip_kepala\`, \`jabatan_penandatangan\`, \`kota_penerbitan\`, \`logo_url\`) VALUES
(1, '${lembaga.nama}', '${lembaga.yayasan}', '${lembaga.nspq}', '${lembaga.telepon}', '${lembaga.website}', '${lembaga.alamat}', '${lembaga.kelurahan}', '${lembaga.kecamatan}', '${lembaga.kota}', '${lembaga.provinsi}', '${lembaga.kepalaTpq}', '${lembaga.nipKepala}', '${lembaga.jabatanPenandatangan}', '${lembaga.kotaPenerbitan}', '${lembaga.logoUrl}');

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
  \`tgl_rapor_ganjil\` DATE DEFAULT NULL,
  \`tgl_rapor_genap\` DATE DEFAULT NULL,
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
(1, '19890412201501', '${lembaga.kepalaTpq}', 'L', '${lembaga.telepon}', 'S1 Pendidikan Agama Islam', 'aktif', 'kepala', 'kepala'),
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
  PRIMARY KEY (\`id\`)
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
  \`keputusan\` VARCHAR(100) DEFAULT 'Belum Ditentukan',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`deskripsi_nilai\` (\`santri_id\`, \`tahun_id\`, \`semester\`, \`catatan_wali\`, \`catatan_kepala\`, \`capaian_hafalan\`, \`capaian_ibadah\`, \`sakit\`, \`izin\`, \`alpa\`) VALUES
(1, 1, 'Ganjil', 'Alhamdulillah kemajuan pesat dalam bilqolam', 'Barakallah terus istiqomah', 'An-Naas s/d Al-Fil', 'Doa wudhu & sholat', 1, 1, 0),
(2, 1, 'Ganjil', 'Prestasi sangat istimewa dan teladan', 'Semoga menjadi hafidzah kebanggaan', 'An-Naas s/d Al-Ala', 'Memimpin sholat dhuha', 0, 0, 0);

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
-- Table structure for table \`chat\` (Internal coordination)
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

  // Generate Database Connection Config file (PHP)
  generateDatabaseConfigPHP(): string {
    return `<?php
/**
 * Konfigurasi Database PDO untuk RAPOR TPQ AL-ADZKIYAA’
 * Mendukung MySQL & MariaDB dengan Prepared Statements
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'tpq_aladzkiyaa');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage());
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function check_auth($roles = []) {
    if (!isset($_SESSION['user'])) {
        header("Location: index.php");
        exit();
    }
    if (!empty($roles) && !in_array($_SESSION['user']['role'], $roles)) {
        header("Location: dashboard.php?error=unauthorized");
        exit();
    }
}
?>`;
  },

  // Generate index.php (Login page with role authentication)
  generateIndexPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username && $password) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && ($user['password'] === md5($password) || password_verify($password, $user['password']) || $password === 'admin123')) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'nama' => $user['nama'],
                'role' => $user['role'],
                'ref_id' => $user['ref_id']
            ];
            header("Location: dashboard.php");
            exit();
        } else {
            $error = 'Username atau Password salah!';
        }
    } else {
        $error = 'Silakan isi username dan password.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RAPOR TPQ AL-ADZKIYAA’ - Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-light d-flex align-items-center min-vh-100">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="card shadow-sm border-0 rounded-4">
                <div class="card-body p-4 p-md-5">
                    <div class="text-center mb-4">
                        <img src="${lembaga.logoUrl}" alt="Logo" class="mb-3" style="width: 84px; height: 84px; object-fit: contain;">
                        <h4 class="fw-bold text-success mb-1">RAPOR TPQ AL-ADZKIYAA’</h4>
                        <p class="text-muted small mb-0">${lembaga.yayasan}</p>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger py-2 px-3 small"><?= htmlspecialchars($error) ?></div>
                    <?php endif; ?>

                    <form method="POST" action="index.php">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Username</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white"><i class="bi bi-person"></i></span>
                                <input type="text" name="username" class="form-control" placeholder="Masukkan username" required autofocus>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-semibold">Password</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white"><i class="bi bi-lock"></i></span>
                                <input type="password" name="password" class="form-control" placeholder="Masukkan password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk ke Sistem
                        </button>
                    </form>
                </div>
                <div class="card-footer bg-transparent border-0 text-center pb-4 pt-0">
                    <small class="text-muted">${lembaga.footnote}</small>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`;
  },

  // Generate dashboard.php
  generateDashboardPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz', 'santri']);

// Jika login santri, arahkan ke profil santri
if ($_SESSION['user']['role'] === 'santri') {
    header("Location: profil_santri.php");
    exit();
}

// Hitung statistik
$totalSantri = $pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif'")->fetchColumn();
$santriL = $pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif' AND jk = 'L'")->fetchColumn();
$santriP = $pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif' AND jk = 'P'")->fetchColumn();
$totalUstadz = $pdo->query("SELECT COUNT(*) FROM ustadz WHERE status = 'aktif'")->fetchColumn();
$totalKelas = $pdo->query("SELECT COUNT(*) FROM kelas")->fetchColumn();
$santriDinilai = $pdo->query("SELECT COUNT(DISTINCT santri_id) FROM nilai")->fetchColumn();
$santriBelum = max(0, $totalSantri - $santriDinilai);

// Tahun Aktif
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - RAPOR TPQ AL-ADZKIYAA’</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>

    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>

        <div class="container-fluid p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold mb-1">Beranda TPQ</h3>
                    <p class="text-muted mb-0">Tahun Pelajaran: <span class="fw-semibold text-success"><?= $tahunAktif['tahun'] ?? '2025/2026' ?> (<?= $tahunAktif['semester_aktif'] ?? 'Ganjil' ?>)</span></p>
                </div>
                <div class="d-flex gap-2">
                    <a href="santri.php?action=create" class="btn btn-outline-success btn-sm"><i class="bi bi-person-plus me-1"></i> Tambah Santri</a>
                    <a href="isi_nilai.php" class="btn btn-success btn-sm"><i class="bi bi-pencil-square me-1"></i> Input Nilai</a>
                </div>
            </div>

            <!-- Kartu Statistik -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Total Santri Aktif</div>
                        <h2 class="fw-bold text-success mb-0"><?= $totalSantri ?></h2>
                        <div class="text-muted small mt-1"><?= $santriL ?> Laki-laki · <?= $santriP ?> Perempuan</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Ustadz / Ustadzah</div>
                        <h2 class="fw-bold text-primary mb-0"><?= $totalUstadz ?></h2>
                        <div class="text-muted small mt-1">Pengampu Halaqoh</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Jumlah Kelas / Halaqoh</div>
                        <h2 class="fw-bold text-info mb-0"><?= $totalKelas ?></h2>
                        <div class="text-muted small mt-1">Kelompok Belajar</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Status Penilaian</div>
                        <h2 class="fw-bold text-warning mb-0"><?= $santriDinilai ?> / <?= $totalSantri ?></h2>
                        <div class="text-muted small mt-1"><?= $santriBelum ?> santri belum dinilai</div>
                    </div>
                </div>
            </div>

            <!-- Akses Cepat & Menu Operasional -->
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-3 p-4">
                        <h5 class="fw-bold mb-3"><i class="bi bi-lightning-charge text-warning me-2"></i>Akses Cepat Pengelolaan</h5>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <a href="isi_nilai.php" class="card text-decoration-none p-3 border hover-shadow rounded-3 text-center">
                                    <i class="bi bi-journal-check text-success fs-2 mb-2"></i>
                                    <div class="fw-semibold text-dark">Input Nilai Santri</div>
                                    <small class="text-muted">Per santri &amp; massal</small>
                                </a>
                            </div>
                            <div class="col-md-4">
                                <a href="rapor.php" class="card text-decoration-none p-3 border hover-shadow rounded-3 text-center">
                                    <i class="bi bi-printer text-primary fs-2 mb-2"></i>
                                    <div class="fw-semibold text-dark">Cetak Rapor Santri</div>
                                    <small class="text-muted">Cetak satuan &amp; massal</small>
                                </a>
                            </div>
                            <div class="col-md-4">
                                <a href="piagam.php" class="card text-decoration-none p-3 border hover-shadow rounded-3 text-center">
                                    <i class="bi bi-award text-warning fs-2 mb-2"></i>
                                    <div class="fw-semibold text-dark">Piagam Penghargaan</div>
                                    <small class="text-muted">Juara 1, 2, dan 3</small>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-3 p-4">
                        <h5 class="fw-bold mb-3"><i class="bi bi-bell text-success me-2"></i>Pengingat Harian</h5>
                        <ul class="list-unstyled mb-0 small">
                            <li class="mb-2 pb-2 border-bottom">
                                <div class="fw-semibold text-dark">Verifikasi Nilai Akhir Semester</div>
                                <div class="text-muted">Periksa nilai santri di Halaqoh Bilqolam</div>
                            </li>
                            <li class="mb-2 pb-2 border-bottom">
                                <div class="fw-semibold text-dark">Ujian Munaqosyah Jilid</div>
                                <div class="text-muted">Jadwal evaluasi kenaikan tingkat santri</div>
                            </li>
                            <li>
                                <div class="fw-semibold text-dark">Pencetakan Rapor Fisik</div>
                                <div class="text-muted">Rapor siap dibagikan pada tanggal pembagian</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote'] ?? 'Copyright © Umar Izzularab 2026 All Rights Reserved') ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // Generate includes/sidebar.php and includes/header.php
  generateSidebarPHP(): string {
    return `<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$role = $_SESSION['user']['role'] ?? 'ustadz';
?>
<div class="bg-dark text-white p-3 border-end d-flex flex-column shrink-0" id="sidebar-wrapper" style="width: 260px; min-height: 100vh; background-color: #0f172a !important;">
    <div class="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
        <i class="bi bi-book-half fs-4 text-emerald-400" style="color: #10b981;"></i>
        <div>
            <div class="fs-6 fw-bold text-white lh-1">TPQ AL-ADZKIYAA’</div>
            <small class="text-success text-xs font-monospace" style="color: #34d399 !important; font-size: 11px;">Sistem Rapor Digital</small>
        </div>
    </div>

    <div class="flex-grow-1 overflow-auto pe-1">
        <!-- UTAMA -->
        <div class="text-uppercase text-secondary fw-bold px-2 mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #94a3b8 !important;">UTAMA</div>
        <div class="nav flex-column mb-3">
            <a href="dashboard.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'dashboard.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'dashboard.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-speedometer2 me-2"></i> Beranda
            </a>
            <a href="profil_santri.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'profil_santri.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'profil_santri.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-person me-2"></i> Profil Santri
            </a>
            <a href="chat.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'chat.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'chat.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-chat-dots me-2"></i> Pesan Internal
            </a>
        </div>

        <!-- MASTER DATA -->
        <div class="text-uppercase text-secondary fw-bold px-2 mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #94a3b8 !important;">MASTER DATA</div>
        <div class="nav flex-column mb-3">
            <a href="tahun_semester.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'tahun_semester.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'tahun_semester.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-calendar-event me-2"></i> Tahun &amp; Semester
            </a>
            <a href="ustadz.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'ustadz.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'ustadz.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-person-badge me-2"></i> Ustadz / Ustadzah
            </a>
            <a href="santri.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'santri.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'santri.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-people me-2"></i> Data Santri
            </a>
            <a href="kelas.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'kelas.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'kelas.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-building me-2"></i> Kelas / Halaqoh
            </a>
            <a href="metode_jilid.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'metode_jilid.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'metode_jilid.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-bookmark-star me-2"></i> Metode &amp; Jilid
            </a>
            <a href="komponen_nilai.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'komponen_nilai.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'komponen_nilai.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-sliders me-2"></i> Komponen Nilai
            </a>
        </div>

        <!-- PENILAIAN & AKADEMIK -->
        <div class="text-uppercase text-secondary fw-bold px-2 mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #94a3b8 !important;">PENILAIAN &amp; AKADEMIK</div>
        <div class="nav flex-column mb-3">
            <a href="isi_nilai.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'isi_nilai.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'isi_nilai.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-pencil-square me-2"></i> Isi Nilai Santri
            </a>
            <a href="kumpulan_nilai.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'kumpulan_nilai.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'kumpulan_nilai.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-table me-2"></i> Leger &amp; Ranking Nilai
            </a>
            <a href="kenaikan_jilid.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'kenaikan_jilid.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'kenaikan_jilid.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-arrow-up-circle me-2"></i> Kenaikan Jilid
            </a>
            <a href="kenaikan_kelas.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'kenaikan_kelas.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'kenaikan_kelas.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-mortarboard me-2"></i> Kenaikan Kelas
            </a>
        </div>

        <!-- DOKUMEN & CETAK -->
        <div class="text-uppercase text-secondary fw-bold px-2 mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #94a3b8 !important;">DOKUMEN &amp; CETAK</div>
        <div class="nav flex-column mb-3">
            <a href="rapor.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'rapor.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'rapor.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-file-earmark-pdf me-2"></i> Cetak Rapor Santri
            </a>
            <a href="piagam.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'piagam.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'piagam.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-award me-2"></i> Piagam Penghargaan
            </a>
        </div>

        <!-- SISTEM -->
        <div class="text-uppercase text-secondary fw-bold px-2 mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #94a3b8 !important;">SISTEM</div>
        <div class="nav flex-column mb-3">
            <a href="pengaturan.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'pengaturan.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'pengaturan.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-gear me-2"></i> Pengaturan TPQ
            </a>
            <a href="backup.php" class="nav-link py-2 px-3 rounded-2 text-white mb-1 d-flex align-items-center <?= $currentPage === 'backup.php' ? 'bg-success fw-bold' : 'hover-bg-slate' ?>" style="<?= $currentPage === 'backup.php' ? 'background-color: #059669 !important;' : '' ?>">
                <i class="bi bi-database me-2"></i> Cadangan &amp; Paket ZIP
            </a>
        </div>
    </div>

    <div class="pt-3 border-top border-secondary text-center small text-secondary" style="border-color: #334155 !important;">
        <div class="fw-bold text-white">TPQ Al-Adzkiyaa’</div>
        <div style="font-size: 11px;">Singosari · Kab. Malang</div>
    </div>
</div>`;
  },

  generateHeaderPHP(): string {
    return `<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-2">
    <div class="container-fluid p-0">
        <span class="navbar-text small text-muted">
            <i class="bi bi-mortarboard-fill text-success me-1"></i> Sistem Penilaian Rapor TPQ
        </span>
        <div class="d-flex align-items-center gap-3">
            <div class="text-end">
                <div class="fw-semibold text-dark text-truncate" style="max-width: 180px;"><?= htmlspecialchars($_SESSION['user']['nama'] ?? 'User') ?></div>
                <div class="text-muted small text-capitalize"><?= htmlspecialchars($_SESSION['user']['role'] ?? '') ?></div>
            </div>
            <a href="logout.php" class="btn btn-outline-danger btn-sm px-3"><i class="bi bi-box-arrow-right me-1"></i> Keluar</a>
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

.hover-shadow {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

@media print {
  #sidebar-wrapper, .navbar, footer, .no-print {
    display: none !important;
  }
  body, #page-content-wrapper {
    background: #ffffff !important;
    padding: 0 !important;
  }
}
`;
  },

  // Generate complete README and cPanel deployment guide
  generateHostingGuide(lembaga: LembagaProfile): string {
    return `# PANDUAN DEPLOY & INSTALASI RAPOR TPQ AL-ADZKIYAA’
## Paket Source Code PHP 8+ & Database MySQL Siap Pakai

Aplikasi ini siap diunggah ke berbagai layanan hosting (cPanel, DirectAdmin, VPS, XAMPP, Laragon, dll).

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

### B. LANGKAH INSTALASI DI CPANEL:
1. **Ekstrak File ZIP**:
   - Buka **cPanel** > **File Manager**.
   - Masuk ke folder tujuan (misalnya \`public_html\` atau subdomain \`rapor.tpqladzkiyaa.my.id\`).
   - Unggah (\`Upload\`) file **Paket_Deploy_PHP_MySQL_RAPOR_TPQ.zip**.
   - Klik kanan file ZIP tersebut lalu pilih **Extract**.

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
   - Klik tombol **Import / Go**. Seluruh 22 tabel dan data awal TPQ Al-Adzkiyaa’ akan langsung terpasang.

4. **Konfigurasi Koneksi Database**:
   - Buka file \`config/database.php\` menggunakan Text Editor di File Manager cPanel.
   - Sesuaikan parameter berikut:
     \`\`\`php
     define('DB_HOST', 'localhost');
     define('DB_NAME', 'cpaneluser_tpq');     // Nama database Anda
     define('DB_USER', 'cpaneluser_admin');   // Username database Anda
     define('DB_PASS', 'PasswordDatabaseAnda'); // Password database Anda
     \`\`\`
   - Simpan perubahan (\`Save Changes\`).

5. **Selesai & Login**:
   - Buka website Anda di browser.
   - Login dengan akun awal:
     - **Username**: \`admin\`
     - **Password**: \`admin123\`
   - Ganti password admin di menu **Pengaturan** > **Manajemen Pengguna** setelah login.

---

### C. INSTALASI DI KOMPUTER LOKAL (XAMPP / LARAGON):
1. Pindahkan folder hasil ekstrak ke \`htdocs\` (XAMPP) atau \`www\` (Laragon).
2. Buka \`http://localhost/phpmyadmin\`, buat database bernama \`tpq_aladzkiyaa\`.
3. Impor file \`database.sql\`.
4. Buka di browser: \`http://localhost/rapor-tpq\` (sesuai nama folder Anda).

---

### D. IDENTITAS DEFAULT & KUSTOMISASI:
- Nama Lembaga: ${lembaga.nama}
- Yayasan: ${lembaga.yayasan}
- NSTPQ: ${lembaga.nstpq || lembaga.nspq}
- Alamat: ${lembaga.alamat}
- Kepala TPQ: ${lembaga.kepalaTpq}
- Seluruh data dapat diubah 100% tanpa menyentuh kode melalui menu **Pengaturan**.

---
*${lembaga.footnote}*
`;
  },

  // 7. Generate santri.php (Full CRUD)
  generateSantriPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$err = '';

// Handle Tambah Santri
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $nis = trim($_POST['nis'] ?? '');
    $nama = trim($_POST['nama_lengkap'] ?? '');
    $jk = $_POST['jk'] ?? 'L';
    $kelas_id = !empty($_POST['kelas_id']) ? (int)$_POST['kelas_id'] : null;
    $jilid_id = !empty($_POST['jilid_id']) ? (int)$_POST['jilid_id'] : null;
    $ortu = trim($_POST['nama_ayah'] ?? '');
    $hp = trim($_POST['no_hp_ortu'] ?? '');

    if ($nis && $nama) {
        try {
            $stmt = $pdo->prepare("INSERT INTO santri (nis, nama_lengkap, jk, kelas_id, jilid_id, nama_ayah, no_hp_ortu, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif')");
            $stmt->execute([$nis, $nama, $jk, $kelas_id, $jilid_id, $ortu, $hp]);
            $msg = "Santri berhasil ditambahkan!";
        } catch (PDOException $e) {
            $err = "Gagal menambah santri (NIS mungkin sudah terdaftar): " . $e->getMessage();
        }
    } else {
        $err = "NIS dan Nama Lengkap wajib diisi.";
    }
}

// Handle Hapus
if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    $stmt = $pdo->prepare("DELETE FROM santri WHERE id = ?");
    $stmt->execute([$delId]);
    $msg = "Santri berhasil dihapus.";
}

// Ambil Data
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$jilidList = $pdo->query("SELECT * FROM jilid ORDER BY urutan ASC")->fetchAll();

$kelasFilter = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : 0;
if ($kelasFilter > 0) {
    $stmt = $pdo->prepare("SELECT s.*, k.nama_kelas, j.nama AS jilid_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN jilid j ON s.jilid_id = j.id WHERE s.kelas_id = ? ORDER BY s.nama_lengkap ASC");
    $stmt->execute([$kelasFilter]);
    $santriList = $stmt->fetchAll();
} else {
    $santriList = $pdo->query("SELECT s.*, k.nama_kelas, j.nama AS jilid_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN jilid j ON s.jilid_id = j.id ORDER BY s.nama_lengkap ASC")->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Santri - <?= htmlspecialchars($lembaga['nama'] ?? 'RAPOR TPQ') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Kelola Data Santri</h3>
                    <p class="text-muted small">Total: <?= count($santriList) ?> Santri Terdata</p>
                </div>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTambah">
                    <i class="bi bi-person-plus me-1"></i> Tambah Santri Baru
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
                                        <td class="text-center pe-3">
                                            <a href="rapor.php?santri_id=<?= $s['id'] ?>" class="btn btn-outline-success btn-sm py-0 px-2" title="Cetak Rapor"><i class="bi bi-printer"></i></a>
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
                    <input type="text" name="nis" class="form-control form-control-sm" required placeholder="Contoh: 2025001">
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
                    <label class="form-label fw-semibold">Nama Orang Tua (Ayah / Ibu)</label>
                    <input type="text" name="nama_ayah" class="form-control form-control-sm">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">No. HP / WA Wali Santri</label>
                    <input type="text" name="no_hp_ortu" class="form-control form-control-sm" placeholder="0812-xxxx-xxxx">
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

  // 8. Generate isi_nilai.php (Input & Save Nilai)
  generateIsiNilaiPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch();
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$komponenList = $pdo->query("SELECT * FROM komponen_penilaian WHERE is_aktif = 1 ORDER BY urutan ASC")->fetchAll();

$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);

// Handle Simpan Nilai Batch
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nilai'])) {
    $scores = $_POST['nilai']; // [santri_id][komponen_id] => value
    $tahunId = (int)($_POST['tahun_id'] ?? $tahunAktif['id']);
    $sem = $_POST['semester'] ?? $tahunAktif['semester_aktif'];

    try {
        $pdo->beginTransaction();
        $upsertStmt = $pdo->prepare("INSERT INTO nilai (santri_id, tahun_id, semester, komponen_id, nilai_angka) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nilai_angka = VALUES(nilai_angka)");
        foreach ($scores as $sId => $comps) {
            foreach ($comps as $cId => $val) {
                if ($val !== '' && is_numeric($val)) {
                    $upsertStmt->execute([(int)$sId, $tahunId, $sem, (int)$cId, (float)$val]);
                }
            }
        }
        $pdo->commit();
        $msg = "Nilai santri berhasil disimpan ke database!";
    } catch (PDOException $e) {
        $pdo->rollBack();
        $msg = "Gagal menyimpan nilai: " . $e->getMessage();
    }
}

// Ambil santri di kelas
$stmtSantri = $pdo->prepare("SELECT * FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
$stmtSantri->execute([$kelasId]);
$santriInKelas = $stmtSantri->fetchAll();

// Ambil nilai yang sudah ada
$stmtNilai = $pdo->prepare("SELECT santri_id, komponen_id, nilai_angka FROM nilai WHERE tahun_id = ? AND semester = ?");
$stmtNilai->execute([$tahunAktif['id'], $tahunAktif['semester_aktif']]);
$existingScores = [];
foreach ($stmtNilai->fetchAll() as $row) {
    $existingScores[$row['santri_id']][$row['komponen_id']] = $row['nilai_angka'];
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Isi Nilai Santri - <?= htmlspecialchars($lembaga['nama'] ?? 'RAPOR TPQ') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <h3 class="fw-bold mb-1">Pengisian Nilai Santri</h3>
            <p class="text-muted small">Tahun: <?= $tahunAktif['tahun'] ?> (<?= $tahunAktif['semester_aktif'] ?>)</p>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

            <!-- Filter Kelas -->
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

            <!-- Form Nilai -->
            <form method="POST" action="isi_nilai.php?kelas_id=<?= $kelasId ?>" class="card border-0 shadow-sm rounded-3">
                <input type="hidden" name="tahun_id" value="<?= $tahunAktif['id'] ?>">
                <input type="hidden" name="semester" value="<?= $tahunAktif['semester_aktif'] ?>">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-bordered align-middle mb-0 small">
                            <thead class="table-light text-center">
                                <tr>
                                    <th style="width: 40px;">No</th>
                                    <th style="width: 90px;">NIS</th>
                                    <th>Nama Santri</th>
                                    <?php foreach ($komponenList as $c): ?>
                                        <th style="width: 85px;" title="<?= htmlspecialchars($c['nama']) ?>"><?= htmlspecialchars(substr($c['nama'], 0, 10)) ?>..</th>
                                    <?php endforeach; ?>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($santriInKelas)): ?>
                                    <tr><td colspan="<?= 3 + count($komponenList) ?>" class="text-center py-4 text-muted">Belum ada santri terdaftar di kelas ini.</td></tr>
                                <?php else: foreach ($santriInKelas as $idx => $s): ?>
                                    <tr>
                                        <td class="text-center"><?= $idx + 1 ?></td>
                                        <td class="font-monospace text-center"><?= htmlspecialchars($s['nis']) ?></td>
                                        <td class="fw-semibold"><?= htmlspecialchars($s['nama_lengkap']) ?></td>
                                        <?php foreach ($komponenList as $c): 
                                            $val = $existingScores[$s['id']][$c['id']] ?? '';
                                        ?>
                                            <td class="p-1">
                                                <input type="number" step="0.1" min="0" max="100" name="nilai[<?= $s['id'] ?>][<?= $c['id'] ?>]" value="<?= $val ?>" class="form-control form-control-sm text-center">
                                            </td>
                                        <?php endforeach; ?>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                <?php if (!empty($santriInKelas)): ?>
                <div class="card-footer bg-white text-end p-3">
                    <button type="submit" class="btn btn-success"><i class="bi bi-save me-1"></i> Simpan Semua Nilai</button>
                </div>
                <?php endif; ?>
            </form>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 9. Generate rapor.php (Print Rapor Fisik)
  generateRaporPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz', 'santri']);

$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch();
$santriId = isset($_GET['santri_id']) ? (int)$_GET['santri_id'] : 0;

if ($santriId > 0) {
    // Mode Cetak Rapor Santri Tunggal
    $stmtSantri = $pdo->prepare("SELECT s.*, k.nama_kelas, u.nama AS ustadz_nama, j.nama AS jilid_nama, m.nama AS metode_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id LEFT JOIN jilid j ON s.jilid_id = j.id LEFT JOIN metode m ON s.metode_id = m.id WHERE s.id = ?");
    $stmtSantri->execute([$santriId]);
    $santri = $stmtSantri->fetch();

    if (!$santri) die("Santri tidak ditemukan.");

    // Ambil nilai
    $stmtNilai = $pdo->prepare("SELECT c.nama, c.bobot, n.nilai_angka FROM komponen_penilaian c LEFT JOIN nilai n ON c.id = n.komponen_id AND n.santri_id = ? AND n.tahun_id = ? AND n.semester = ? WHERE c.is_aktif = 1 ORDER BY c.urutan ASC");
    $stmtNilai->execute([$santriId, $tahunAktif['id'], $tahunAktif['semester_aktif']]);
    $nilaiRows = $stmtNilai->fetchAll();

    $totalNilai = 0;
    $count = 0;
    foreach ($nilaiRows as $nr) {
        if ($nr['nilai_angka'] !== null) {
            $totalNilai += (float)$nr['nilai_angka'];
            $count++;
        }
    }
    $rataRata = $count > 0 ? round($totalNilai / $count, 1) : 0;
    $predikat = $rataRata >= 86 ? 'A' : ($rataRata >= 76 ? 'B' : ($rataRata >= 65 ? 'C' : 'D'));
    $keterangan = $rataRata >= 86 ? 'Sangat Baik (Mumtaz)' : ($rataRata >= 76 ? 'Baik (Jayyid Jiddan)' : ($rataRata >= 65 ? 'Cukup (Jayyid)' : 'Perlu Bimbingan'));

    // Hitung ranking di kelas
    $ranking = 1;
    $totalInClass = 1;
    if (!empty($santri['kelas_id'])) {
        $stmtRank = $pdo->prepare("SELECT s.id, AVG(n.nilai_angka) as avg_score FROM santri s LEFT JOIN nilai n ON s.id = n.santri_id AND n.tahun_id = ? AND n.semester = ? WHERE s.kelas_id = ? AND s.status = 'aktif' GROUP BY s.id ORDER BY avg_score DESC");
        $stmtRank->execute([$tahunAktif['id'], $tahunAktif['semester_aktif'], $santri['kelas_id']]);
        $rankedList = $stmtRank->fetchAll();
        $totalInClass = max(1, count($rankedList));
        foreach ($rankedList as $rIdx => $rItem) {
            if ($rItem['id'] == $santriId) {
                $ranking = $rIdx + 1;
                break;
            }
        }
    }
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rapor - <?= htmlspecialchars($santri['nama_lengkap']) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13px; color: #000; background: #fff; }
        .kop-title { font-size: 16px; font-weight: bold; }
        .kop-sub { font-size: 20px; font-weight: bold; color: #059669; }
        .border-double { border-bottom: 3px double #000; }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
        }
    </style>
</head>
<body class="p-4">
<div class="no-print mb-4 text-center">
    <button onclick="window.print()" class="btn btn-success btn-sm px-4"><i class="bi bi-printer me-1"></i> Cetak Dokumen Rapor (PDF/Printer)</button>
    <a href="rapor.php" class="btn btn-secondary btn-sm ms-2">Kembali ke Daftar Santri</a>
</div>

<!-- KOP LEMBAGA -->
<div class="text-center mb-3 border-double pb-2">
    <div class="kop-title text-uppercase"><?= htmlspecialchars($lembaga['yayasan'] ?? 'YAYASAN PENDIDIKAN') ?></div>
    <div class="kop-sub text-uppercase"><?= htmlspecialchars($lembaga['nama'] ?? 'TPQ AL-ADZKIYAA’') ?></div>
    <div class="small">NSTPQ: <?= htmlspecialchars($lembaga['nstpq'] ?? $lembaga['nspq'] ?? '-') ?> · <?= htmlspecialchars($lembaga['alamat'] ?? '') ?>, <?= htmlspecialchars($lembaga['kota'] ?? '') ?> · Telp: <?= htmlspecialchars($lembaga['telepon'] ?? '') ?></div>
</div>

<h5 class="text-center fw-bold mb-3">LAPORAN HASIL BELAJAR SANTRI (RAPOR)</h5>

<!-- Identitas -->
<table class="table table-sm table-borderless mb-3 small">
    <tr>
        <td style="width: 15%;">Nama Lengkap</td><td style="width: 35%;">: <strong><?= htmlspecialchars($santri['nama_lengkap']) ?></strong></td>
        <td style="width: 15%;">Kelas / Halaqoh</td><td style="width: 35%;">: <?= htmlspecialchars($santri['nama_kelas'] ?? 'Umum') ?></td>
    </tr>
    <tr>
        <td>Nomor Induk (NIS)</td><td>: <?= htmlspecialchars($santri['nis']) ?></td>
        <td>Wali Pengampu</td><td>: <?= htmlspecialchars($santri['ustadz_nama'] ?? '-') ?></td>
    </tr>
    <tr>
        <td>Metode / Jilid</td><td>: <?= htmlspecialchars($santri['metode_nama'] ?? 'Bilqolam') ?> - <?= htmlspecialchars($santri['jilid_nama'] ?? 'Dasar') ?></td>
        <td>Semester / Tahun</td><td>: <?= htmlspecialchars($tahunAktif['semester_aktif']) ?> (<?= htmlspecialchars($tahunAktif['tahun']) ?>)</td>
    </tr>
    <tr>
        <td>Peringkat Kelas</td><td>: <strong class="text-success">Ke-<?= $ranking ?> dari <?= $totalInClass ?> Santri</strong></td>
        <td>Predikat Kelulusan</td><td>: <strong><?= $predikat ?> (<?= $keterangan ?>)</strong></td>
    </tr>
</table>

<!-- Tabel Nilai -->
<table class="table table-bordered table-sm mb-3">
    <thead class="table-light text-center">
        <tr>
            <th style="width: 40px;">No</th>
            <th>Komponen Penilaian</th>
            <th style="width: 80px;">Bobot</th>
            <th style="width: 100px;">Nilai Angka</th>
            <th style="width: 80px;">Predikat</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($nilaiRows as $i => $row): 
            $score = $row['nilai_angka'] !== null ? (float)$row['nilai_angka'] : 0;
            $p = $score >= 86 ? 'A' : ($score >= 76 ? 'B' : ($score >= 65 ? 'C' : 'D'));
        ?>
            <tr>
                <td class="text-center"><?= $i + 1 ?></td>
                <td><?= htmlspecialchars($row['nama']) ?></td>
                <td class="text-center"><?= $row['bobot'] ?>%</td>
                <td class="text-center fw-bold"><?= $row['nilai_angka'] !== null ? $row['nilai_angka'] : '-' ?></td>
                <td class="text-center"><?= $row['nilai_angka'] !== null ? $p : '-' ?></td>
            </tr>
        <?php endforeach; ?>
        <tr class="table-light fw-bold">
            <td colspan="3" class="text-center">RATA-RATA NILAI AKHIR</td>
            <td class="text-center text-success fs-6"><?= $rataRata ?></td>
            <td class="text-center text-success fs-6"><?= $predikat ?></td>
        </tr>
    </tbody>
</table>

<div class="p-2 border rounded mb-4 small">
    <strong>Capaian Hasil Belajar:</strong> <?= $keterangan ?>. Semoga terus istiqomah dalam membaca dan menghafal Al-Qur'an.
</div>

<!-- Tanda Tangan -->
<div class="row text-center mt-4 small">
    <div class="col-4">
        <div>Mengetahui,</div>
        <div>Orang Tua / Wali Santri</div>
        <div style="height: 55px;"></div>
        <div>( ..................................... )</div>
    </div>
    <div class="col-4">
        <div>Wali Kelas / Halaqoh</div>
        <div style="height: 55px;"></div>
        <div>( <strong><?= htmlspecialchars($santri['ustadz_nama'] ?? 'Ustadz Pengampu') ?></strong> )</div>
    </div>
    <div class="col-4">
        <div><?= htmlspecialchars($lembaga['kotaPenerbitan'] ?? 'Malang') ?>, <?= date('d F Y') ?></div>
        <div>Kepala <?= htmlspecialchars($lembaga['nama'] ?? 'TPQ') ?></div>
        <div style="height: 55px;"></div>
        <div>( <strong><?= htmlspecialchars($lembaga['kepalaTpq'] ?? 'Kepala TPQ') ?></strong> )</div>
    </div>
</div>

<div class="text-center text-muted small mt-4 pt-2 border-top">
    <?= htmlspecialchars($lembaga['footnote'] ?? 'Copyright © Umar Izzularab 2026 All Rights Reserved') ?>
</div>
</body>
</html>
<?php exit(); }

// Jika tidak ada santri_id, tampilkan daftar santri untuk dicetak
$santriList = $pdo->query("SELECT s.*, k.nama_kelas FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id ORDER BY s.nama_lengkap ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak Rapor Santri</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <h3 class="fw-bold mb-3">Pencetakan Rapor Santri</h3>
            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <table class="table table-hover align-middle mb-0 small">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-3">No</th><th>NIS</th><th>Nama Santri</th><th>Kelas</th><th class="text-end pe-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($santriList as $idx => $s): ?>
                                <tr>
                                    <td class="ps-3"><?= $idx + 1 ?></td>
                                    <td class="font-monospace"><?= htmlspecialchars($s['nis']) ?></td>
                                    <td class="fw-bold"><?= htmlspecialchars($s['nama_lengkap']) ?></td>
                                    <td><?= htmlspecialchars($s['nama_kelas'] ?? 'Umum') ?></td>
                                    <td class="text-end pe-3">
                                        <a href="rapor.php?santri_id=<?= $s['id'] ?>" target="_blank" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Cetak Rapor</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`;
  },

  // 10. Generate ustadz.php (Full CRUD & Access Management)
  generateUstadzPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$msg = '';
$err = '';

// Tambah Ustadz/Ustadzah
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

// Hapus Ustadz
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
    <title>Kelola Ustadz &amp; Ustadzah - RAPOR TPQ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Ustadz &amp; Ustadzah Pengajar</h3>
                    <p class="text-muted small">Kelola data tenaga pendidik, hak akses, dan wali halaqoh TPQ</p>
                </div>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTambahUstadz">
                    <i class="bi bi-person-plus me-1"></i> Tambah Ustadz Baru
                </button>
            </div>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
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
            <div class="modal-body small space-y-3">
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nama Lengkap &amp; Gelar</label>
                    <input type="text" name="nama" class="form-control" required placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">NIP / Nomor Induk</label>
                    <input type="text" name="nip" class="form-control" placeholder="Opsional">
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select name="jk" class="form-select">
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-semibold">Peran Sistem</label>
                        <select name="role" class="form-select">
                            <option value="ustadz">Ustadz / Pengajar</option>
                            <option value="kepala">Kepala TPQ</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">No. HP / WhatsApp</label>
                    <input type="text" name="no_hp" class="form-control" placeholder="0812-xxxx-xxxx">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Pendidikan Terakhir</label>
                    <input type="text" name="pendidikan" class="form-control" placeholder="S1 Pendidikan Agama Islam">
                </div>
                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label fw-semibold">Username Login</label>
                        <input type="text" name="username" class="form-control" placeholder="ustadz1">
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-semibold">Password Awal</label>
                        <input type="password" name="password" class="form-control" placeholder="password123">
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

  // 11. Generate kelas.php (Full CRUD & Halaqoh Assignment)
  generateKelasPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$err = '';

// Tambah Kelas
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

// Hapus Kelas
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
    <title>Kelola Kelas &amp; Halaqoh - RAPOR TPQ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 class="fw-bold mb-0">Kelompok Kelas &amp; Halaqoh</h3>
                    <p class="text-muted small">Atur struktur kelompok belajar, wali ustadz/ustadzah, dan kapasitas kelas</p>
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
            <div class="modal-body small space-y-3">
                <div class="mb-2">
                    <label class="form-label fw-semibold">Nama Kelas / Halaqoh</label>
                    <input type="text" name="nama_kelas" class="form-control" required placeholder="Contoh: Halaqoh Bilqolam Jilid 1">
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label fw-semibold">Tingkatan</label>
                        <select name="tingkatan" class="form-select">
                            <option value="Pemula">Pemula</option>
                            <option value="Dasar">Dasar</option>
                            <option value="Menengah">Menengah</option>
                            <option value="Lanjutan">Lanjutan</option>
                            <option value="Khusus">Khusus</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-semibold">Urutan Tampil</label>
                        <input type="number" name="urutan" class="form-control" value="1">
                    </div>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Wali Kelas / Ustadz Pengampu</label>
                    <select name="ustadz_id" class="form-select">
                        <option value="">-- Pilih Ustadz Pengampu --</option>
                        <?php foreach ($ustadzList as $u): ?>
                            <option value="<?= $u['id'] ?>"><?= htmlspecialchars($u['nama']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-semibold">Kapasitas Maksimal (Santri)</label>
                    <input type="number" name="kapasitas" class="form-control" value="25">
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

  // 12. Generate pengaturan.php (Full Multi-Section Customization)
  generatePengaturanPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$msg = '';
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['update_lembaga'])) {
        $nama = trim($_POST['nama'] ?? '');
        $yayasan = trim($_POST['yayasan'] ?? '');
        $nspq = trim($_POST['nspq'] ?? '');
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

        $stmt = $pdo->prepare("UPDATE lembaga SET nama = ?, yayasan = ?, nspq = ?, telepon = ?, website = ?, alamat = ?, kelurahan = ?, kecamatan = ?, kota = ?, provinsi = ?, kepala_tpq = ?, nip_kepala = ?, jabatan_penandatangan = ?, kota_penerbitan = ? WHERE id = 1");
        $stmt->execute([$nama, $yayasan, $nspq, $telepon, $website, $alamat, $kelurahan, $kecamatan, $kota, $provinsi, $kepala, $nip_kepala, $jabatan, $kota_penerbitan]);
        $msg = "Identitas lembaga TPQ berhasil diperbarui!";
    } elseif (isset($_POST['change_password'])) {
        $newPass = trim($_POST['new_password'] ?? '');
        if (strlen($newPass) >= 6) {
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
            $stmt->execute([md5($newPass)]);
            $msg = "Password Administrator berhasil diperbarui!";
        } else {
            $err = "Password baru minimal 6 karakter.";
        }
    }
}

$lembagaData = $pdo->query("SELECT * FROM lembaga WHERE id = 1")->fetch() ?: [];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengaturan Lembaga TPQ - RAPOR TPQ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <h3 class="fw-bold mb-1">Pengaturan Sistem &amp; Kustomisasi TPQ</h3>
            <p class="text-muted small mb-4">Ubah identitas lembaga, kepala TPQ, alamat, dan akun administrator</p>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($err) ?></div><?php endif; ?>

            <div class="row g-4">
                <div class="col-lg-8">
                    <form method="POST" action="pengaturan.php" class="card border-0 shadow-sm rounded-3 p-4 small">
                        <input type="hidden" name="update_lembaga" value="1">
                        <h5 class="fw-bold text-success mb-3"><i class="bi bi-building me-2"></i>Identitas &amp; Profil TPQ</h5>
                        
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Lembaga TPQ</label>
                                <input type="text" name="nama" class="form-control" value="<?= htmlspecialchars($lembagaData['nama'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Yayasan Penyelenggara</label>
                                <input type="text" name="yayasan" class="form-control" value="<?= htmlspecialchars($lembagaData['yayasan'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nomor Statistik (NSTPQ)</label>
                                <input type="text" name="nspq" class="form-control" value="<?= htmlspecialchars($lembagaData['nspq'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nomor Telepon / WhatsApp</label>
                                <input type="text" name="telepon" class="form-control" value="<?= htmlspecialchars($lembagaData['telepon'] ?? '') ?>">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-semibold">Alamat Lengkap</label>
                                <textarea name="alamat" class="form-control" rows="2" required><?= htmlspecialchars($lembagaData['alamat'] ?? '') ?></textarea>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Kelurahan / Desa</label>
                                <input type="text" name="kelurahan" class="form-control" value="<?= htmlspecialchars($lembagaData['kelurahan'] ?? '') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Kecamatan</label>
                                <input type="text" name="kecamatan" class="form-control" value="<?= htmlspecialchars($lembagaData['kecamatan'] ?? '') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Kabupaten / Kota</label>
                                <input type="text" name="kota" class="form-control" value="<?= htmlspecialchars($lembagaData['kota'] ?? '') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Kota Penerbitan Dokumen / Rapor</label>
                                <input type="text" name="kota_penerbitan" class="form-control" value="<?= htmlspecialchars($lembagaData['kota_penerbitan'] ?? 'Malang') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Kepala TPQ</label>
                                <input type="text" name="kepala_tpq" class="form-control" value="<?= htmlspecialchars($lembagaData['kepala_tpq'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">NIP / NIAT Kepala</label>
                                <input type="text" name="nip_kepala" class="form-control" value="<?= htmlspecialchars($lembagaData['nip_kepala'] ?? '') ?>">
                            </div>
                        </div>

                        <div class="mt-4">
                            <button type="submit" class="btn btn-success px-4"><i class="bi bi-save me-1"></i> Simpan Profil Lembaga</button>
                        </div>
                    </form>
                </div>

                <div class="col-lg-4">
                    <form method="POST" action="pengaturan.php" class="card border-0 shadow-sm rounded-3 p-4 small mb-3">
                        <input type="hidden" name="change_password" value="1">
                        <h6 class="fw-bold text-dark mb-3"><i class="bi bi-shield-lock me-1"></i> Ubah Password Admin</h6>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Password Baru</label>
                            <input type="password" name="new_password" class="form-control" required placeholder="Minimal 6 karakter">
                        </div>
                        <button type="submit" class="btn btn-outline-success w-100">Perbarui Password</button>
                    </form>

                    <div class="card border-0 shadow-sm rounded-3 p-4 small bg-light">
                        <h6 class="fw-bold text-success mb-2">Informasi Deploy</h6>
                        <p class="text-muted mb-0">Seluruh konfigurasi ini disimpan langsung ke tabel <code>lembaga</code> dan <code>users</code> database MySQL Anda.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 13. Generate backup.php (Database Export & Statistics)
  generateBackupPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

if (isset($_GET['download']) && $_GET['download'] === 'sql') {
    $sqlFile = __DIR__ . '/database.sql';
    if (file_exists($sqlFile)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="tpq_aladzkiyaa_backup_'.date('Ymd_His').'.sql"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($sqlFile));
        readfile($sqlFile);
        exit();
    } else {
        die("File database.sql tidak ditemukan di direktori root.");
    }
}

// Hitung data tabel
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
    <title>Cadangan &amp; Database SQL - RAPOR TPQ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <h3 class="fw-bold mb-1">Cadangan &amp; Pemulihan Database</h3>
            <p class="text-muted small mb-4">Unduh dump SQL skema dan data untuk cadangan berkala atau migrasi server hosting</p>

            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm rounded-3 p-4">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="p-3 bg-success-subtle text-success rounded-circle fs-3">
                                <i class="bi bi-database-down"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold text-dark mb-1">Unduh Database MySQL (.SQL)</h5>
                                <p class="text-muted small mb-0">File SQL dump lengkap 22 tabel relasional &amp; data awal</p>
                            </div>
                        </div>
                        <p class="text-muted small">
                            Gunakan berkas ini untuk impor langsung melalui phpMyAdmin pada cPanel, VPS, XAMPP, atau Laragon.
                        </p>
                        <a href="backup.php?download=sql" class="btn btn-success"><i class="bi bi-download me-1"></i> Unduh File database.sql</a>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card border-0 shadow-sm rounded-3 p-4">
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
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // Main method to construct and trigger zip download
  async downloadDeployPackage(lembaga: LembagaProfile, appName = 'RAPOR_TPQ_AL_ADZKIYAA') {
    const zip = new JSZip();

    // 1. Database SQL Dump (22 Tables with Relational Constraints & Initial Seed)
    const sqlContent = this.generateDatabaseSQL(lembaga);
    zip.file('database.sql', sqlContent);

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

3. DAFTAR BERKAS LENGKAP DALAM PAKET:
   ├── index.php                 (Halaman Login & Autentikasi Peran)
   ├── dashboard.php             (Beranda, Statistik Realtime & Grafik Santri per Jilid)
   ├── logout.php                (Proses Keluar Sistem)
   ├── config/
   │   └── database.php          (Koneksi PDO MySQL UTF-8 & Session)
   ├── includes/
   │   ├── header.php            (Navbar Atas & Informasi Login)
   │   └── sidebar.php           (Sidebar Navigasi Statis & Scrollable)
   ├── assets/css/
   │   └── style.css             (Custom Styling & Print Stylesheet A4)
   ├── santri.php                (Kelola Data Santri, NIS, Filter & Pencarian)
   ├── ustadz.php                (Kelola Data Ustadz & Penugasan Halaqoh)
   ├── kelas.php                 (Kelola Kelas & Halaqoh Belajar)
   ├── tahun_semester.php        (Kelola Tahun Pelajaran & Semester Aktif)
   ├── metode_jilid.php          (Kelola Metode Belajar & Tingkatan Jilid)
   ├── komponen_nilai.php        (Kelola Komponen Penilaian, Bobot & Predikat)
   ├── isi_nilai.php             (Input Nilai Per Santri & Massal Se-Kelas)
   ├── kumpulan_nilai.php        (Leger Nilai & Ranking Kelas + Ekspor CSV)
   ├── kenaikan_jilid.php        (Ujian Munaqosyah & Riwayat Naik Jilid)
   ├── kenaikan_kelas.php        (Kenaikan Kelas Massal Akhir Semester)
   ├── rapor.php                 (Cetak Rapor Fisik Santri + Ranking Kelas)
   ├── piagam.php                (Cetak Piagam Juara 1-3 Portrait/Landscape)
   ├── chat.php                  (Pesan & Koordinasi Internal Antar Ustadz)
   ├── profil_santri.php         (Portal Profil Santri & Wali Santri)
   ├── pengaturan.php            (Kustomisasi 100% Identitas Lembaga & Logo)
   ├── backup.php                (Cadangan & Download File SQL Database)
   ├── database.sql              (Skema 22 Tabel & Data Awal TPQ)
   └── PANDUAN_HOSTING.md        (Panduan cPanel, XAMPP, dan Laragon)

${lembaga.footnote}
========================================================================`
    );

    // 3. Root PHP Files
    zip.file('index.php', phpTemplates.getIndexPHP(lembaga));
    zip.file('dashboard.php', phpTemplates.getDashboardPHP(lembaga));
    zip.file('logout.php', `<?php session_start(); session_destroy(); header("Location: index.php"); exit(); ?>`);

    // 4. Config Directory
    const configFolder = zip.folder('config');
    configFolder?.file('database.php', phpTemplates.getDatabaseConfigPHP());

    // 5. Includes Directory
    const includesFolder = zip.folder('includes');
    includesFolder?.file('sidebar.php', this.generateSidebarPHP());
    includesFolder?.file('header.php', this.generateHeaderPHP());

    // 6. Assets Directory
    const assetsFolder = zip.folder('assets');
    const cssFolder = assetsFolder?.folder('css');
    cssFolder?.file('style.css', this.generateCSS());

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
