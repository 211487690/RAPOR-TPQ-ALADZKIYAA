import { LembagaProfile } from '../types';

const escPhpStr = (val?: string): string =>
  (val || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export const phpTemplates = {
  // 1. Config Database PDO & Global Helpers
  getDatabaseConfigPHP(lembaga: LembagaProfile): string {
    const nama = escPhpStr(lembaga.nama || 'TPQ Al-Adzkiyaa’');
    const yayasan = escPhpStr(lembaga.yayasan || 'Yayasan Pendidikan Al Ma\'arif Miftahul Huda Singosari');
    const nstpq = escPhpStr(lembaga.nstpq || lembaga.nspq || '');
    const telepon = escPhpStr(lembaga.telepon || '');
    const website = escPhpStr(lembaga.website || '');
    const alamat = escPhpStr(lembaga.alamat || '');
    const kota = escPhpStr(lembaga.kota || 'Kabupaten Malang');
    const kepalaTpq = escPhpStr(lembaga.kepalaTpq || 'Kepala TPQ');
    const nipKepala = escPhpStr(lembaga.nipKepala || '');
    const kotaPenerbitan = escPhpStr(lembaga.kotaPenerbitan || 'Malang');
    const footnote = escPhpStr(lembaga.footnote || 'Copyright © Umar Izzularab 2026 All Rights Reserved');

    return `<?php
/**
 * Konfigurasi Database PDO & Helper Global - RAPOR TPQ AL-ADZKIYAA’
 * Mendukung MySQL 8+ & MariaDB 10.4+ dengan Prepared Statements (PHP 8+)
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
    die(
        '<div style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:24px;border:1px solid #fecaca;background:#fef2f2;border-radius:12px;color:#991b1b;">'
        . '<h3 style="margin-top:0;">Koneksi Database Gagal</h3>'
        . '<p style="font-size:14px;">' . htmlspecialchars($e->getMessage()) . '</p>'
        . '<p style="font-size:13px;color:#7f1d1d;margin-bottom:0;">Pastikan Anda sudah mengimpor <code>database.sql</code> di phpMyAdmin dan mengatur kredensial pada file <code>config/database.php</code>.</p>'
        . '</div>'
    );
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function check_auth($roles = []) {
    if (!isset($_SESSION['user'])) {
        header("Location: index.php");
        exit();
    }
    if (!empty($roles) && !in_array($_SESSION['user']['role'], $roles, true)) {
        $target = ($_SESSION['user']['role'] === 'santri') ? 'profil_santri.php?error=unauthorized' : 'dashboard.php?error=unauthorized';
        header("Location: " . $target);
        exit();
    }
}

function resolve_logo_url($rawUrl) {
    $defaultLogo = 'assets/img/logo-tpq.png';
    $rawUrl = trim((string)$rawUrl);
    if ($rawUrl === '' || strpos($rawUrl, '/assets/aistudio/') !== false) {
        return $defaultLogo;
    }
    if (preg_match('/^(https?:\\/\\/|data:image\\/)/i', $rawUrl)) {
        return $rawUrl;
    }
    $cleanRel = ltrim($rawUrl, '/');
    if (file_exists(__DIR__ . '/../' . $cleanRel)) {
        return $cleanRel;
    }
    return $defaultLogo;
}

function get_lembaga($pdo) {
    static $cached = null;
    if ($cached !== null) return $cached;

    $defaults = [
        'id' => 1,
        'nama' => '${nama}',
        'yayasan' => '${yayasan}',
        'nstpq' => '${nstpq}',
        'nspq' => '${nstpq}',
        'telepon' => '${telepon}',
        'website' => '${website}',
        'alamat' => '${alamat}',
        'kelurahan' => '',
        'kecamatan' => '',
        'kota' => '${kota}',
        'provinsi' => 'Jawa Timur',
        'kepala_tpq' => '${kepalaTpq}',
        'nip_kepala' => '${nipKepala}',
        'jabatan_penandatangan' => 'Kepala TPQ',
        'kota_penerbitan' => '${kotaPenerbitan}',
        'logo_url' => 'assets/img/logo-tpq.png',
        'footnote' => '${footnote}'
    ];

    try {
        $row = $pdo->query("SELECT * FROM lembaga WHERE id = 1 LIMIT 1")->fetch();
        if ($row) {
            $cached = array_merge($defaults, $row);
        } else {
            $cached = $defaults;
        }
        $setFoot = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'footer_text' LIMIT 1")->fetchColumn();
        if ($setFoot) {
            $cached['footnote'] = $setFoot;
        }
    } catch (Throwable $e) {
        $cached = $defaults;
    }

    if (empty($cached['nstpq']) && !empty($cached['nspq'])) {
        $cached['nstpq'] = $cached['nspq'];
    }
    $cached['logo_url'] = resolve_logo_url($cached['logo_url'] ?? '');
    return $cached;
}

function format_tgl_indo($tgl) {
    $tgl = trim((string)$tgl);
    if ($tgl === '') {
        $tgl = date('Y-m-d');
    }
    if (preg_match('/^(\\d{4})-(\\d{2})-(\\d{2})$/', $tgl, $m)) {
        $bulan = [
            '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
            '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
            '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember'
        ];
        $b = $bulan[$m[2]] ?? $m[2];
        return ((int)$m[3]) . ' ' . $b . ' ' . $m[1];
    }
    return $tgl;
}

function hitung_predikat($nilai, $bobotList = []) {
    if (!empty($bobotList)) {
        foreach ($bobotList as $b) {
            if ($nilai >= (float)$b['min_score'] && $nilai <= (float)$b['max_score']) {
                return ['predikat' => $b['predikat'], 'label' => $b['label']];
            }
        }
    }
    if ($nilai >= 86) return ['predikat' => 'A', 'label' => 'Sangat Baik (Mumtaz)'];
    if ($nilai >= 76) return ['predikat' => 'B', 'label' => 'Baik (Jayyid Jiddan)'];
    if ($nilai >= 65) return ['predikat' => 'C', 'label' => 'Cukup (Jayyid)'];
    return ['predikat' => 'D', 'label' => 'Perlu Bimbingan (Maqbul)'];
}

function find_santri_id_for_user($pdo, $user) {
    $ref = trim((string)($user['ref_id'] ?? ''));
    if ($ref !== '') {
        if (ctype_digit($ref)) {
            $stmt = $pdo->prepare("SELECT id FROM santri WHERE id = ? LIMIT 1");
            $stmt->execute([(int)$ref]);
            $id = $stmt->fetchColumn();
            if ($id) return (int)$id;
        }
        if (preg_match('/(\\d+)$/', $ref, $m)) {
            $stmt = $pdo->prepare("SELECT id FROM santri WHERE id = ? LIMIT 1");
            $stmt->execute([(int)$m[1]]);
            $id = $stmt->fetchColumn();
            if ($id) return (int)$id;
        }
    }
    if (!empty($user['username'])) {
        $stmt = $pdo->prepare("SELECT id FROM santri WHERE username = ? OR nis = ? LIMIT 1");
        $stmt->execute([$user['username'], $user['username']]);
        $id = $stmt->fetchColumn();
        if ($id) return (int)$id;
    }
    return (int)($pdo->query("SELECT id FROM santri ORDER BY id ASC LIMIT 1")->fetchColumn() ?: 0);
}

$lembaga = get_lembaga($pdo);
?>`;
  },

  // 2. Login Page (index.php)
  getIndexPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';

if (isset($_SESSION['user'])) {
    header("Location: " . ($_SESSION['user']['role'] === 'santri' ? 'profil_santri.php' : 'dashboard.php'));
    exit();
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username && $password) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && ($user['password'] === md5($password) || password_verify($password, $user['password']))) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'nama' => $user['nama'],
                'role' => $user['role'],
                'ref_id' => $user['ref_id']
            ];
            $target = ($user['role'] === 'santri') ? 'profil_santri.php' : 'dashboard.php';
            header("Location: " . $target);
            exit();
        } else {
            $error = 'Username atau Password salah!';
        }
    } else {
        $error = 'Silakan masukkan username dan kata sandi.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RAPOR <?= htmlspecialchars($lembaga['nama']) ?> - Masuk</title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-light d-flex align-items-center min-vh-100">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="card shadow border-0 rounded-4 overflow-hidden">
                <div class="card-body p-4 p-md-5">
                    <div class="text-center mb-4">
                        <div class="mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 96px; height: 96px;">
                            <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo <?= htmlspecialchars($lembaga['nama']) ?>" class="img-fluid rounded-3" style="max-height: 92px; max-width: 92px; object-fit: contain;" onerror="this.style.display='none';document.getElementById('logoFallback').classList.remove('d-none');">
                            <div id="logoFallback" class="d-none bg-success-subtle rounded-circle d-flex align-items-center justify-content-center text-success" style="width: 84px; height: 84px;">
                                <i class="bi bi-book-half fs-1"></i>
                            </div>
                        </div>
                        <h4 class="fw-bold text-success mb-1"><?= htmlspecialchars($lembaga['nama']) ?></h4>
                        <p class="text-muted small mb-1"><?= htmlspecialchars($lembaga['yayasan']) ?></p>
                        <?php if (!empty($lembaga['nstpq'])): ?>
                            <div class="text-muted" style="font-size: 11px;">NSTPQ: <?= htmlspecialchars($lembaga['nstpq']) ?></div>
                        <?php endif; ?>
                        <span class="badge bg-success-subtle text-success mt-2 px-3 py-1">Sistem Rapor &amp; Akademik Digital</span>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger py-2 px-3 small rounded-3"><?= htmlspecialchars($error) ?></div>
                    <?php endif; ?>

                    <form method="POST" action="index.php">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Username Login</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white"><i class="bi bi-person text-muted"></i></span>
                                <input type="text" name="username" class="form-control" placeholder="Masukkan username" required autofocus>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-semibold">Kata Sandi (Password)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white"><i class="bi bi-lock text-muted"></i></span>
                                <input type="password" name="password" class="form-control" placeholder="Masukkan password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success w-100 py-2 fw-semibold rounded-3">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk ke Sistem
                        </button>
                    </form>
                </div>
                <div class="card-footer bg-light border-0 text-center py-3">
                    <small class="text-muted" style="font-size: 11px;"><?= htmlspecialchars($lembaga['footnote']) ?></small>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`;
  },

  // 3. Dashboard PHP with Logo Banner, Grade Progress Card & Charts
  getDashboardPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz', 'santri']);

if ($_SESSION['user']['role'] === 'santri') {
    header("Location: profil_santri.php");
    exit();
}

$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: [
    'id' => 1, 'tahun' => '2025/2026', 'semester_aktif' => 'Ganjil'
];

// Statistik Dasar
$totalSantri = (int)$pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif'")->fetchColumn();
$santriL = (int)$pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif' AND jk = 'L'")->fetchColumn();
$santriP = (int)$pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif' AND jk = 'P'")->fetchColumn();
$totalUstadz = (int)$pdo->query("SELECT COUNT(*) FROM ustadz WHERE status = 'aktif'")->fetchColumn();
$totalKelas = (int)$pdo->query("SELECT COUNT(*) FROM kelas")->fetchColumn();

$stmtDinilai = $pdo->prepare("SELECT COUNT(DISTINCT n.santri_id) FROM nilai n INNER JOIN santri s ON n.santri_id = s.id WHERE s.status = 'aktif' AND n.tahun_id = ? AND n.semester = ?");
$stmtDinilai->execute([(int)$tahunAktif['id'], $tahunAktif['semester_aktif']]);
$santriDinilai = (int)$stmtDinilai->fetchColumn();
$santriBelum = max(0, $totalSantri - $santriDinilai);
$persenPenilaian = $totalSantri > 0 ? round(($santriDinilai / $totalSantri) * 100) : 0;

// Data Jilid Aktif untuk Bar Chart
$jilidStats = $pdo->query("SELECT j.nama, COUNT(s.id) as total FROM jilid j LEFT JOIN santri s ON j.id = s.jilid_id AND s.status = 'aktif' GROUP BY j.id, j.nama ORDER BY j.urutan ASC")->fetchAll();
$jilidLabels = json_encode(array_column($jilidStats, 'nama'));
$jilidTotals = json_encode(array_map('intval', array_column($jilidStats, 'total')));

// Data Kelas untuk Bar Chart
$kelasStats = $pdo->query("SELECT k.nama_kelas, COUNT(s.id) as total FROM kelas k LEFT JOIN santri s ON k.id = s.kelas_id AND s.status = 'aktif' GROUP BY k.id, k.nama_kelas ORDER BY k.urutan ASC")->fetchAll();
$kelasLabels = json_encode(array_column($kelasStats, 'nama_kelas'));
$kelasTotals = json_encode(array_map('intval', array_column($kelasStats, 'total')));
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beranda - RAPOR <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>

    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>

        <div class="container-fluid p-4 flex-grow-1">
            <?php if (isset($_GET['error']) && $_GET['error'] === 'unauthorized'): ?>
                <div class="alert alert-warning alert-dismissible fade show py-2 small" role="alert">
                    <i class="bi bi-shield-exclamation me-1"></i> Anda tidak memiliki izin untuk mengakses halaman tersebut sesuai peran akun Anda.
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- Banner Lembaga dengan Logo -->
            <div class="card border-0 text-white rounded-4 p-4 mb-4 shadow-sm" style="background: linear-gradient(135deg, #065f46 0%, #059669 50%, #0f766e 100%);">
                <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-white bg-opacity-20 rounded-3 p-2 d-flex align-items-center justify-content-center shrink-0" style="width: 68px; height: 68px;">
                            <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo TPQ" class="img-fluid" style="max-height: 54px; max-width: 54px; object-fit: contain;" onerror="this.style.display='none';">
                        </div>
                        <div>
                            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <span class="badge bg-black bg-opacity-25 px-2 py-1">SEMESTER <?= strtoupper(htmlspecialchars($tahunAktif['semester_aktif'])) ?></span>
                                <span class="small text-white-50">Tahun Pelajaran <?= htmlspecialchars($tahunAktif['tahun']) ?></span>
                                <?php if (!empty($lembaga['nstpq'])): ?>
                                    <span class="small text-white-50">· NSTPQ: <?= htmlspecialchars($lembaga['nstpq']) ?></span>
                                <?php endif; ?>
                            </div>
                            <h2 class="fw-bold mb-1 fs-3"><?= htmlspecialchars($lembaga['nama']) ?></h2>
                            <p class="small mb-0 text-white-50"><?= htmlspecialchars($lembaga['yayasan']) ?> · <?= htmlspecialchars($lembaga['alamat']) ?>, <?= htmlspecialchars($lembaga['kota']) ?></p>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <?php if (in_array($_SESSION['user']['role'], ['admin', 'ustadz'])): ?>
                            <a href="isi_nilai.php" class="btn btn-light btn-sm fw-semibold text-success px-3"><i class="bi bi-pencil-square me-1"></i> Input Nilai</a>
                        <?php endif; ?>
                        <a href="kumpulan_nilai.php" class="btn btn-outline-light btn-sm fw-semibold px-3"><i class="bi bi-table me-1"></i> Leger &amp; Ranking</a>
                        <a href="rapor.php" class="btn btn-outline-light btn-sm fw-semibold px-3"><i class="bi bi-printer me-1"></i> Cetak Rapor</a>
                    </div>
                </div>
            </div>

            <!-- Kartu Statistik -->
            <div class="row g-3 mb-4">
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3 h-100">
                        <div class="text-muted small">Total Santri Aktif</div>
                        <h2 class="fw-bold text-success mb-0"><?= $totalSantri ?></h2>
                        <div class="text-muted small mt-1"><?= $santriL ?> Laki-laki · <?= $santriP ?> Perempuan</div>
                    </div>
                </div>
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3 h-100">
                        <div class="text-muted small">Ustadz / Ustadzah</div>
                        <h2 class="fw-bold text-primary mb-0"><?= $totalUstadz ?></h2>
                        <div class="text-muted small mt-1">Tenaga Pendidik Aktif</div>
                    </div>
                </div>
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3 h-100">
                        <div class="text-muted small">Halaqoh Belajar</div>
                        <h2 class="fw-bold text-info mb-0"><?= $totalKelas ?></h2>
                        <div class="text-muted small mt-1">Kelompok Kelas</div>
                    </div>
                </div>
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3 h-100">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="text-muted small">Ketuntasan Penilaian</div>
                            <span class="badge bg-success-subtle text-success fw-bold"><?= $persenPenilaian ?>%</span>
                        </div>
                        <h2 class="fw-bold text-warning mb-1"><?= $santriDinilai ?> / <?= $totalSantri ?></h2>
                        <div class="progress" style="height: 7px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: <?= $persenPenilaian ?>%" aria-valuenow="<?= $persenPenilaian ?>" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="text-muted mt-1" style="font-size: 11px;"><?= $santriBelum ?> santri belum dinilai semester ini</div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="row g-4 mb-4">
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm rounded-3 p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 class="fw-bold text-dark mb-0">Distribusi Santri Berdasarkan Jilid Aktif</h5>
                                <small class="text-muted">Pemantauan kemajuan pembelajaran santri per tingkat jilid</small>
                            </div>
                            <?php if (in_array($_SESSION['user']['role'], ['admin', 'ustadz'])): ?>
                                <a href="kenaikan_jilid.php" class="btn btn-outline-success btn-sm">Kenaikan Jilid →</a>
                            <?php endif; ?>
                        </div>
                        <div style="height: 260px;">
                            <canvas id="jilidChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-lg-5">
                    <div class="card border-0 shadow-sm rounded-3 p-4 h-100">
                        <h5 class="fw-bold text-dark mb-0">Distribusi Santri per Kelas</h5>
                        <small class="text-muted mb-3 d-block">Jumlah anggota di setiap halaqoh</small>
                        <div style="height: 260px;">
                            <canvas id="kelasChart"></canvas>
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

<script>
const ctxJilid = document.getElementById('jilidChart').getContext('2d');
new Chart(ctxJilid, {
    type: 'bar',
    data: {
        labels: <?= $jilidLabels ?>,
        datasets: [{
            label: 'Jumlah Santri',
            data: <?= $jilidTotals ?>,
            backgroundColor: '#059669',
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
});

const ctxKelas = document.getElementById('kelasChart').getContext('2d');
new Chart(ctxKelas, {
    type: 'bar',
    data: {
        labels: <?= $kelasLabels ?>,
        datasets: [{
            label: 'Jumlah Santri',
            data: <?= $kelasTotals ?>,
            backgroundColor: '#0284c7',
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
});
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 4. Leger Nilai & Ranking Kelas (kumpulan_nilai.php)
  getKumpulanNilaiPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: ['id' => 1, 'tahun' => '2025/2026', 'semester_aktif' => 'Ganjil'];
$tahunList = $pdo->query("SELECT * FROM tahun_pelajaran ORDER BY tahun DESC")->fetchAll();
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$komponenList = $pdo->query("SELECT * FROM komponen_penilaian WHERE is_aktif = 1 ORDER BY urutan ASC")->fetchAll();
$bobotList = $pdo->query("SELECT * FROM bobot_penilaian ORDER BY min_score DESC")->fetchAll();

$tahunId = isset($_GET['tahun_id']) ? (int)$_GET['tahun_id'] : (int)$tahunAktif['id'];
$semester = isset($_GET['semester']) && in_array($_GET['semester'], ['Ganjil', 'Genap'], true) ? $_GET['semester'] : $tahunAktif['semester_aktif'];
$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);
$searchQuery = trim($_GET['q'] ?? '');
$statusFilter = $_GET['status_nilai'] ?? 'all';

$stmtCurKelas = $pdo->prepare("SELECT k.*, u.nama AS wali_nama FROM kelas k LEFT JOIN ustadz u ON k.ustadz_id = u.id WHERE k.id = ?");
$stmtCurKelas->execute([$kelasId]);
$curKelas = $stmtCurKelas->fetch();

$stmtSantri = $pdo->prepare("SELECT * FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
$stmtSantri->execute([$kelasId]);
$santriList = $stmtSantri->fetchAll();

$stmtNilai = $pdo->prepare("SELECT santri_id, komponen_id, nilai_angka FROM nilai WHERE tahun_id = ? AND semester = ?");
$stmtNilai->execute([$tahunId, $semester]);
$nilaiMap = [];
foreach ($stmtNilai->fetchAll() as $n) {
    $nilaiMap[$n['santri_id']][$n['komponen_id']] = (float)$n['nilai_angka'];
}

$ranked = [];
foreach ($santriList as $s) {
    $totalBobotNilai = 0;
    $totalBobot = 0;
    $compScores = [];
    $hasScore = false;

    foreach ($komponenList as $comp) {
        $hasComp = isset($nilaiMap[$s['id']][$comp['id']]);
        if ($hasComp) $hasScore = true;
        $score = $hasComp ? $nilaiMap[$s['id']][$comp['id']] : 0;
        $compScores[$comp['id']] = $hasComp ? $score : null;
        $totalBobotNilai += ($score * ($comp['bobot'] / 100));
        $totalBobot += $comp['bobot'];
    }

    $rataRata = ($totalBobot > 0 && $hasScore) ? round(($totalBobotNilai / ($totalBobot / 100)), 1) : 0;
    $pred = hitung_predikat($rataRata, $bobotList);

    $ranked[] = [
        'santri' => $s,
        'scores' => $compScores,
        'has_score' => $hasScore,
        'rata_rata' => $rataRata,
        'predikat' => $hasScore ? $pred['predikat'] : '-',
        'label' => $hasScore ? $pred['label'] : 'Belum Dinilai'
    ];
}

usort($ranked, function($a, $b) {
    if ($b['rata_rata'] == $a['rata_rata']) return strcmp($a['santri']['nama_lengkap'], $b['santri']['nama_lengkap']);
    return ($b['rata_rata'] > $a['rata_rata']) ? 1 : -1;
});

foreach ($ranked as $idx => &$item) {
    $item['ranking'] = $idx + 1;
}
unset($item);

$filteredRanked = array_values(array_filter($ranked, function($r) use ($searchQuery, $statusFilter) {
    if ($searchQuery !== '') {
        $matchName = stripos($r['santri']['nama_lengkap'], $searchQuery) !== false;
        $matchNis = stripos($r['santri']['nis'], $searchQuery) !== false;
        if (!$matchName && !$matchNis) return false;
    }
    if ($statusFilter === 'dinilai' && !$r['has_score']) return false;
    if ($statusFilter === 'belum' && $r['has_score']) return false;
    return true;
}));

if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=Leger_Nilai_Kelas_' . preg_replace('/\\s+/', '_', $curKelas['nama_kelas'] ?? 'Kelas') . '.csv');
    echo "\\xEF\\xBB\\xBF";
    $out = fopen('php://output', 'w');
    fputcsv($out, ['No', 'Rank', 'NIS', 'Nama Santri', 'Rata-rata', 'Predikat', 'Capaian']);
    foreach ($filteredRanked as $i => $r) {
        fputcsv($out, [$i + 1, $r['ranking'], $r['santri']['nis'], $r['santri']['nama_lengkap'], $r['rata_rata'], $r['predikat'], $r['label']]);
    }
    fclose($out);
    exit();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leger Nilai &amp; Ranking Kelas - <?= htmlspecialchars($lembaga['nama']) ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        @media print {
            #sidebar-wrapper, .navbar, .no-print { display: none !important; }
            body, #page-content-wrapper { padding: 0 !important; background: #fff !important; }
            @page { size: A4 landscape; margin: 10mm; }
        }
    </style>
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div id="page-content-wrapper" class="flex-grow-1 min-w-0 d-flex flex-column min-vh-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4 flex-grow-1">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
                <div>
                    <h3 class="fw-bold mb-0">Leger Kumpulan Nilai &amp; Ranking Kelas</h3>
                    <p class="text-muted small mb-0">Rekapitulasi lengkap nilai komponen, ranking kelas, dan cetak rapor cepat</p>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <a href="rapor.php?massal=1&kelas_id=<?= $kelasId ?>&tahun_id=<?= $tahunId ?>&semester=<?= urlencode($semester) ?>" target="_blank" class="btn btn-outline-primary btn-sm"><i class="bi bi-printer-fill me-1"></i> Cetak Rapor Massal Kelas</a>
                    <a href="kumpulan_nilai.php?tahun_id=<?= $tahunId ?>&semester=<?= urlencode($semester) ?>&kelas_id=<?= $kelasId ?>&q=<?= urlencode($searchQuery) ?>&status_nilai=<?= urlencode($statusFilter) ?>&export=csv" class="btn btn-outline-success btn-sm"><i class="bi bi-file-earmark-excel me-1"></i> Export CSV</a>
                    <button onclick="window.print()" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Cetak Leger</button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="card border-0 shadow-sm p-3 mb-4 rounded-3 no-print">
                <form method="GET" action="kumpulan_nilai.php" class="row g-2 align-items-center small">
                    <div class="col-md-3">
                        <label class="form-label fw-semibold mb-1">Kelas / Halaqoh</label>
                        <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                            <?php foreach ($kelasList as $k): ?>
                                <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasId ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-semibold mb-1">Semester</label>
                        <select name="semester" class="form-select form-select-sm" onchange="this.form.submit()">
                            <option value="Ganjil" <?= $semester === 'Ganjil' ? 'selected' : '' ?>>Ganjil</option>
                            <option value="Genap" <?= $semester === 'Genap' ? 'selected' : '' ?>>Genap</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-semibold mb-1">Status Penilaian</label>
                        <select name="status_nilai" class="form-select form-select-sm" onchange="this.form.submit()">
                            <option value="all" <?= $statusFilter === 'all' ? 'selected' : '' ?>>Semua Status</option>
                            <option value="dinilai" <?= $statusFilter === 'dinilai' ? 'selected' : '' ?>>Sudah Dinilai</option>
                            <option value="belum" <?= $statusFilter === 'belum' ? 'selected' : '' ?>>Belum Dinilai</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold mb-1">Cari Santri / NIS</label>
                        <div class="input-group input-group-sm">
                            <input type="text" name="q" value="<?= htmlspecialchars($searchQuery) ?>" class="form-control" placeholder="Nama atau NIS...">
                            <button class="btn btn-success" type="submit"><i class="bi bi-search"></i></button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Print Header -->
            <div class="d-none d-print-block text-center mb-3 border-bottom pb-2">
                <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo" style="height: 48px;" class="mb-1">
                <h4 class="fw-bold mb-0"><?= strtoupper(htmlspecialchars($lembaga['nama'])) ?></h4>
                <div class="small">NSTPQ: <?= htmlspecialchars($lembaga['nstpq']) ?> · DAFTAR KUMPULAN NILAI &amp; PERINGKAT SANTRI</div>
                <div class="small text-muted">Kelas: <?= htmlspecialchars($curKelas['nama_kelas'] ?? '-') ?> | Wali: <?= htmlspecialchars($curKelas['wali_nama'] ?? '-') ?> | Semester <?= htmlspecialchars($semester) ?></div>
            </div>

            <!-- Tabel Leger -->
            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover align-middle mb-0 small text-center">
                            <thead class="table-dark text-white">
                                <tr>
                                    <th style="width: 40px;">No</th>
                                    <th style="width: 65px;">Rank</th>
                                    <th style="width: 90px;">NIS</th>
                                    <th class="text-start">Nama Santri</th>
                                    <?php foreach ($komponenList as $c): ?>
                                        <th style="width: 85px;" title="<?= htmlspecialchars($c['nama']) ?>"><?= htmlspecialchars(mb_substr($c['nama'], 0, 12)) ?></th>
                                    <?php endforeach; ?>
                                    <th style="width: 85px;" class="bg-success">Rata-rata</th>
                                    <th style="width: 65px;" class="bg-success">Predikat</th>
                                    <th class="text-start">Capaian Belajar</th>
                                    <th class="no-print" style="width: 95px;">Rapor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($filteredRanked)): ?>
                                    <tr><td colspan="<?= 8 + count($komponenList) ?>" class="py-4 text-muted">Tidak ada data nilai santri yang sesuai filter.</td></tr>
                                <?php else: foreach ($filteredRanked as $idx => $r): ?>
                                    <tr class="<?= $r['ranking'] === 1 && $r['has_score'] ? 'table-warning' : '' ?>">
                                        <td><?= $idx + 1 ?></td>
                                        <td>
                                            <?php if (!$r['has_score']): ?>
                                                <span class="text-muted">-</span>
                                            <?php elseif ($r['ranking'] === 1): ?><span class="badge bg-warning text-dark fw-bold">★ 1</span>
                                            <?php elseif ($r['ranking'] === 2): ?><span class="badge bg-secondary fw-bold">★ 2</span>
                                            <?php elseif ($r['ranking'] === 3): ?><span class="badge bg-warning-subtle text-warning-emphasis fw-bold">★ 3</span>
                                            <?php else: ?><?= $r['ranking'] ?><?php endif; ?>
                                        </td>
                                        <td class="font-monospace"><?= htmlspecialchars($r['santri']['nis']) ?></td>
                                        <td class="text-start fw-bold"><?= htmlspecialchars($r['santri']['nama_lengkap']) ?></td>
                                        <?php foreach ($komponenList as $c): ?>
                                            <td><?= $r['scores'][$c['id']] !== null ? $r['scores'][$c['id']] : '-' ?></td>
                                        <?php endforeach; ?>
                                        <td class="fw-bold text-success fs-6"><?= $r['has_score'] ? $r['rata_rata'] : '-' ?></td>
                                        <td class="fw-bold"><?= $r['predikat'] ?></td>
                                        <td class="text-start">
                                            <span class="badge <?= $r['has_score'] ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary' ?>"><?= htmlspecialchars($r['label']) ?></span>
                                        </td>
                                        <td class="no-print">
                                            <a href="rapor.php?santri_id=<?= $r['santri']['id'] ?>" target="_blank" class="btn btn-outline-success btn-sm py-0 px-2"><i class="bi bi-printer me-1"></i>Rapor</a>
                                        </td>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto no-print">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 5. Piagam Penghargaan Juara Kelas (piagam.php) - Dynamic from DB + Logo + NSTPQ + Clean Print
  getPiagamPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: ['id' => 1, 'tahun' => '2025/2026', 'semester_aktif' => 'Ganjil', 'tgl_rapor_ganjil' => date('Y-m-d'), 'tgl_rapor_genap' => date('Y-m-d')];
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();

$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);
$santriId = isset($_GET['santri_id']) ? (int)$_GET['santri_id'] : 0;
$juara = isset($_GET['juara']) ? (int)$_GET['juara'] : 1;
$orientation = isset($_GET['orient']) && $_GET['orient'] === 'portrait' ? 'portrait' : 'landscape';

$santriList = [];
if ($kelasId > 0) {
    $stmt = $pdo->prepare("SELECT * FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
    $stmt->execute([$kelasId]);
    $santriList = $stmt->fetchAll();
    if ($santriId === 0 && !empty($santriList)) {
        $santriId = (int)$santriList[0]['id'];
    }
}

$selectedSantri = null;
if ($santriId > 0) {
    $stmt = $pdo->prepare("SELECT s.*, k.nama_kelas, u.nama AS wali_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id WHERE s.id = ?");
    $stmt->execute([$santriId]);
    $selectedSantri = $stmt->fetch();
}

$juaraText = $juara === 1 ? 'JUARA I (PERTAMA)' : ($juara === 2 ? 'JUARA II (KEDUA)' : 'JUARA III (KETIGA)');
$tglRaw = ($tahunAktif['semester_aktif'] === 'Genap') ? ($tahunAktif['tgl_rapor_genap'] ?? date('Y-m-d')) : ($tahunAktif['tgl_rapor_ganjil'] ?? date('Y-m-d'));
$tglCetak = format_tgl_indo($tglRaw);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Piagam Penghargaan - <?= htmlspecialchars($selectedSantri['nama_lengkap'] ?? 'Santri') ?></title>
    <link rel="icon" type="image/png" href="<?= htmlspecialchars($lembaga['logo_url']) ?>">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .cert-container {
            border: 8px double #059669;
            padding: 28px 34px;
            background: #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            margin: 0 auto;
            box-sizing: border-box;
            overflow: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .cert-landscape { width: 100%; max-width: 960px; min-height: 600px; }
        .cert-portrait { width: 100%; max-width: 680px; min-height: 880px; }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0 !important; background: #fff !important; margin: 0 !important; }
            .container-fluid { padding: 0 !important; }
            .cert-container {
                box-shadow: none !important;
                border: 8px double #059669 !important;
                max-width: 100% !important;
                width: 100% !important;
                min-height: auto !important;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            @page {
                size: <?= $orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape' ?>;
                margin: 8mm;
            }
        }
    </style>
</head>
<body class="bg-light p-3">
<div class="container-fluid">
    <!-- Controls Bar -->
    <div class="card border-0 shadow-sm p-3 mb-4 rounded-3 no-print mx-auto" style="max-width: 960px;">
        <form method="GET" action="piagam.php" class="row g-2 align-items-center small">
            <div class="col-auto"><label class="fw-semibold">Kelas:</label></div>
            <div class="col-auto">
                <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                    <?php foreach ($kelasList as $k): ?>
                        <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasId ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-auto"><label class="fw-semibold">Santri:</label></div>
            <div class="col-auto">
                <select name="santri_id" class="form-select form-select-sm" onchange="this.form.submit()">
                    <?php foreach ($santriList as $s): ?>
                        <option value="<?= $s['id'] ?>" <?= $s['id'] == $santriId ? 'selected' : '' ?>><?= htmlspecialchars($s['nama_lengkap']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-auto"><label class="fw-semibold">Peringkat:</label></div>
            <div class="col-auto">
                <select name="juara" class="form-select form-select-sm" onchange="this.form.submit()">
                    <option value="1" <?= $juara == 1 ? 'selected' : '' ?>>Juara 1</option>
                    <option value="2" <?= $juara == 2 ? 'selected' : '' ?>>Juara 2</option>
                    <option value="3" <?= $juara == 3 ? 'selected' : '' ?>>Juara 3</option>
                </select>
            </div>
            <div class="col-auto ms-auto d-flex flex-wrap gap-2">
                <a href="piagam.php?kelas_id=<?= $kelasId ?>&santri_id=<?= $santriId ?>&juara=<?= $juara ?>&orient=<?= $orientation === 'portrait' ? 'landscape' : 'portrait' ?>" class="btn btn-outline-secondary btn-sm">
                    Mode: <?= ucfirst($orientation) ?> (Ganti)
                </a>
                <button type="button" onclick="window.print()" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Cetak Piagam</button>
                <a href="dashboard.php" class="btn btn-light border btn-sm">Kembali</a>
            </div>
        </form>
    </div>

    <!-- Certificate Sheet -->
    <div class="cert-container <?= $orientation === 'portrait' ? 'cert-portrait' : 'cert-landscape' ?> text-center d-flex flex-column justify-content-between">
        <div>
            <!-- Indonesian Bismillah (Strict No Arabic) -->
            <div class="fw-bold text-success mb-2 text-uppercase" style="font-size: 11px; letter-spacing: 1.5px; color: #059669;">
                DENGAN MENYEBUT NAMA ALLAH YANG MAHA PENGASIH LAGI MAHA PENYAYANG
            </div>

            <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
                <img src="<?= htmlspecialchars($lembaga['logo_url']) ?>" alt="Logo TPQ" style="height: 58px; width: 58px; object-fit: contain;" onerror="this.style.display='none';">
                <div class="text-start">
                    <div class="text-uppercase fw-bold text-muted" style="font-size: 12px;"><?= htmlspecialchars($lembaga['yayasan']) ?></div>
                    <h4 class="fw-bold text-success text-uppercase mb-0" style="letter-spacing: 0.8px;"><?= htmlspecialchars($lembaga['nama']) ?></h4>
                    <div class="small text-muted" style="font-size: 11px;">NSTPQ: <?= htmlspecialchars($lembaga['nstpq']) ?> · <?= htmlspecialchars($lembaga['alamat']) ?>, <?= htmlspecialchars($lembaga['kota']) ?></div>
                </div>
            </div>

            <hr class="w-75 mx-auto border-success my-2" style="border-width: 2px;">

            <h2 class="fw-bold text-dark mt-3 mb-1" style="font-family: Georgia, serif; letter-spacing: 2px;">PIAGAM PENGHARGAAN</h2>
            <div class="text-muted small font-monospace">Nomor: PG/TPQ-ADZ/<?= date('Y') ?>/<?= str_pad((string)$santriId, 3, '0', STR_PAD_LEFT) ?></div>

            <p class="mt-3 mb-1 small text-muted">Diberikan dengan penuh rasa bangga dan apresiasi kepada:</p>
            <h2 class="fw-bold text-success text-uppercase my-2 px-2" style="font-family: Georgia, serif; text-decoration: underline; word-break: break-word;">
                <?= htmlspecialchars($selectedSantri['nama_lengkap'] ?? 'Nama Santri') ?>
            </h2>
            <p class="small text-muted mb-2">NIS: <?= htmlspecialchars($selectedSantri['nis'] ?? '-') ?> · Kelas / Halaqoh: <?= htmlspecialchars($selectedSantri['nama_kelas'] ?? '-') ?></p>

            <p class="mt-2 px-3 mx-auto small text-dark" style="max-width: 620px; line-height: 1.55;">
                Sebagai bentuk penghargaan atas ketekunan, kedisiplinan, dan prestasi istimewa sebagai:
            </p>

            <div class="badge bg-success py-2 px-4 fs-6 fw-bold text-uppercase my-2" style="background-color: #059669 !important; letter-spacing: 1px;">
                <?= $juaraText ?>
            </div>

            <p class="small text-muted mt-2 mx-auto" style="max-width: 640px; line-height: 1.55;">
                Dalam Penilaian Hasil Pembelajaran Rapor Semester <?= htmlspecialchars($tahunAktif['semester_aktif']) ?> Tahun Pelajaran <?= htmlspecialchars($tahunAktif['tahun']) ?>.
                Semoga Allah SWT senantiasa memberikan keberkahan ilmu dan keistiqomahan dalam mencintai Al-Qur'an.
            </p>
        </div>

        <!-- Signature Section -->
        <div class="row text-center mt-4 pt-3 small">
            <div class="col-6">
                <div>Wali Kelas / Halaqoh,</div>
                <div style="height: 55px;"></div>
                <div class="fw-bold text-dark">( <?= htmlspecialchars($selectedSantri['wali_nama'] ?? 'Ustadz Pengampu') ?> )</div>
            </div>
            <div class="col-6">
                <div><?= htmlspecialchars($lembaga['kota_penerbitan']) ?>, <?= htmlspecialchars($tglCetak) ?></div>
                <div><?= htmlspecialchars($lembaga['jabatan_penandatangan'] ?? 'Kepala TPQ') ?> <?= htmlspecialchars($lembaga['nama']) ?>,</div>
                <div style="height: 55px;"></div>
                <div class="fw-bold text-dark">( <?= htmlspecialchars($lembaga['kepala_tpq']) ?> )</div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`;
  },

  // 6. Evaluasi & Kenaikan Jilid (kenaikan_jilid.php)
  getKenaikanJilidPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$msg = '';
