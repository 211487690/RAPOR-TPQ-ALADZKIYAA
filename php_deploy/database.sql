-- ========================================================
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
-- 1. Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `role` ENUM('admin','kepala','ustadz','santri','operator') NOT NULL DEFAULT 'ustadz',
  `ref_id` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `password`, `nama`, `role`, `ref_id`) VALUES
(1, 'admin', MD5('admin123'), 'Administrator TPQ', 'admin', NULL),
(2, 'kepala', MD5('password123'), 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.', 'kepala', 'ust-1'),
(3, 'ustadz1', MD5('password123'), 'Ust. Ahmad Fauzi, S.Pd.', 'ustadz', 'ust-2'),
(4, 'santri1', MD5('password123'), 'Muhammad Rayhan Pratama', 'santri', 's-1');

-- --------------------------------------------------------
-- 2. Table structure for table `settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('app_name', 'RAPOR TPQ AL-ADZKIYAA’'),
('theme_color', 'emerald'),
('paper_size', 'A4'),
('footer_text', 'Copyright © Umar Izzularab 2026 All Rights Reserved'),
('min_passing_score', '70');

-- --------------------------------------------------------
-- 3. Table structure for table `lembaga`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `lembaga`;
CREATE TABLE `lembaga` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(150) NOT NULL,
  `yayasan` VARCHAR(200) NOT NULL,
  `nspq` VARCHAR(50) NOT NULL,
  `telepon` VARCHAR(50) DEFAULT NULL,
  `website` VARCHAR(150) DEFAULT NULL,
  `alamat` TEXT NOT NULL,
  `kelurahan` VARCHAR(100) DEFAULT NULL,
  `kecamatan` VARCHAR(100) DEFAULT NULL,
  `kota` VARCHAR(100) DEFAULT NULL,
  `provinsi` VARCHAR(100) DEFAULT NULL,
  `kepala_tpq` VARCHAR(100) NOT NULL,
  `nip_kepala` VARCHAR(50) DEFAULT NULL,
  `jabatan_penandatangan` VARCHAR(50) DEFAULT 'Kepala TPQ',
  `kota_penerbitan` VARCHAR(100) DEFAULT 'Malang',
  `logo_url` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lembaga` (`id`, `nama`, `yayasan`, `nspq`, `telepon`, `website`, `alamat`, `kelurahan`, `kecamatan`, `kota`, `provinsi`, `kepala_tpq`, `nip_kepala`, `jabatan_penandatangan`, `kota_penerbitan`) VALUES
(1, 'TPQ Al-Adzkiyaa’', 'Yayasan Pendidikan Al Ma’arif Miftahul Huda Singosari', '411235079034', '0856-0606-4478', 'https://tpqladzkiyaa.my.id', 'Jl. Patih Gg.I RT.02/RW.02 Dusun Ngujung Toyomarto SIngosari Malang', 'Toyomarto', 'Singosari', 'Kabupaten Malang', 'Jawa Timur', 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.', '', 'Kepala TPQ', 'Malang');

-- --------------------------------------------------------
-- 4. Table structure for table `tahun_pelajaran`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tahun_pelajaran`;
CREATE TABLE `tahun_pelajaran` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tahun` VARCHAR(20) NOT NULL,
  `semester_aktif` ENUM('Ganjil','Genap') NOT NULL DEFAULT 'Ganjil',
  `is_aktif` TINYINT(1) NOT NULL DEFAULT 1,
  `is_locked` TINYINT(1) NOT NULL DEFAULT 0,
  `tgl_rapor_ganjil` DATE DEFAULT NULL,
  `tgl_rapor_genap` DATE DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tahun_pelajaran` (`id`, `tahun`, `semester_aktif`, `is_aktif`, `is_locked`, `tgl_rapor_ganjil`, `tgl_rapor_genap`) VALUES
(1, '2025/2026', 'Ganjil', 1, 0, '2025-12-20', '2026-06-20'),
(2, '2024/2025', 'Genap', 0, 1, '2024-12-21', '2025-06-21');

-- --------------------------------------------------------
-- 5. Table structure for table `semester`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `semester`;
CREATE TABLE `semester` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` ENUM('Ganjil','Genap') NOT NULL,
  `keterangan` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `semester` (`id`, `nama`, `keterangan`) VALUES
(1, 'Ganjil', 'Semester Pertama'),
(2, 'Genap', 'Semester Kedua (Kenaikan Kelas/Jilid)');

-- --------------------------------------------------------
-- 6. Table structure for table `ustadz`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `ustadz`;
CREATE TABLE `ustadz` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nip` VARCHAR(50) DEFAULT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `jk` ENUM('L','P') NOT NULL DEFAULT 'L',
  `tempat_lahir` VARCHAR(100) DEFAULT NULL,
  `tanggal_lahir` DATE DEFAULT NULL,
  `alamat` TEXT DEFAULT NULL,
  `no_hp` VARCHAR(30) DEFAULT NULL,
  `pendidikan` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `username` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('ustadz','kepala','admin') NOT NULL DEFAULT 'ustadz',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ustadz` (`id`, `nip`, `nama`, `jk`, `no_hp`, `pendidikan`, `status`, `username`, `password`, `role`) VALUES
(1, '19890412201501', 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.', 'L', '0856-0606-4478', 'S1 Pendidikan Agama Islam', 'aktif', 'kepala', 'password123', 'kepala'),
(2, '19920815201802', 'Ust. Ahmad Fauzi, S.Pd.', 'L', '0812-3344-5566', 'S1 Bahasa Arab', 'aktif', 'ustadz1', 'password123', 'ustadz'),
(3, '19950320202003', 'Ustadzah Siti Aminah, S.Ag.', 'P', '0813-7788-9900', 'S1 Ilmu Al-Quran', 'aktif', 'ustadzah1', 'password123', 'ustadz');

-- --------------------------------------------------------
-- 7. Table structure for table `kelas`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `kelas`;
CREATE TABLE `kelas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama_kelas` VARCHAR(100) NOT NULL,
  `tingkatan` VARCHAR(50) DEFAULT NULL,
  `ustadz_id` INT(11) DEFAULT NULL,
  `urutan` INT(11) NOT NULL DEFAULT 1,
  `kapasitas` INT(11) NOT NULL DEFAULT 25,
  `keterangan` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kelas` (`id`, `nama_kelas`, `tingkatan`, `ustadz_id`, `urutan`, `kapasitas`) VALUES
(1, 'Halaqoh Bilqolam Dasar (Abu Bakar)', 'Pemula', 2, 1, 25),
(2, 'Halaqoh Juz Amma (Umar bin Khattab)', 'Menengah', 2, 2, 25),
(3, 'Halaqoh Al-Quran & Tartil (Utsman bin Affan)', 'Lanjutan', 3, 3, 20);

-- --------------------------------------------------------
-- 8. Table structure for table `santri`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `santri`;
CREATE TABLE `santri` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nis` VARCHAR(30) NOT NULL UNIQUE,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `nama_panggilan` VARCHAR(50) DEFAULT NULL,
  `jk` ENUM('L','P') NOT NULL DEFAULT 'L',
  `tempat_lahir` VARCHAR(100) DEFAULT NULL,
  `tanggal_lahir` DATE DEFAULT NULL,
  `alamat` TEXT DEFAULT NULL,
  `nama_ayah` VARCHAR(100) DEFAULT NULL,
  `nama_ibu` VARCHAR(100) DEFAULT NULL,
  `no_hp_ortu` VARCHAR(30) DEFAULT NULL,
  `tanggal_masuk` DATE DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `kelas_id` INT(11) DEFAULT NULL,
  `metode_id` INT(11) DEFAULT NULL,
  `jilid_id` INT(11) DEFAULT NULL,
  `status` ENUM('aktif','lulus','pindah','nonaktif') NOT NULL DEFAULT 'aktif',
  `username` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `santri` (`id`, `nis`, `nama_lengkap`, `nama_panggilan`, `jk`, `tempat_lahir`, `tanggal_lahir`, `alamat`, `nama_ayah`, `nama_ibu`, `no_hp_ortu`, `tanggal_masuk`, `kelas_id`, `metode_id`, `jilid_id`, `status`, `username`, `password`) VALUES
(1, '2025001', 'Muhammad Rayhan Pratama', 'Rayhan', 'L', 'Malang', '2017-06-12', 'Dusun Ngujung RT 02 / RW 02 Toyomarto, Singosari', 'Budi Santoso', 'Siti Rohmah', '0812-3456-7801', '2023-07-15', 1, 1, 3, 'aktif', 'santri1', 'password123'),
(2, '2025002', 'Aisyah Nur Kamila', 'Kamila', 'P', 'Malang', '2016-11-04', 'Jl. Patih RT 01 / RW 02 Toyomarto, Singosari', 'Ahmad Fauzi', 'Nur Laili', '0813-9876-5402', '2023-07-15', 2, 2, 8, 'aktif', 'santri2', 'password123'),
(3, '2025003', 'Fathan Al-Ghifari', 'Fathan', 'L', 'Surabaya', '2015-08-20', 'Perumahan Singosari Permai Blok C4', 'Rahmat Hidayat', 'Dewi Sartika', '0857-1122-3303', '2022-07-10', 3, 3, 11, 'aktif', 'santri3', 'password123');

-- --------------------------------------------------------
-- 9. Table structure for table `komponen_penilaian`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `komponen_penilaian`;
CREATE TABLE `komponen_penilaian` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL,
  `bobot` INT(11) NOT NULL DEFAULT 15,
  `urutan` INT(11) NOT NULL DEFAULT 1,
  `kategori` VARCHAR(50) DEFAULT 'Al-Quran & Tajwid',
  `is_aktif` TINYINT(1) NOT NULL DEFAULT 1,
  `show_in_rapor` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `komponen_penilaian` (`id`, `nama`, `bobot`, `urutan`, `kategori`, `is_aktif`, `show_in_rapor`) VALUES
(1, 'Kelancaran Membaca', 20, 1, 'Al-Quran & Tajwid', 1, 1),
(2, 'Tajwid & Makhorijul Huruf', 20, 2, 'Al-Quran & Tajwid', 1, 1),
(3, 'Fashohah & Irama (Tartil)', 15, 3, 'Al-Quran & Tajwid', 1, 1),
(4, 'Hafalan Surat Pendek', 15, 4, 'Hafalan', 1, 1),
(5, 'Praktik Ibadah & Doa Harian', 15, 5, 'Praktik Ibadah', 1, 1),
(6, 'Adab, Akhlak & Kedisiplinan', 15, 6, 'Akhlak & Adab', 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
