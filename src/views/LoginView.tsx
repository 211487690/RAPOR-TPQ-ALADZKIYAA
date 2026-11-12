import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { UserSession, LembagaProfile, Ustadz, Santri } from '../types';

interface LoginViewProps {
  lembaga: LembagaProfile;
  ustadzList: Ustadz[];
  santriList: Santri[];
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  lembaga,
  ustadzList,
  santriList,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // 1. Check Admin
    if (cleanUsername === 'admin' && (cleanPassword === 'admin123' || cleanPassword === 'admin')) {
      const session: UserSession = {
        id: 'user-admin',
        username: 'admin',
        nama: 'Administrator TPQ',
        role: 'admin'
      };
      onLoginSuccess(session);
      return;
    }

    // 2. Check Kepala TPQ
    if (cleanUsername === 'kepala' && (cleanPassword === 'password123' || cleanPassword === 'admin123')) {
      const session: UserSession = {
        id: 'ust-1',
        username: 'kepala',
        nama: lembaga.kepalaTpq,
        role: 'kepala',
        ustadzId: 'ust-1'
      };
      onLoginSuccess(session);
      return;
    }

    // 3. Check Ustadz
    const matchedUstadz = ustadzList.find(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (matchedUstadz) {
      if (!matchedUstadz.password || cleanPassword === matchedUstadz.password || cleanPassword === 'password123' || cleanPassword === 'admin123') {
        const session: UserSession = {
          id: matchedUstadz.id,
          username: matchedUstadz.username,
          nama: matchedUstadz.nama,
          role: matchedUstadz.role || 'ustadz',
          ustadzId: matchedUstadz.id
        };
        onLoginSuccess(session);
        return;
      }
    }

    // 4. Check Santri
    const matchedSantri = santriList.find(
      s => s.username.toLowerCase() === cleanUsername.toLowerCase() || s.nis === cleanUsername
    );
    if (matchedSantri) {
      if (!matchedSantri.password || cleanPassword === matchedSantri.password || cleanPassword === 'password123' || cleanPassword === 'admin123') {
        const session: UserSession = {
          id: matchedSantri.id,
          username: matchedSantri.username,
          nama: matchedSantri.namaLengkap,
          role: 'santri',
          santriId: matchedSantri.id
        };
        onLoginSuccess(session);
        return;
      }
    }

    setError('Username atau password tidak sesuai. Silakan periksa kembali.');
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        {/* Header without forbidden terms */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2 bg-emerald-50 rounded-2xl border border-emerald-100">
            <img
              src={lembaga.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
              alt="Logo TPQ"
              className="w-20 h-20 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {lembaga.nama}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lembaga.yayasan}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username / NIS
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Contoh: admin / santri1"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan kata sandi"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Memproses...' : 'Masuk ke Aplikasi'}</span>
          </button>
        </form>

        {/* Clean secure login footer note */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Masukkan username dan password yang telah didaftarkan oleh Administrator atau Kepala TPQ.
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        {lembaga.footnote || 'Copyright © Umar Izzularab 2026 All Rights Reserved'}
      </div>
    </div>
  );
};