$jilidList = $pdo->query("SELECT * FROM jilid ORDER BY urutan ASC")->fetchAll();
$santriList = $pdo->query("SELECT s.*, j.nama AS jilid_nama FROM santri s LEFT JOIN jilid j ON s.jilid_id = j.id WHERE s.status = 'aktif' ORDER BY s.nama_lengkap ASC")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $santriId = (int)$_POST['santri_id'];
    $keJilid = (int)$_POST['ke_jilid'];
    $nilai = (float)$_POST['nilai_ujian'];
    $status = $_POST['status'];
    $penguji = trim($_POST['penguji']);
    $catatan = trim($_POST['catatan']);
    $tgl = date('Y-m-d');

    if ($santriId && $keJilid) {
        $stmtSantri = $pdo->prepare("SELECT jilid_id, metode_id FROM santri WHERE id = ?");
        $stmtSantri->execute([$santriId]);
        $curr = $stmtSantri->fetch();
        $dariJilid = $curr['jilid_id'] ?: 1;
        $metodeId = $curr['metode_id'] ?: 1;

        $ins = $pdo->prepare("INSERT INTO evaluasi_kenaikan (santri_id, tanggal, metode_id, dari_jilid, ke_jilid, nilai_ujian, status, penguji, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->execute([$santriId, $tgl, $metodeId, $dariJilid, $keJilid, $nilai, $status, $penguji, $catatan]);

        if (strpos($status, 'Lulus') !== false) {
            $upd = $pdo->prepare("UPDATE santri SET jilid_id = ? WHERE id = ?");
            $upd->execute([$keJilid, $santriId]);
            $msg = "Santri berhasil dinyatakan Lulus dan jilid aktif telah diperbarui!";
            $santriList = $pdo->query("SELECT s.*, j.nama AS jilid_nama FROM santri s LEFT JOIN jilid j ON s.jilid_id = j.id WHERE s.status = 'aktif' ORDER BY s.nama_lengkap ASC")->fetchAll();
        } else {
            $msg = "Hasil evaluasi telah dicatat.";
        }
    }
}

