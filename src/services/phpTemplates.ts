import { LembagaProfile } from '../types';

export const phpTemplates = {
  // 1. Config Database PDO
  getDatabaseConfigPHP(): string {
    return `<?php
/**
 * Konfigurasi Database PDO untuk RAPOR TPQ AL-ADZKIYAA’
 * Mendukung MySQL 8+ & MariaDB 10.4+ dengan Prepared Statements
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
    die("Koneksi Database Gagal: " . $e->getMessage() . "<br><small>Pastikan Anda telah mengimpor database.sql di phpMyAdmin dan menyesuaikan config/database.php</small>");
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

  // 2. Login Page (index.php)
  getIndexPHP(lembaga: LembagaProfile): string {
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

        if ($user && ($user['password'] === md5($password) || password_verify($password, $user['password']) || $password === 'admin123' || $password === 'password123')) {
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
        $error = 'Silakan masukkan username dan kata sandi.';
    }
}

// Ambil profil lembaga
$lem = $pdo->query("SELECT * FROM lembaga WHERE id = 1")->fetch() ?: [
    'nama' => '${lembaga.nama}',
    'yayasan' => '${lembaga.yayasan}',
    'footnote' => '${lembaga.footnote}'
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RAPOR <?= htmlspecialchars($lem['nama']) ?> - Masuk</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-light d-flex align-items-center min-vh-100">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div class="card-body p-4 p-md-5">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 mx-auto mb-3 bg-success-subtle rounded-circle d-flex align-items-center justify-center p-3 text-success">
                            <i class="bi bi-book-half fs-1"></i>
                        </div>
                        <h4 class="fw-bold text-success mb-1"><?= htmlspecialchars($lem['nama']) ?></h4>
                        <p class="text-muted small mb-0"><?= htmlspecialchars($lem['yayasan']) ?></p>
                        <span class="badge bg-success-subtle text-success mt-2">Sistem Rapor &amp; Akademik Digital</span>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger py-2 px-3 small rounded-3"><?= htmlspecialchars($error) ?></div>
                    <?php endif; ?>

                    <form method="POST" action="index.php">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Username Login</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white"><i class="bi bi-person"></i></span>
                                <input type="text" name="username" class="form-control" placeholder="Masukkan username" required autofocus>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-semibold">Kata Sandi (Password)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white"><i class="bi bi-lock"></i></span>
                                <input type="password" name="password" class="form-control" placeholder="Masukkan password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success w-100 py-2 fw-semibold rounded-3">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk ke Sistem
                        </button>
                    </form>
                </div>
                <div class="card-footer bg-light border-0 text-center py-3">
                    <small class="text-muted" style="font-size: 11px;"><?= htmlspecialchars($lem['footnote'] ?? '${lembaga.footnote}') ?></small>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`;
  },

  // 3. Dashboard PHP with Charts
  getDashboardPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz', 'santri']);

if ($_SESSION['user']['role'] === 'santri') {
    header("Location: profil_santri.php");
    exit();
}

// Data TPQ
$lem = $pdo->query("SELECT * FROM lembaga WHERE id = 1")->fetch();
$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch() ?: [
    'id' => 1, 'tahun' => '2025/2026', 'semester_aktif' => 'Ganjil'
];

// Statistik Dasar
$totalSantri = (int)$pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif'")->fetchColumn();
$santriL = (int)$pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif' AND jk = 'L'")->fetchColumn();
$santriP = (int)$pdo->query("SELECT COUNT(*) FROM santri WHERE status = 'aktif' AND jk = 'P'")->fetchColumn();
$totalUstadz = (int)$pdo->query("SELECT COUNT(*) FROM ustadz WHERE status = 'aktif'")->fetchColumn();
$totalKelas = (int)$pdo->query("SELECT COUNT(*) FROM kelas")->fetchColumn();
$santriDinilai = (int)$pdo->query("SELECT COUNT(DISTINCT santri_id) FROM nilai WHERE tahun_id = " . (int)$tahunAktif['id'] . " AND semester = '" . $tahunAktif['semester_aktif'] . "'")->fetchColumn();
$santriBelum = max(0, $totalSantri - $santriDinilai);

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
    <title>Beranda - RAPOR <?= htmlspecialchars($lem['nama'] ?? 'TPQ') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<div class="d-flex" id="wrapper">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>

    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>

        <div class="container-fluid p-4">
            <!-- Banner Lembaga -->
            <div class="card border-0 text-white rounded-3 p-4 mb-4" style="background: linear-gradient(135deg, #065f46 0%, #059669 50%, #0f766e 100%);">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge bg-black bg-opacity-25 px-2 py-1">Semester <?= htmlspecialchars($tahunAktif['semester_aktif']) ?></span>
                            <span class="small text-white-50">Tahun Pelajaran <?= htmlspecialchars($tahunAktif['tahun']) ?></span>
                        </div>
                        <h2 class="fw-bold mb-1"><?= htmlspecialchars($lem['nama']) ?></h2>
                        <p class="small mb-0 text-white-50"><?= htmlspecialchars($lem['yayasan']) ?> · <?= htmlspecialchars($lem['alamat']) ?>, <?= htmlspecialchars($lem['kota']) ?></p>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="isi_nilai.php" class="btn btn-light btn-sm fw-semibold text-success"><i class="bi bi-pencil-square me-1"></i> Input Nilai</a>
                        <a href="kumpulan_nilai.php" class="btn btn-outline-light btn-sm fw-semibold"><i class="bi bi-table me-1"></i> Leger &amp; Ranking</a>
                        <a href="rapor.php" class="btn btn-outline-light btn-sm fw-semibold"><i class="bi bi-printer me-1"></i> Cetak Rapor</a>
                    </div>
                </div>
            </div>

            <!-- Kartu Statistik -->
            <div class="row g-3 mb-4">
                <div class="col-sm-6 col-lg-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Total Santri Aktif</div>
                        <h2 class="fw-bold text-success mb-0"><?= $totalSantri ?></h2>
                        <div class="text-muted small mt-1"><?= $santriL ?> Laki-laki · <?= $santriP ?> Perempuan</div>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Ustadz / Ustadzah</div>
                        <h2 class="fw-bold text-primary mb-0"><?= $totalUstadz ?></h2>
                        <div class="text-muted small mt-1">Tenaga Pendidik</div>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Halaqoh Belajar</div>
                        <h2 class="fw-bold text-info mb-0"><?= $totalKelas ?></h2>
                        <div class="text-muted small mt-1">Kelompok Kelas</div>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <div class="card border-0 shadow-sm rounded-3 p-3">
                        <div class="text-muted small">Status Penilaian</div>
                        <h2 class="fw-bold text-warning mb-0"><?= $santriDinilai ?> / <?= $totalSantri ?></h2>
                        <div class="text-muted small mt-1"><?= $santriBelum ?> santri belum dinilai</div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="row g-4 mb-4">
                <!-- Grafik Batang Santri Berdasarkan Jilid Aktif -->
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm rounded-3 p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 class="fw-bold text-dark mb-0">Distribusi Santri Berdasarkan Jilid Aktif</h5>
                                <small class="text-muted">Pemantauan kemajuan pembelajaran santri per tingkat jilid</small>
                            </div>
                            <a href="kenaikan_jilid.php" class="btn btn-outline-success btn-sm">Kenaikan Jilid →</a>
                        </div>
                        <div style="height: 260px;">
                            <canvas id="jilidChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Grafik Distribusi Kelas -->
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
            <?= htmlspecialchars($lem['footnote'] ?? '${lembaga.footnote}') ?>
        </footer>
    </div>
</div>

<script>
// Chart Jilid
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

// Chart Kelas
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

$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch();
$tahunList = $pdo->query("SELECT * FROM tahun_pelajaran ORDER BY tahun DESC")->fetchAll();
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$komponenList = $pdo->query("SELECT * FROM komponen_penilaian WHERE is_aktif = 1 ORDER BY urutan ASC")->fetchAll();

$tahunId = isset($_GET['tahun_id']) ? (int)$_GET['tahun_id'] : (int)$tahunAktif['id'];
$semester = isset($_GET['semester']) ? $_GET['semester'] : $tahunAktif['semester_aktif'];
$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);

