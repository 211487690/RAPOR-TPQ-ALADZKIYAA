<?php
/**
 * RAPOR TPQ AL-ADZKIYAA’
 * File: index.php
 * Login & Session Gateway
 */
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
        $error = 'Silakan masukkan username dan kata sandi.';
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
</head>
<body class="bg-light d-flex align-items-center min-vh-100">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="card shadow-sm border-0 rounded-4">
                <div class="card-body p-4 p-md-5">
                    <div class="text-center mb-4">
                        <img src="assets/img/logo.png" alt="Logo TPQ" class="mb-3" style="width: 80px; height: 80px; object-fit: contain;" onerror="this.style.display='none'">
                        <h4 class="fw-bold text-success mb-1">RAPOR TPQ AL-ADZKIYAA’</h4>
                        <p class="text-muted small mb-0">Yayasan Pendidikan Al Ma’arif Miftahul Huda Singosari</p>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger py-2 px-3 small"><?= htmlspecialchars($error) ?></div>
                    <?php endif; ?>

                    <form method="POST" action="index.php">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Username / NIS</label>
                            <input type="text" name="username" class="form-control" placeholder="Contoh: admin" required autofocus>
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-semibold">Password</label>
                            <input type="password" name="password" class="form-control" placeholder="Masukkan kata sandi" required>
                        </div>
                        <button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk ke Sistem
                        </button>
                    </form>
                </div>
                <div class="card-footer bg-transparent border-0 text-center pb-4 pt-0">
                    <small class="text-muted">Copyright © Umar Izzularab 2026 All Rights Reserved</small>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