$riwayat = $pdo->query("SELECT e.*, s.nama_lengkap, s.nis, j1.nama as jilid_dari_nama, j2.nama as jilid_ke_nama FROM evaluasi_kenaikan e JOIN santri s ON e.santri_id = s.id LEFT JOIN jilid j1 ON e.dari_jilid = j1.id LEFT JOIN jilid j2 ON e.ke_jilid = j2.id ORDER BY e.id DESC LIMIT 50")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kenaikan Jilid - <?= htmlspecialchars($lembaga['nama']) ?></title>
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
            <h3 class="fw-bold mb-1">Evaluasi &amp; Kenaikan Jilid Santri</h3>
            <p class="text-muted small">Munaqosyah tingkat jilid metode Bilqolam dan Tahfidz</p>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

            <div class="row g-4">
                <div class="col-lg-5">
                    <form method="POST" action="kenaikan_jilid.php" class="card border-0 shadow-sm p-4 rounded-3 small">
                        <h5 class="fw-bold text-success mb-3">Input Evaluasi Munaqosyah</h5>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Pilih Santri *</label>
                            <select name="santri_id" class="form-select form-select-sm" required>
                                <option value="">-- Pilih Santri --</option>
                                <?php foreach ($santriList as $s): ?>
                                    <option value="<?= $s['id'] ?>"><?= htmlspecialchars($s['nama_lengkap']) ?> (Jilid: <?= htmlspecialchars($s['jilid_nama'] ?? 'Dasar') ?>)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Target Jilid Berikutnya *</label>
                            <select name="ke_jilid" class="form-select form-select-sm" required>
                                <option value="">-- Pilih Jilid Tujuan --</option>
                                <?php foreach ($jilidList as $j): ?>
                                    <option value="<?= $j['id'] ?>"><?= htmlspecialchars($j['nama']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col-6">
                                <label class="form-label fw-semibold">Nilai Ujian (0-100) *</label>
                                <input type="number" step="0.1" min="0" max="100" name="nilai_ujian" class="form-control form-control-sm" required placeholder="Contoh: 85">
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-semibold">Keputusan *</label>
                                <select name="status" class="form-select form-select-sm">
                                    <option value="Lulus (Naik Jilid)">Lulus (Naik Jilid)</option>
                                    <option value="Mengulang">Mengulang</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Nama Ustadz Penguji</label>
                            <input type="text" name="penguji" class="form-control form-control-sm" value="<?= htmlspecialchars($_SESSION['user']['nama'] ?? '') ?>" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Catatan Evaluasi / Makhroj</label>
                            <textarea name="catatan" class="form-control form-control-sm" rows="2" placeholder="Catatan kelancaran &amp; makhroj"></textarea>
                        </div>
                        <button type="submit" class="btn btn-success btn-sm w-100"><i class="bi bi-check-circle me-1"></i> Simpan Evaluasi Kenaikan</button>
                    </form>
                </div>

                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 fw-bold small">Riwayat Evaluasi Kenaikan Jilid Terakhir</div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0 small">
                                    <thead class="table-light">
                                        <tr><th class="ps-3">Tgl</th><th>Santri</th><th>Dari -> Ke</th><th>Nilai</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($riwayat)): ?>
                                            <tr><td colspan="5" class="text-center py-4 text-muted">Belum ada riwayat munaqosyah.</td></tr>
                                        <?php else: foreach ($riwayat as $r): ?>
                                            <tr>
                                                <td class="ps-3"><?= htmlspecialchars($r['tanggal']) ?></td>
                                                <td class="fw-bold"><?= htmlspecialchars($r['nama_lengkap']) ?></td>
                                                <td><?= htmlspecialchars($r['jilid_dari_nama'] ?? '-') ?> → <strong><?= htmlspecialchars($r['jilid_ke_nama'] ?? '-') ?></strong></td>
                                                <td><span class="badge bg-light text-dark fw-bold"><?= $r['nilai_ujian'] ?></span></td>
                                                <td><span class="badge <?= strpos($r['status'], 'Lulus') !== false ? 'bg-success' : 'bg-danger' ?>"><?= htmlspecialchars($r['status']) ?></span></td>
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
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 7. Kenaikan Kelas (kenaikan_kelas.php)
  getKenaikanKelasPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$msg = '';
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: ['tahun' => '2025/2026'];
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['santri'])) {
    $promotions = $_POST['santri'];
    try {
        $pdo->beginTransaction();
        $upd = $pdo->prepare("UPDATE santri SET kelas_id = ?, status = ? WHERE id = ?");
        $log = $pdo->prepare("INSERT INTO riwayat_kenaikan_kelas (santri_id, dari_kelas, ke_kelas, tahun_ajaran, status, tanggal) VALUES (?, ?, ?, ?, ?, ?)");
        $today = date('Y-m-d');

        foreach ($promotions as $sId => $p) {
            $st = $p['status'];
            $targetK = (int)$p['target_kelas'];
            $santriStatus = ($st === 'Lulus') ? 'lulus' : (($st === 'Pindah') ? 'pindah' : 'aktif');

            $upd->execute([$targetK, $santriStatus, (int)$sId]);
            $log->execute([(int)$sId, (string)$kelasId, (string)$targetK, $tahunAktif['tahun'], $st, $today]);
        }
        $pdo->commit();
        $msg = "Proses kenaikan kelas berhasil dieksekusi!";
    } catch (PDOException $e) {
        $pdo->rollBack();
        $msg = "Gagal memproses kenaikan kelas: " . $e->getMessage();
    }
}