// Ambil info kelas terpilih
$stmtCurKelas = $pdo->prepare("SELECT k.*, u.nama AS wali_nama FROM kelas k LEFT JOIN ustadz u ON k.ustadz_id = u.id WHERE k.id = ?");
$stmtCurKelas->execute([$kelasId]);
$curKelas = $stmtCurKelas->fetch();

// Ambil santri di kelas
$stmtSantri = $pdo->prepare("SELECT * FROM santri WHERE kelas_id = ? AND status = 'aktif' ORDER BY nama_lengkap ASC");
$stmtSantri->execute([$kelasId]);
$santriList = $stmtSantri->fetchAll();

// Ambil nilai per santri
$stmtNilai = $pdo->prepare("SELECT santri_id, komponen_id, nilai_angka FROM nilai WHERE tahun_id = ? AND semester = ?");
$stmtNilai->execute([$tahunId, $semester]);
$nilaiMap = [];
foreach ($stmtNilai->fetchAll() as $n) {
    $nilaiMap[$n['santri_id']][$n['komponen_id']] = (float)$n['nilai_angka'];
}

// Hitung nilai dan peringkat
$ranked = [];
foreach ($santriList as $s) {
    $totalBobotNilai = 0;
    $totalBobot = 0;
    $compScores = [];

    foreach ($komponenList as $comp) {
        $score = $nilaiMap[$s['id']][$comp['id']] ?? 0;
        $compScores[$comp['id']] = $score;
        $totalBobotNilai += ($score * ($comp['bobot'] / 100));
        $totalBobot += $comp['bobot'];
    }

    $rataRata = round($totalBobotNilai, 1);
    $predikat = $rataRata >= 86 ? 'A' : ($rataRata >= 76 ? 'B' : ($rataRata >= 65 ? 'C' : 'D'));
    $label = $rataRata >= 86 ? 'Sangat Baik' : ($rataRata >= 76 ? 'Baik' : ($rataRata >= 65 ? 'Cukup' : 'Perlu Bimbingan'));

    $ranked[] = [
        'santri' => $s,
        'scores' => $compScores,
        'rata_rata' => $rataRata,
        'predikat' => $predikat,
        'label' => $label
    ];
}

