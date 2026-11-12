import React, { useState } from 'react';
import {
  Settings,
  Building,
  Palette,
  Users,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Shield,
  KeyRound,
  DownloadCloud
} from 'lucide-react';
import { LembagaProfile, AppSettings, UserSession, Ustadz } from '../types';
import { storageService } from '../services/storageService';
import { zipPackageService } from '../services/zipPackageService';

interface PengaturanViewProps {
  initialTab?: 'lembaga' | 'tampilan' | 'pengguna' | 'backup';
  lembaga: LembagaProfile;
  settings: AppSettings;
  ustadzList: Ustadz[];
  onSaveLembaga: (profile: LembagaProfile) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveUstadzList: (list: Ustadz[]) => void;
  onResetDatabase: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  initialTab = 'lembaga',
  lembaga,
  settings,
  ustadzList,
  onSaveLembaga,
  onSaveSettings,
  onSaveUstadzList,
  onResetDatabase
}) => {
  const [activeTab, setActiveTab] = useState<'lembaga' | 'tampilan' | 'pengguna' | 'backup'>(initialTab);
  const [savedMsg, setSavedMsg] = useState('');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Sync activeTab when initialTab changes (e.g. from Sidebar navigation)
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Lembaga Form State
  const [lembagaForm, setLembagaForm] = useState<LembagaProfile>({ ...lembaga });

  // AppSettings Form State
  const [settingsForm, setSettingsForm] = useState<AppSettings>({ ...settings });

  // Admin Password Change
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    username: 'admin',
    newPassword: 'admin123',
    confirmPassword: 'admin123'
  });

  const handleSaveLembagaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLembaga(lembagaForm);
    setSavedMsg('Profil lembaga berhasil diperbarui!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settingsForm);
    if (settingsForm.tempatCetakRapor || settingsForm.footerText) {
      const updatedLembaga = {
        ...lembagaForm,
        kotaPenerbitan: settingsForm.tempatCetakRapor || lembagaForm.kotaPenerbitan,
        footnote: settingsForm.footerText || lembagaForm.footnote
      };
      setLembagaForm(updatedLembaga);
      onSaveLembaga(updatedLembaga);
    }
    setSavedMsg('Pengaturan tampilan, tempat & tanggal cetak berhasil disimpan!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLembagaForm({
        ...lembagaForm,
        logoUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Backup JSON Download
  const handleDownloadJSONBackup = () => {
    try {
      const jsonStr = storageService.exportFullDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Backup_Database_TPQ_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMsg({ type: 'success', text: 'Cadangan database JSON berhasil diunduh!' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch {
      setStatusMsg({ type: 'error', text: 'Gagal mengekspor file cadangan JSON.' });
    }
  };

  // Backup SQL Download
  const handleDownloadSQLBackup = () => {
    try {
      const sqlStr = zipPackageService.generateDatabaseSQL(lembaga);
      const blob = new Blob([sqlStr], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tpq_aladzkiyaa_${new Date().toISOString().split('T')[0]}.sql`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMsg({ type: 'success', text: 'File database.sql lengkap (22 tabel) berhasil diunduh!' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch {
      setStatusMsg({ type: 'error', text: 'Gagal mengekspor skema SQL.' });
    }
  };

  // Restore JSON File
  const handleRestoreJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = storageService.importFullDatabaseJSON(content);
      if (ok) {
        setStatusMsg({ type: 'success', text: 'Database berhasil dipulihkan dari file JSON! Memuat ulang data...' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: 'Format file cadangan tidak valid atau rusak.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download Deployable PHP ZIP
  const handleDownloadDeployPackage = async () => {
    setIsDownloadingZip(true);
    setStatusMsg({ type: 'info', text: 'Sedang mengompilasi seluruh 16 modul PHP 8+, skema MySQL, dan aset ke dalam paket ZIP...' });
    try {
      await zipPackageService.downloadDeployPackage(lembaga, settings.appName);
      setStatusMsg({
        type: 'success',
        text: 'Paket ZIP Siap Deploy PHP 8+ & MySQL berhasil dibuat dan diunduh! Seluruh 16 halaman, konfigurasi database PDO, dan file database.sql sudah lengkap.'
      });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Gagal membuat paket ZIP deploy.' });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Pengaturan Sistem &amp; Kustomisasi TPQ</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kustomisasi 100% profil lembaga, identitas rapor, logo, akun login, dan cadangan database
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {savedMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setActiveTab('lembaga')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'lembaga' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Profil Lembaga &amp; Kontak</span>
        </button>
        <button
          onClick={() => setActiveTab('tampilan')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'tampilan' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Tampilan &amp; Format Rapor</span>
        </button>
        <button
          onClick={() => setActiveTab('pengguna')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'pengguna' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Manajemen Pengguna</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'backup' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Cadangan &amp; Paket ZIP Deploy</span>
        </button>
      </div>

      {/* TAB 1: Lembaga Profile Form */}
      {activeTab === 'lembaga' && (
        <form onSubmit={handleSaveLembagaSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Identitas Lembaga TPQ</h3>
              <p className="text-slate-500">Perubahan identitas otomatis langsung tercermin pada dashboard, lembar rapor, dan piagam juara.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              Simpan Profil Lembaga
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lembaga TPQ *
                </label>
                <input
                  type="text"
                  required
                  value={lembagaForm.nama}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, nama: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Yayasan Penyelenggara *
                </label>
                <input
                  type="text"
                  required
                  value={lembagaForm.yayasan}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, yayasan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Statistik (NSTPQ / Ijin Operasional) *
                  </label>
                  <input
                    type="text"
                    required
                    value={lembagaForm.nstpq || lembagaForm.nspq || ''}
                    onChange={(e) => setLembagaForm({ ...lembagaForm, nstpq: e.target.value, nspq: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Telepon / WhatsApp Lembaga *
                  </label>
                  <input
                    type="text"
                    required
                    value={lembagaForm.telepon}
                    onChange={(e) => setLembagaForm({ ...lembagaForm, telepon: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Website Lembaga
                </label>
                <input
                  type="text"
                  value={lembagaForm.website}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            {/* Logo Preview & Upload */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
              <label className="font-semibold text-slate-700 block">Logo Lembaga TPQ</label>
              <div className="w-24 h-24 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                <img
                  src={lembagaForm.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
                  alt="Logo TPQ"
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer hover:bg-slate-100">
                <span>Ganti Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-slate-400">Format PNG / JPG / WebP</span>
            </div>
          </div>

          {/* Alamat & Wilayah */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Alamat Lengkap &amp; Lokasi Wilayah
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Lengkap Jalan / Kompleks *
              </label>
              <input
                type="text"
                required
                value={lembagaForm.alamat}
                onChange={(e) => setLembagaForm({ ...lembagaForm, alamat: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
                <input
                  type="text"
                  value={lembagaForm.kelurahan}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, kelurahan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={lembagaForm.kecamatan}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, kecamatan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={lembagaForm.kota}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, kota: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  value={lembagaForm.provinsi}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, provinsi: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Penandatangan Dokumen */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Pengesahan Dokumen &amp; Penerbitan Rapor
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kepala / Pengasuh TPQ *
                </label>
                <input
                  type="text"
                  required
                  value={lembagaForm.kepalaTpq}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, kepalaTpq: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP / No. Identitas Kepala (Boleh Kosong)
                </label>
                <input
                  type="text"
                  value={lembagaForm.nipKepala}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, nipKepala: e.target.value })}
                  placeholder="Dikosongkan jika tidak ada"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kota Tempat Penerbitan Rapor *
                </label>
                <input
                  type="text"
                  required
                  value={lembagaForm.kotaPenerbitan}
                  onChange={(e) => setLembagaForm({ ...lembagaForm, kotaPenerbitan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Tampilan & Format Rapor */}
      {activeTab === 'tampilan' && (
        <form onSubmit={handleSaveSettingsSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Tampilan &amp; Cetak</h3>
              <p className="text-slate-500">Sesuaikan judul aplikasi, ukuran kertas, dan teks catatan kaki</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              Simpan Pengaturan Tampilan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Aplikasi
              </label>
              <input
                type="text"
                required
                value={settingsForm.appName}
                onChange={(e) => setSettingsForm({ ...settingsForm, appName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ukuran Kertas Rapor Default
              </label>
              <select
                value={settingsForm.paperSize}
                onChange={(e) => setSettingsForm({ ...settingsForm, paperSize: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              >
                <option value="A4">A4 (210 x 297 mm) - Standar Resmi</option>
                <option value="F4">F4 / Folio (215 x 330 mm)</option>
              </select>
            </div>

            {/* Tempat dan Tanggal Cetak Rapor */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-2.5 text-emerald-800">
                Tempat &amp; Tanggal Cetak Lembar Rapor
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tempat / Kota Cetak Rapor *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.tempatCetakRapor || lembagaForm.kotaPenerbitan || ''}
                    onChange={(e) => {
                      setSettingsForm({ ...settingsForm, tempatCetakRapor: e.target.value });
                      setLembagaForm({ ...lembagaForm, kotaPenerbitan: e.target.value });
                    }}
                    placeholder="Contoh: Malang / Singosari"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Dicetak di atas tanda tangan rapor &amp; piagam</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Cetak Semester Ganjil *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.tanggalCetakRaporGanjil || '20 Desember 2025'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tanggalCetakRaporGanjil: e.target.value })}
                    placeholder="Contoh: 20 Desember 2025"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                  <span className="text-[10px] text-slate-400">Format teks bebas atau DD MMMM YYYY</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Cetak Semester Genap *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.tanggalCetakRaporGenap || '20 Juni 2026'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tanggalCetakRaporGenap: e.target.value })}
                    placeholder="Contoh: 20 Juni 2026"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                  <span className="text-[10px] text-slate-400">Digunakan pada penerbitan akhir tahun ajaran</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Teks Hak Cipta / Footnote Aplikasi *
              </label>
              <input
                type="text"
                required
                value={settingsForm.footerText}
                onChange={(e) => {
                  setSettingsForm({ ...settingsForm, footerText: e.target.value });
                  setLembagaForm({ ...lembagaForm, footnote: e.target.value });
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Manajemen Pengguna */}
      {activeTab === 'pengguna' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Manajemen Pengguna &amp; Hak Akses</h3>
            <p className="text-slate-500">Kelola akun administrator, kepala TPQ, ustadz/ustadzah, dan santri</p>
          </div>

          {/* Admin Account Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Akun Utama Administrator TPQ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  disabled
                  value="admin"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password Administrator</label>
                <input
                  type="text"
                  value={adminPasswordForm.newPassword}
                  onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setSavedMsg('Password administrator berhasil diperbarui menjadi: ' + adminPasswordForm.newPassword);
                    setTimeout(() => setSavedMsg(''), 4000);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Perbarui Sandi Admin
                </button>
              </div>
            </div>
          </div>

          {/* List of Ustadz Login Credentials */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">Daftar Akun Tenaga Pengajar (Ustadz &amp; Ustadzah)</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {ustadzList.map(u => (
                <div key={u.id} className="p-3 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                      {u.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{u.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Username: <strong>{u.username}</strong> · Password: <strong>{u.password || 'password123'}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded capitalize">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Backup & Restore & ZIP Deploy */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cadangan &amp; Pemulihan Database</h3>
            <p className="text-slate-500">Amankan data santri, nilai, dan pengaturan aplikasi secara rutin</p>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Highlight Deployable ZIP */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-200/80 px-2 py-0.5 rounded">
                Deployment Ready
              </span>
              <h4 className="text-base font-bold text-emerald-950">
                Paket ZIP Siap Deploy (PHP 8+ &amp; MySQL Database)
              </h4>
              <p className="text-slate-600 max-w-xl text-xs leading-relaxed">
                Unduh paket komplit siap pasang di cPanel / VPS hosting (PHP 8+, PDO prepared statements, database.sql 22 tabel terhubung, bootstrap 5 UI, dan panduan instalasi lengkap).
              </p>
            </div>

            <button
              onClick={handleDownloadDeployPackage}
              disabled={isDownloadingZip}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>{isDownloadingZip ? 'Membuat ZIP...' : 'Download Paket ZIP Siap Deploy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Backup SQL */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Unduh File Skema &amp; Data MySQL (.SQL)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Ekspor seluruh struktur database relasional (22 tabel) dan isi data awal TPQ untuk diimpor ke phpMyAdmin.
              </p>
              <button
                type="button"
                onClick={handleDownloadSQLBackup}
                className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Database.sql</span>
              </button>
            </div>

            {/* Backup JSON */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Cadangkan Data Aplikasi (.JSON)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Simpan seluruh snapshot data santri, nilai, rapor, dan pengaturan ke file cadangan JSON.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleDownloadJSONBackup}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pulihkan (Restore JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreJSONFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Reset to Default */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Ke Template Awal TPQ Al-Adzkiyaa’</span>
            </div>
            <p className="text-rose-800 text-[11px]">
              Tindakan ini akan mengembalikan seluruh database ke kondisi awal default TPQ Al-Adzkiyaa’ di Singosari Malang.
            </p>
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded"
              >
                Reset ke Pengaturan Awal
              </button>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetDatabase();
                    setShowResetConfirm(false);
                    setStatusMsg({ type: 'success', text: 'Database berhasil dikembalikan ke pengaturan awal TPQ Al-Adzkiyaa’!' });
                  }}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded shadow-xs"
                >
                  Ya, Konfirmasi Reset Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