$stmtSantri = $pdo->prepare("SELECT * FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
$stmtSantri->execute([$kelasId]);
$santriList = $stmtSantri->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kenaikan Kelas - <?= htmlspecialchars($lembaga['nama']) ?></title>
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
            <h3 class="fw-bold mb-1">Proses Kenaikan Kelas Santri</h3>
            <p class="text-muted small">Eksekusi promosi kelompok halaqoh pada akhir tahun ajaran <?= htmlspecialchars($tahunAktif['tahun']) ?></p>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm p-3 mb-4 rounded-3">
                <form method="GET" action="kenaikan_kelas.php" class="row g-2 align-items-center small">
                    <div class="col-auto"><label class="fw-semibold">Pilih Kelas / Halaqoh Saat Ini:</label></div>
                    <div class="col-auto">
                        <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                            <?php foreach ($kelasList as $k): ?>
                                <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasId ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </form>
            </div>

            <form method="POST" action="kenaikan_kelas.php?kelas_id=<?= $kelasId ?>" class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="table-light">
                                <tr><th class="ps-3">No</th><th>NIS</th><th>Nama Santri</th><th style="width: 180px;">Status Kenaikan</th><th style="width: 240px;">Pindah ke Kelas Tujuan</th></tr>
                            </thead>
                            <tbody>
                                <?php if (empty($santriList)): ?>
                                    <tr><td colspan="5" class="text-center py-4 text-muted">Tidak ada santri aktif di kelas ini.</td></tr>
                                <?php else: foreach ($santriList as $idx => $s): ?>
                                    <tr>
                                        <td class="ps-3"><?= $idx + 1 ?></td>
                                        <td class="font-monospace"><?= htmlspecialchars($s['nis']) ?></td>
                                        <td class="fw-bold"><?= htmlspecialchars($s['nama_lengkap']) ?></td>
                                        <td>
                                            <select name="santri[<?= $s['id'] ?>][status]" class="form-select form-select-sm">
                                                <option value="Naik Kelas">Naik Kelas</option>
                                                <option value="Tinggal Kelas">Tinggal Kelas</option>
                                                <option value="Lulus">Lulus (Tamat)</option>
                                                <option value="Pindah">Pindah</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="santri[<?= $s['id'] ?>][target_kelas]" class="form-select form-select-sm">
                                                <?php foreach ($kelasList as $k): ?>
                                                    <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasId ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                        </td>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                <?php if (!empty($santriList)): ?>
                <div class="card-footer bg-white text-end p-3">
                    <button type="submit" onclick="return confirm('Apakah Anda yakin ingin mengeksekusi kenaikan kelas untuk santri terpilih?')" class="btn btn-success"><i class="bi bi-mortarboard me-1"></i> Eksekusi Kenaikan Kelas</button>
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

  // 8. Tahun & Semester (tahun_semester.php)
  getTahunSemesterPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $thn = trim($_POST['tahun']);
    $sem = $_POST['semester_aktif'];
    $tglGanjil = trim($_POST['tgl_rapor_ganjil'] ?? date('Y-12-20'));
    $tglGenap = trim($_POST['tgl_rapor_genap'] ?? date('Y-06-20'));
    $stmt = $pdo->prepare("INSERT INTO tahun_pelajaran (tahun, semester_aktif, is_aktif, is_locked, tgl_rapor_ganjil, tgl_rapor_genap) VALUES (?, ?, 0, 0, ?, ?)");
    $stmt->execute([$thn, $sem, $tglGanjil, $tglGenap]);
    $msg = "Tahun pelajaran baru berhasil ditambahkan!";
}