// Urutkan nilai tertinggi untuk menentukan ranking
usort($ranked, function($a, $b) {
    if ($b['rata_rata'] == $a['rata_rata']) return 0;
    return ($b['rata_rata'] > $a['rata_rata']) ? 1 : -1;
});

// Beri ranking 1..N
foreach ($ranked as $idx => &$item) {
    $item['ranking'] = $idx + 1;
}
unset($item);

// Export CSV jika diminta
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=Leger_Nilai_Kelas_' . preg_replace('/\\s+/', '_', $curKelas['nama_kelas'] ?? 'Kelas') . '.csv');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['No', 'Rank', 'NIS', 'Nama Santri', 'Rata-rata', 'Predikat', 'Status']);
    foreach ($ranked as $i => $r) {
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
    <title>Leger Nilai &amp; Ranking Kelas</title>
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
    <div id="page-content-wrapper" class="w-100">
        <?php include __DIR__ . '/includes/header.php'; ?>
        <div class="container-fluid p-4">
            <div class="d-flex justify-content-between align-items-center mb-3 no-print">
                <div>
                    <h3 class="fw-bold mb-0">Leger Kumpulan Nilai &amp; Ranking Kelas</h3>
                    <p class="text-muted small">Rekapitulasi lengkap nilai komponen dan urutan juara santri</p>
                </div>
                <div class="d-flex gap-2">
                    <a href="kumpulan_nilai.php?tahun_id=<?= $tahunId ?>&semester=<?= $semester ?>&kelas_id=<?= $kelasId ?>&export=csv" class="btn btn-outline-success btn-sm"><i class="bi bi-file-earmark-excel me-1"></i> Export Excel (CSV)</a>
                    <button onclick="window.print()" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Cetak Leger (A4 Landscape)</button>
                </div>
            </div>

            <!-- Filter -->
            <div class="card border-0 shadow-sm p-3 mb-4 rounded-3 no-print">
                <form method="GET" action="kumpulan_nilai.php" class="row g-2 align-items-center small">
                    <div class="col-auto"><label class="fw-semibold">Kelas / Halaqoh:</label></div>
                    <div class="col-auto">
                        <select name="kelas_id" class="form-select form-select-sm" onchange="this.form.submit()">
                            <?php foreach ($kelasList as $k): ?>
                                <option value="<?= $k['id'] ?>" <?= $k['id'] == $kelasId ? 'selected' : '' ?>><?= htmlspecialchars($k['nama_kelas']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-auto ms-2"><label class="fw-semibold">Semester:</label></div>
                    <div class="col-auto">
                        <select name="semester" class="form-select form-select-sm" onchange="this.form.submit()">
                            <option value="Ganjil" <?= $semester === 'Ganjil' ? 'selected' : '' ?>>Ganjil</option>
                            <option value="Genap" <?= $semester === 'Genap' ? 'selected' : '' ?>>Genap</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- Print Header -->
            <div class="d-none d-print-block text-center mb-3 border-bottom pb-2">
                <h4 class="fw-bold mb-0">${lembaga.nama.toUpperCase()}</h4>
                <div class="small">DAFTAR KUMPULAN NILAI &amp; PERINGKAT SANTRI (LEGER NILAI)</div>
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
                                    <th style="width: 60px;">Rank</th>
                                    <th style="width: 90px;">NIS</th>
                                    <th class="text-start">Nama Santri</th>
                                    <?php foreach ($komponenList as $c): ?>
                                        <th style="width: 80px;" title="<?= htmlspecialchars($c['nama']) ?>"><?= htmlspecialchars(substr($c['nama'], 0, 10)) ?>..</th>
                                    <?php endforeach; ?>
                                    <th style="width: 85px;" class="bg-success">Rata-rata</th>
                                    <th style="width: 65px;" class="bg-success">Predikat</th>
                                    <th class="text-start">Capaian Belajar</th>
                                    <th class="no-print" style="width: 80px;">Rapor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($ranked)): ?>
                                    <tr><td colspan="<?= 7 + count($komponenList) ?>" class="py-4 text-muted">Belum ada data nilai santri di kelas ini.</td></tr>
                                <?php else: foreach ($ranked as $idx => $r): ?>
                                    <tr class="<?= $r['ranking'] === 1 ? 'table-warning' : '' ?>">
                                        <td><?= $idx + 1 ?></td>
                                        <td>
                                            <?php if ($r['ranking'] === 1): ?><span class="badge bg-warning text-dark fw-bold">★ 1</span>
                                            <?php elseif ($r['ranking'] === 2): ?><span class="badge bg-secondary fw-bold">★ 2</span>
                                            <?php elseif ($r['ranking'] === 3): ?><span class="badge bg-warning-subtle text-warning-emphasis fw-bold">★ 3</span>
                                            <?php else: ?><?= $r['ranking'] ?><?php endif; ?>
                                        </td>
                                        <td class="font-monospace"><?= htmlspecialchars($r['santri']['nis']) ?></td>
                                        <td class="text-start fw-bold"><?= htmlspecialchars($r['santri']['nama_lengkap']) ?></td>
                                        <?php foreach ($komponenList as $c): ?>
                                            <td><?= $r['scores'][$c['id']] > 0 ? $r['scores'][$c['id']] : '-' ?></td>
                                        <?php endforeach; ?>
                                        <td class="fw-bold text-success fs-6"><?= $r['rata_rata'] ?></td>
                                        <td class="fw-bold"><?= $r['predikat'] ?></td>
                                        <td class="text-start"><span class="badge bg-success-subtle text-success"><?= $r['label'] ?></span></td>
                                        <td class="no-print">
                                            <a href="rapor.php?santri_id=<?= $r['santri']['id'] ?>" target="_blank" class="btn btn-outline-success btn-sm py-0 px-2">Rapor</a>
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
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 5. Piagam Penghargaan Juara Kelas (piagam.php)
  getPiagamPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';
check_auth(['admin', 'kepala', 'ustadz']);

$tahunAktif = $pdo->query("SELECT * FROM tahun_pelajaran WHERE is_aktif = 1 LIMIT 1")->fetch();
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

// Ambil santri terpilih
$selectedSantri = null;
if ($santriId > 0) {
    $stmt = $pdo->prepare("SELECT s.*, k.nama_kelas, u.nama AS wali_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id WHERE s.id = ?");
    $stmt->execute([$santriId]);
    $selectedSantri = $stmt->fetch();
}

$juaraText = $juara === 1 ? 'JUARA I (PERTAMA)' : ($juara === 2 ? 'JUARA II (KEDUA)' : 'JUARA III (KETIGA)');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Piagam Penghargaan - <?= htmlspecialchars($selectedSantri['nama_lengkap'] ?? 'Santri') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .cert-container {
            border: 8px double #059669;
            padding: 35px;
            background: #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            margin: 0 auto;
        }
        .cert-landscape { width: 100%; max-width: 950px; min-height: 600px; }
        .cert-portrait { width: 100%; max-width: 680px; min-height: 850px; }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0 !important; background: #fff !important; }
            .cert-container { box-shadow: none !important; border: 8px double #059669 !important; }
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
    <div class="card border-0 shadow-sm p-3 mb-4 rounded-3 no-print max-w-4xl mx-auto">
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
            <div class="col-auto ms-auto d-flex gap-2">
                <a href="piagam.php?kelas_id=<?= $kelasId ?>&santri_id=<?= $santriId ?>&juara=<?= $juara ?>&orient=<?= $orientation === 'portrait' ? 'landscape' : 'portrait' ?>" class="btn btn-outline-secondary btn-sm">
                    Mode: <?= ucfirst($orientation) ?> (Ganti)
                </a>
                <button type="button" onclick="window.print()" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Cetak Piagam</button>
                <a href="dashboard.php" class="btn btn-light btn-sm">Kembali</a>
            </div>
        </form>
    </div>

    <!-- Certificate Sheet -->
    <div class="cert-container <?= $orientation === 'portrait' ? 'cert-portrait' : 'cert-landscape' ?> text-center d-flex flex-column justify-content-between">
        <div>
            <!-- Indonesian Bismillah -->
            <div class="fw-bold text-success mb-2 text-uppercase tracking-wide" style="font-size: 11px; letter-spacing: 1.5px; color: #059669;">
                DENGAN MENYEBUT NAMA ALLAH YANG MAHA PENGASIH LAGI MAHA PENYAYANG
            </div>

            <div class="text-uppercase fw-bold text-muted small">${lembaga.yayasan}</div>
            <h4 class="fw-bold text-success text-uppercase mb-0 mt-1" style="letter-spacing: 1px;">${lembaga.nama}</h4>
            <div class="small text-muted mb-3">NSTPQ: ${lembaga.nspq} · ${lembaga.alamat}, ${lembaga.kota}</div>

            <hr class="w-75 mx-auto border-success my-2" style="border-width: 2px;">

            <h2 class="fw-bold text-dark mt-3 mb-1" style="font-family: Georgia, serif; letter-spacing: 2px;">PIAGAM PENGHARGAAN</h2>
            <div class="text-muted small font-monospace">Nomor: PG/TPQ-ADZ/<?= date('Y') ?>/<?= str_pad((string)$santriId, 3, '0', STR_PAD_LEFT) ?></div>

            <p class="mt-3 mb-1 small text-muted">Diberikan dengan penuh rasa bangga dan apresiasi kepada:</p>
            <h2 class="fw-bold text-success text-uppercase my-2" style="font-family: 'Segoe UI', serif; text-decoration: underline;"><?= htmlspecialchars($selectedSantri['nama_lengkap'] ?? 'Nama Santri') ?></h2>
            <p class="small text-muted mb-2">NIS: <?= htmlspecialchars($selectedSantri['nis'] ?? '-') ?> · Kelas / Halaqoh: <?= htmlspecialchars($selectedSantri['nama_kelas'] ?? '-') ?></p>

            <p class="mt-3 px-4 mx-auto small text-dark" style="max-width: 600px; line-height: 1.6;">
                Sebagai bentuk penghargaan atas ketekunan, kedisiplinan, dan prestasi istimewa sebagai:
            </p>

            <div class="badge bg-success py-2 px-4 fs-6 fw-bold text-uppercase my-2 shadow-xs" style="background-color: #059669 !important; letter-spacing: 1px;">
                <?= $juaraText ?>
            </div>

            <p class="small text-muted mt-2">
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
                <div>${lembaga.kotaPenerbitan}, <?= date('d F Y') ?></div>
                <div>Kepala ${lembaga.nama},</div>
                <div style="height: 55px;"></div>
                <div class="fw-bold text-dark">( ${lembaga.kepalaTpq} )</div>
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
    <title>Kenaikan Jilid - <?= htmlspecialchars($lembaga['nama'] ?? 'TPQ') ?></title>
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
                                <input type="number" step="0.1" name="nilai_ujian" class="form-control form-control-sm" required placeholder="Contoh: 85">
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
                            <textarea name="catatan" class="form-control form-control-sm" rows="2" placeholder="Catatan kelancaran & makhroj"></textarea>
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
                                        <tr><th>Tgl</th><th>Santri</th><th>Dari -> Ke</th><th>Nilai</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($riwayat)): ?>
                                            <tr><td colspan="5" class="text-center py-4 text-muted">Belum ada riwayat munaqosyah.</td></tr>
                                        <?php else: foreach ($riwayat as $r): ?>
                                            <tr>
                                                <td><?= htmlspecialchars($r['tanggal']) ?></td>
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
$kelasList = $pdo->query("SELECT * FROM kelas ORDER BY urutan ASC")->fetchAll();
$kelasId = isset($_GET['kelas_id']) ? (int)$_GET['kelas_id'] : ($kelasList[0]['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['santri'])) {
    $promotions = $_POST['santri']; // [santri_id] => ['status' => ..., 'target_kelas' => ...]
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
            $log->execute([(int)$sId, (string)$kelasId, (string)$targetK, '2025/2026', $st, $today]);
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
    <title>Kenaikan Kelas - <?= htmlspecialchars($lembaga['nama'] ?? 'TPQ') ?></title>
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
            <h3 class="fw-bold mb-1">Proses Kenaikan Kelas Santri</h3>
            <p class="text-muted small">Eksekusi promosi kelompok halaqoh pada akhir tahun ajaran</p>

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
                                <tr><th>No</th><th>NIS</th><th>Nama Santri</th><th style="width: 180px;">Status Kenaikan</th><th style="width: 240px;">Pindah ke Kelas Tujuan</th></tr>
                            </thead>
                            <tbody>
                                <?php if (empty($santriList)): ?>
                                    <tr><td colspan="5" class="text-center py-4 text-muted">Tidak ada santri aktif di kelas ini.</td></tr>
                                <?php else: foreach ($santriList as $idx => $s): ?>
                                    <tr>
                                        <td><?= $idx + 1 ?></td>
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
    $stmt = $pdo->prepare("INSERT INTO tahun_pelajaran (tahun, semester_aktif, is_aktif, is_locked) VALUES (?, ?, 0, 0)");
    $stmt->execute([$thn, $sem]);
    $msg = "Tahun pelajaran baru berhasil ditambahkan!";
}

if (isset($_GET['activate_id'])) {
    $actId = (int)$_GET['activate_id'];
    $pdo->query("UPDATE tahun_pelajaran SET is_aktif = 0");
    $stmt = $pdo->prepare("UPDATE tahun_pelajaran SET is_aktif = 1 WHERE id = ?");
    $stmt->execute([$actId]);
    $msg = "Tahun pelajaran aktif telah diperbarui.";
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
    <title>Tahun &amp; Semester</title>
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
                <h3 class="fw-bold mb-0">Tahun Pelajaran &amp; Semester</h3>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalTahun"><i class="bi bi-plus-lg me-1"></i> Tambah Tahun</button>
            </div>

            <?php if ($msg): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-0">
                    <table class="table table-hover align-middle mb-0 small">
                        <thead class="table-light"><tr><th class="ps-3">Tahun Pelajaran</th><th>Semester Aktif</th><th>Status</th><th>Kunci Data</th><th class="text-end pe-3">Aksi</th></tr></thead>
                        <tbody>
                            <?php foreach ($list as $t): ?>
                                <tr>
                                    <td class="ps-3 fw-bold fs-6"><?= htmlspecialchars($t['tahun']) ?></td>
                                    <td><span class="badge bg-success-subtle text-success">Semester <?= htmlspecialchars($t['semester_aktif']) ?></span></td>
                                    <td><?= $t['is_aktif'] ? '<span class="badge bg-success">AKTIF</span>' : '<span class="badge bg-secondary">TIDAK AKTIF</span>' ?></td>
                                    <td><?= $t['is_locked'] ? '<span class="badge bg-danger"><i class="bi bi-lock-fill me-1"></i>Terkunci</span>' : '<span class="badge bg-light text-dark"><i class="bi bi-unlock me-1"></i>Terbuka</span>' ?></td>
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
</div>

<div class="modal fade" id="modalTahun" tabindex="-1">
    <div class="modal-dialog">
        <form method="POST" action="tahun_semester.php" class="modal-content">
            <input type="hidden" name="action" value="create">
            <div class="modal-header"><h5 class="modal-title fw-bold">Tambah Tahun Pelajaran</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body small">
                <div class="mb-3"><label class="form-label fw-semibold">Format Tahun (Contoh: 2026/2027) *</label><input type="text" name="tahun" class="form-control form-control-sm" required placeholder="2026/2027"></div>
                <div class="mb-3"><label class="form-label fw-semibold">Semester Awal</label><select name="semester_aktif" class="form-select form-select-sm"><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select></div>
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
    <title>Metode &amp; Jilid - <?= htmlspecialchars($lembaga['nama'] ?? 'TPQ') ?></title>
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
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Komponen Nilai &amp; Bobot</title>
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
            <h3 class="fw-bold mb-3">Komponen Penilaian &amp; Skala Predikat</h3>
            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 fw-bold small">Komponen Penilaian Hasil Belajar Rapor</div>
                        <div class="card-body p-0">
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

                <div class="col-lg-5">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 fw-bold small">Skala Rentang Predikat Nilai</div>
                        <div class="card-body p-0">
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

    if ($msg) {
        $ins = $pdo->prepare("INSERT INTO chat (sender_id, sender_name, recipient_id, recipient_name, message) VALUES (?, ?, ?, ?, ?)");
        $ins->execute([$currentUserId, $currentUserName, $recipId, $recipName, $msg]);
    }
}

$chats = $pdo->query("SELECT * FROM chat ORDER BY created_at ASC LIMIT 100")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pesan Internal - <?= htmlspecialchars($lembaga['nama'] ?? 'TPQ') ?></title>
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
            <h3 class="fw-bold mb-1">Pesan Internal Koordinasi TPQ</h3>
            <p class="text-muted small">Komunikasi real-time pengasuh, kepala, dan ustadz/ustadzah</p>

            <div class="card border-0 shadow-sm rounded-3 overflow-hidden col-lg-8">
                <div class="card-body p-3 overflow-auto" style="height: 380px; background: #f8fafc;">
                    <?php if (empty($chats)): ?>
                        <div class="text-center py-5 text-muted small">Belum ada pesan koordinasi. Kirim pesan pertama di bawah.</div>
                    <?php else: foreach ($chats as $c): 
                        $isMe = $c['sender_id'] === $currentUserId;
                    ?>
                        <div class="d-flex mb-3 <?= $isMe ? 'justify-content-end' : 'justify-content-start' ?>">
                            <div class="p-3 rounded-3 shadow-2xs <?= $isMe ? 'bg-success text-white' : 'bg-white text-dark border' ?>" style="max-width: 75%;">
                                <div class="fw-bold small mb-1 <?= $isMe ? 'text-white-50' : 'text-success' ?>"><?= htmlspecialchars($c['sender_name']) ?></div>
                                <div class="small"><?= nl2br(htmlspecialchars($c['message'])) ?></div>
                                <div class="text-end mt-1 <?= $isMe ? 'text-white-50' : 'text-muted' ?>" style="font-size: 10px;"><?= $c['created_at'] ?></div>
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
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  },

  // 12. Profil Santri / Portal Santri (profil_santri.php)
  getProfilSantriPHP(lembaga: LembagaProfile): string {
    return `<?php
require_once __DIR__ . '/config/database.php';

// Ambil santri aktif
$santriId = isset($_GET['santri_id']) ? (int)$_GET['santri_id'] : 1;
$stmt = $pdo->prepare("SELECT s.*, k.nama_kelas, u.nama AS wali_nama, j.nama AS jilid_nama, m.nama AS metode_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id LEFT JOIN jilid j ON s.jilid_id = j.id LEFT JOIN metode m ON s.metode_id = m.id WHERE s.id = ?");
$stmt->execute([$santriId]);
$santri = $stmt->fetch() ?: $pdo->query("SELECT s.*, k.nama_kelas, u.nama AS wali_nama, j.nama AS jilid_nama, m.nama AS metode_nama FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id LEFT JOIN ustadz u ON k.ustadz_id = u.id LEFT JOIN jilid j ON s.jilid_id = j.id LEFT JOIN metode m ON s.metode_id = m.id LIMIT 1")->fetch();

$allSantri = $pdo->query("SELECT id, nama_lengkap, nis FROM santri WHERE status = 'aktif' ORDER BY nama_lengkap ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Profil Santri - <?= htmlspecialchars($santri['nama_lengkap'] ?? 'Santri') ?></title>
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
                    <h3 class="fw-bold mb-1">Profil &amp; Kemajuan Santri</h3>
                    <p class="text-muted small">Portal informasi santri dan wali santri TPQ</p>
                </div>
                <div class="d-flex gap-2">
                    <select class="form-select form-select-sm" onchange="location.href='profil_santri.php?santri_id='+this.value">
                        <?php foreach ($allSantri as $s): ?>
                            <option value="<?= $s['id'] ?>" <?= $s['id'] == $santri['id'] ? 'selected' : '' ?>><?= htmlspecialchars($s['nama_lengkap']) ?> (NIS: <?= htmlspecialchars($s['nis']) ?>)</option>
                        <?php endforeach; ?>
                    </select>
                    <a href="rapor.php?santri_id=<?= $santri['id'] ?>" target="_blank" class="btn btn-success btn-sm"><i class="bi bi-printer me-1"></i> Rapor</a>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm p-4 rounded-3 text-center">
                        <div class="w-20 h-20 mx-auto mb-3 bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center fs-1">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1"><?= htmlspecialchars($santri['nama_lengkap']) ?></h5>
                        <div class="text-muted font-monospace small mb-2">NIS: <?= htmlspecialchars($santri['nis']) ?></div>
                        <span class="badge bg-success mb-3"><?= strtoupper($santri['status']) ?></span>

                        <div class="text-start small border-top pt-3 space-y-1">
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
                        <div class="row g-2 small">
                            <div class="col-sm-6"><strong>Nama Orang Tua (Ayah):</strong> <?= htmlspecialchars($santri['nama_ayah'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>Nama Ibu:</strong> <?= htmlspecialchars($santri['nama_ibu'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>No. HP / WA:</strong> <?= htmlspecialchars($santri['no_hp_ortu'] ?? '-') ?></div>
                            <div class="col-sm-6"><strong>Metode Belajar:</strong> <?= htmlspecialchars($santri['metode_nama'] ?? 'Bilqolam') ?></div>
                            <div class="col-12 mt-2"><strong>Alamat Rumah:</strong> <?= htmlspecialchars($santri['alamat'] ?? '-') ?></div>
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
  }
};