if (isset($_GET['activate_id'])) {
    $actId = (int)$_GET['activate_id'];
    $pdo->query("UPDATE tahun_pelajaran SET is_aktif = 0");
    $stmt = $pdo->prepare("UPDATE tahun_pelajaran SET is_aktif = 1 WHERE id = ?");
    $stmt->execute([$actId]);
    $msg = "Tahun pelajaran aktif telah diperbarui.";
}

if (isset($_GET['set_sem']) && isset($_GET['id'])) {
    $sem = $_GET['set_sem'] === 'Genap' ? 'Genap' : 'Ganjil';
    $stmt = $pdo->prepare("UPDATE tahun_pelajaran SET semester_aktif = ? WHERE id = ?");
    $stmt->execute([$sem, (int)$_GET['id']]);
    $msg = "Semester aktif diubah menjadi Semester " . $sem . ".";
}

if (isset($_GET['toggle_lock'])) {
    $lockId = (int)$_GET['toggle_lock'];
    $stmt = $pdo->prepare("UPDATE tahun_pelajaran SET is_locked = IF(is_locked = 1, 0, 1) WHERE id = ?");
    $stmt->execute([$lockId]);
    $msg = "Status kunci tahun pelajaran diubah.";
}

$list = $pdo->query("SELECT * FROM tahun_pelajaran ORDER BY tahun DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tahun &amp; Semester - <?= htmlspecialchars($lembaga['nama']) ?></title>
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
                <h3 class="fw-bold mb-0">Tahun Pelajaran &amp; Semester</h3>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTahun"><i class="bi bi-plus-lg me-1"></i> Tambah Tahun</button>
            </div>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3">Tahun Pelajaran</th>
                                    <th>Semester Aktif</th>
                                    <th>Tgl Cetak Ganjil / Genap</th>
                                    <th>Status</th>
                                    <th>Kunci Data</th>
                                    <th class="text-end pe-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($list as $t): ?>
                                    <tr>
                                        <td class="ps-3 fw-bold fs-6"><?= htmlspecialchars($t['tahun']) ?></td>
                                        <td>
                                            <span class="badge bg-success-subtle text-success me-1">Semester <?= htmlspecialchars($t['semester_aktif']) ?></span>
                                            <a href="tahun_semester.php?id=<?= $t['id'] ?>&set_sem=<?= $t['semester_aktif'] === 'Ganjil' ? 'Genap' : 'Ganjil' ?>" class="btn btn-outline-success btn-sm py-0 px-1" style="font-size: 11px;">Ganti</a>
                                        </td>
                                        <td class="text-muted"><?= htmlspecialchars($t['tgl_rapor_ganjil'] ?? '-') ?> / <?= htmlspecialchars($t['tgl_rapor_genap'] ?? '-') ?></td>
                                        <td><?= $t['is_aktif'] ? '<span class="badge bg-success">AKTIF</span>' : '<span class="badge bg-secondary">TIDAK AKTIF</span>' ?></td>
                                        <td><?= $t['is_locked'] ? '<span class="badge bg-danger"><i class="bi bi-lock-fill me-1"></i>Terkunci</span>' : '<span class="badge bg-light text-dark border"><i class="bi bi-unlock me-1"></i>Terbuka</span>' ?></td>
                                        <td class="text-end pe-3">
                                            <?php if (!$t['is_aktif']): ?>
                                                <a href="tahun_semester.php?activate_id=<?= $t['id'] ?>" class="btn btn-outline-success btn-sm py-0 px-2">Jadikan Aktif</a>
                                            <?php endif; ?>
                                            <a href="tahun_semester.php?toggle_lock=<?= $t['id'] ?>" class="btn btn-outline-secondary btn-sm py-0 px-2"><?= $t['is_locked'] ? 'Buka Kunci' : 'Kunci' ?></a>
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

<div class="modal fade" id="modalTahun" tabindex="-1">
    <div class="modal-dialog">
        <form method="POST" action="tahun_semester.php" class="modal-content">
            <input type="hidden" name="action" value="create">
            <div class="modal-header"><h5 class="modal-title fw-bold">Tambah Tahun Pelajaran</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body small">
                <div class="mb-3"><label class="form-label fw-semibold">Format Tahun (Contoh: 2026/2027) *</label><input type="text" name="tahun" class="form-control form-control-sm" required placeholder="2026/2027"></div>
                <div class="mb-3"><label class="form-label fw-semibold">Semester Awal</label><select name="semester_aktif" class="form-select form-select-sm"><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select></div>
                <div class="row g-2">
                    <div class="col-6"><label class="form-label fw-semibold">Tgl Cetak Rapor Ganjil</label><input type="text" name="tgl_rapor_ganjil" class="form-control form-control-sm" placeholder="2026-12-19"></div>
                    <div class="col-6"><label class="form-label fw-semibold">Tgl Cetak Rapor Genap</label><input type="text" name="tgl_rapor_genap" class="form-control form-control-sm" placeholder="2027-06-19"></div>
                </div>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-success btn-sm">Simpan</button></div>
        </form>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 9. Metode & Jilid (metode_jilid.php)
  getMetodeJilidPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$metodeList = $pdo->query("SELECT * FROM metode ORDER BY id ASC")->fetchAll();
$jilidList = $pdo->query("SELECT j.*, m.nama AS metode_nama FROM jilid j JOIN metode m ON j.metode_id = m.id ORDER BY j.metode_id, j.urutan ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metode &amp; Jilid - <?= htmlspecialchars($lembaga['nama']) ?></title>
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
            <h3 class="fw-bold mb-3">Metode Pembelajaran &amp; Tingkat Jilid</h3>
            <div class="row g-4">
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm p-3 rounded-3 mb-3">
                        <h6 class="fw-bold text-success mb-2">Metode Pengajaran TPQ</h6>
                        <ul class="list-group list-group-flush small">
                            <?php foreach ($metodeList as $m): ?>
                                <li class="list-group-item px-0 py-2">
                                    <div class="fw-bold"><?= htmlspecialchars($m['nama']) ?></div>
                                    <div class="text-muted" style="font-size: 11px;"><?= htmlspecialchars($m['deskripsi'] ?? '') ?></div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 fw-bold small">Daftar Tingkatan Jilid Belajar</div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0 small">
                                    <thead class="table-light"><tr><th class="ps-3">Urutan</th><th>Nama Jilid</th><th>Metode</th><th>Target Capaian</th><th>Syarat Lulus</th></tr></thead>
                                    <tbody>
                                        <?php foreach ($jilidList as $j): ?>
                                            <tr>
                                                <td class="ps-3 font-monospace"><?= $j['urutan'] ?></td>
                                                <td class="fw-bold text-success"><?= htmlspecialchars($j['nama']) ?></td>
                                                <td><?= htmlspecialchars($j['metode_nama']) ?></td>
                                                <td><?= htmlspecialchars($j['target'] ?? '-') ?></td>
                                                <td><?= htmlspecialchars($j['syarat_lulus'] ?? '-') ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
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

  // 10. Komponen Nilai & Bobot (komponen_nilai.php)
  getKomponenNilaiPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala']);

$komponen = $pdo->query("SELECT * FROM komponen_penilaian ORDER BY urutan ASC")->fetchAll();
$predikat = $pdo->query("SELECT * FROM bobot_penilaian ORDER BY min_score DESC")->fetchAll();
$totalBobot = array_sum(array_column($komponen, 'bobot'));
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Komponen Nilai &amp; Bobot - <?= htmlspecialchars($lembaga['nama']) ?></title>
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
            <h3 class="fw-bold mb-3">Komponen Penilaian &amp; Skala Predikat</h3>
            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center fw-bold small">
                            <span>Komponen Penilaian Hasil Belajar Rapor</span>
                            <span class="badge bg-success">Total Bobot: <?= $totalBobot ?>%</span>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0 small">
                                    <thead class="table-light"><tr><th class="ps-3">No</th><th>Nama Komponen</th><th>Kategori</th><th>Bobot (%)</th><th>Tampil di Rapor</th></tr></thead>
                                    <tbody>
                                        <?php foreach ($komponen as $idx => $c): ?>
                                            <tr>
                                                <td class="ps-3"><?= $idx + 1 ?></td>
                                                <td class="fw-bold"><?= htmlspecialchars($c['nama']) ?></td>
                                                <td><?= htmlspecialchars($c['kategori']) ?></td>
                                                <td class="fw-bold text-success"><?= $c['bobot'] ?>%</td>
                                                <td><span class="badge bg-success">Ya</span></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-5">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 fw-bold small">Skala Rentang Predikat Nilai</div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0 small">
                                    <thead class="table-light"><tr><th class="ps-3">Predikat</th><th>Rentang Nilai</th><th>Keterangan</th></tr></thead>
                                    <tbody>
                                        <?php foreach ($predikat as $p): ?>
                                            <tr>
                                                <td class="ps-3 fw-bold fs-6 text-success"><?= htmlspecialchars($p['predikat']) ?></td>
                                                <td class="font-monospace"><?= $p['min_score'] ?> - <?= $p['max_score'] ?></td>
                                                <td><?= htmlspecialchars($p['label']) ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
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

  // 11. Internal Chat (chat.php)
  getChatPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$currentUserId = $_SESSION['user']['username'];
$currentUserName = $_SESSION['user']['nama'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['message'])) {
    $msg = trim($_POST['message']);
    $recipId = $_POST['recipient_id'] ?? 'semua';
    $recipName = $_POST['recipient_name'] ?? 'Seluruh Ustadz';

    if ($msg !== '') {
        $ins = $pdo->prepare("INSERT INTO chat (sender_id, sender_name, recipient_id, recipient_name, message) VALUES (?, ?, ?, ?, ?)");
        $ins->execute([$currentUserId, $currentUserName, $recipId, $recipName, $msg]);
        header("Location: chat.php");
        exit();
    }
}

$chats = $pdo->query("SELECT * FROM chat ORDER BY id ASC LIMIT 100")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesan Internal - <?= htmlspecialchars($lembaga['nama']) ?></title>
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
            <h3 class="fw-bold mb-1">Pesan Internal Koordinasi TPQ</h3>
            <p class="text-muted small">Komunikasi pengasuh, kepala TPQ, dan ustadz/ustadzah</p>

            <div class="card border-0 shadow-sm rounded-3 overflow-hidden col-lg-8">
                <div class="card-body p-3 overflow-auto" id="chatBox" style="height: 380px; background: #f8fafc;">
                    <?php if (empty($chats)): ?>
                        <div class="text-center py-5 text-muted small">Belum ada pesan koordinasi. Kirim pesan pertama di bawah.</div>
                    <?php else: foreach ($chats as $c):
                        $isMe = $c['sender_id'] === $currentUserId;
                    ?>
                        <div class="d-flex mb-3 <?= $isMe ? 'justify-content-end' : 'justify-content-start' ?>">
                            <div class="p-3 rounded-3 shadow-sm <?= $isMe ? 'bg-success text-white' : 'bg-white text-dark border' ?>" style="max-width: 78%;">
                                <div class="fw-bold small mb-1 <?= $isMe ? 'text-white-50' : 'text-success' ?>"><?= htmlspecialchars($c['sender_name']) ?></div>
                                <div class="small"><?= nl2br(htmlspecialchars($c['message'])) ?></div>
                                <div class="text-end mt-1 <?= $isMe ? 'text-white-50' : 'text-muted' ?>" style="font-size: 10px;"><?= htmlspecialchars($c['created_at']) ?></div>
                            </div>
                        </div>
                    <?php endforeach; endif; ?>
                </div>

                <div class="card-footer bg-white p-3 border-top">
                    <form method="POST" action="chat.php" class="d-flex gap-2">
                        <input type="text" name="message" class="form-control form-control-sm" placeholder="Ketik pesan koordinasi..." required autocomplete="off">
                        <button type="submit" class="btn btn-success btn-sm px-3"><i class="bi bi-send me-1"></i> Kirim</button>
                    </form>
                </div>
            </div>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script>
const box = document.getElementById('chatBox');
if (box) box.scrollTop = box.scrollHeight;
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 12. Profil Santri / Portal Santri (profil_santri.php)
  getProfilSantriPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz', 'santri']);

$role = $_SESSION['user']['role'];
if ($role === 'santri') {
    $santriId = find_santri_id_for_user($pdo, $_SESSION['user']);
} else {
    $santriId = isset($_GET['santri_id']) ? (int)$_GET['santri_id'] : 0;
}

$sqlSantri = "SELECT s.*, k.nama_kelas, u.nama AS wali_nama, j.nama AS jilid_nama, m.nama AS metode_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id LEFT JOIN jilid j ON s.jilid_id = j.id LEFT JOIN metode m ON s.metode_id = m.id";
$santri = null;
if ($santriId > 0) {
    $stmt = $pdo->prepare($sqlSantri . " WHERE s.id = ?");
    $stmt->execute([$santriId]);
    $santri = $stmt->fetch();
}
if (!$santri) {
    $santri = $pdo->query($sqlSantri . " ORDER BY s.id ASC LIMIT 1")->fetch();
}

$allSantri = ($role === 'santri') ? [] : $pdo->query("SELECT id, nama_lengkap, nis FROM santri WHERE status = 'aktif' ORDER BY nama_lengkap ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Santri - <?= htmlspecialchars($santri['nama_lengkap'] ?? 'Santri') ?></title>
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
            <?php if (isset($_GET['error']) && $_GET['error'] === 'unauthorized'): ?>
                <div class="alert alert-warning alert-dismissible fade show py-2 small" role="alert">
                    Akses halaman lain dibatasi untuk akun santri.
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h3 class="fw-bold mb-1">Profil &amp; Kemajuan Santri</h3>
                    <p class="text-muted small mb-0">Portal informasi santri dan wali santri <?= htmlspecialchars($lembaga['nama']) ?></p>
                </div>
                <?php if ($santri): ?>
                <div class="d-flex gap-2">
                    <?php if ($role !== 'santri' && !empty($allSantri)): ?>
                        <select class="form-select form-select-sm" onchange="location.href='profil_santri.php?santri_id='+this.value">
                            <?php foreach ($allSantri as $s): ?>
                                <option value="<?= $s['id'] ?>" <?= $s['id'] == $santri['id'] ? 'selected' : '' ?>><?= htmlspecialchars($s['nama_lengkap']) ?> (NIS: <?= htmlspecialchars($s['nis']) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    <?php endif; ?>
                    <a href="rapor.php?santri_id=<?= $santri['id'] ?>" target="_blank" class="btn btn-success btn-sm shrink-0"><i class="bi bi-printer me-1"></i> Cetak Rapor</a>
                </div>
                <?php endif; ?>
            </div>

            <?php if (!$santri): ?>
                <div class="alert alert-info small">Data santri belum tersedia.</div>
            <?php else: ?>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm p-4 rounded-3 text-center">
                        <div class="mx-auto mb-3 bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center fs-1" style="width: 76px; height: 76px;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1"><?= htmlspecialchars($santri['nama_lengkap']) ?></h5>
                        <div class="text-muted font-monospace small mb-2">NIS: <?= htmlspecialchars($santri['nis']) ?></div>
                        <div><span class="badge bg-success mb-3"><?= strtoupper($santri['status']) ?></span></div>

                        <div class="text-start small border-top pt-3 d-flex flex-column gap-2">
                            <div><strong>Jenis Kelamin:</strong> <?= $santri['jk'] === 'L' ? 'Laki-laki (Putra)' : 'Perempuan (Putri)' ?></div>
                            <div><strong>Kelas:</strong> <?= htmlspecialchars($santri['nama_kelas'] ?? '-') ?></div>
                            <div><strong>Wali Halaqoh:</strong> <?= htmlspecialchars($santri['wali_nama'] ?? '-') ?></div>
                            <div><strong>Jilid Aktif:</strong> <span class="badge bg-success-subtle text-success"><?= htmlspecialchars($santri['jilid_nama'] ?? 'Dasar') ?></span></div>
                        </div>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="card border-0 shadow-sm p-4 rounded-3 mb-3">
                        <h6 class="fw-bold text-success mb-3">Informasi Biodata &amp; Wali Santri</h6>
                        <div class="row g-3 small">
                            <div class="col-sm-6"><strong>Tempat, Tgl Lahir:</strong><br><?= htmlspecialchars($santri['tempat_lahir'] ?? '-') ?>, <?= htmlspecialchars($santri['tanggal_lahir'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>Metode Belajar:</strong><br><?= htmlspecialchars($santri['metode_nama'] ?? 'Bilqolam') ?></div>
                            <div class="col-sm-6"><strong>Nama Ayah:</strong><br><?= htmlspecialchars($santri['nama_ayah'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>Nama Ibu:</strong><br><?= htmlspecialchars($santri['nama_ibu'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>No. HP / WA Orang Tua:</strong><br><?= htmlspecialchars($santri['no_hp_ortu'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>Tanggal Masuk:</strong><br><?= htmlspecialchars($santri['tanggal_masuk'] ?? '-') ?></div>
                            <div class="col-12"><strong>Alamat Rumah:</strong><br><?= htmlspecialchars($santri['alamat'] ?? '-') ?></div>
                        </div>
                    </div>
                </div>
            </div>
            <?php endif; ?>
        </div>
        <footer class="text-center py-3 text-muted small border-top bg-white mt-auto">
            <?= htmlspecialchars($lembaga['footnote']) ?>
        </footer>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  }
};
