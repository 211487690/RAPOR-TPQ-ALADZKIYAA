import React from 'react';
import { X, AlertCircle, CheckCircle, Info, Calendar } from 'lucide-react';
import { Santri, NilaiSantri, TahunPelajaran } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  nilaiList: NilaiSantri[];
  activeTahun: TahunPelajaran;
  onNavigateToGrades: () => void;
  onNavigateToSantri: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  santriList,
  nilaiList,
  activeTahun,
  onNavigateToGrades,
  onNavigateToSantri
}) => {
  if (!isOpen) return null;

  // Compute incomplete evaluations
  const activeSantri = santriList.filter(s => s.status === 'aktif');
  const evaluatedSantriIds = new Set(
    nilaiList
      .filter(n => n.tahunId === activeTahun.id && n.semester === activeTahun.semesterAktif)
      .map(n => n.santriId)
  );

  const unevaluatedSantri = activeSantri.filter(s => !evaluatedSantriIds.has(s.id));
  const incompleteBiodataSantri = activeSantri.filter(
    s => !s.noHpOrtu || s.noHpOrtu === '-' || !s.alamat || s.alamat === '-'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Pemberitahuan Sistem &amp; Kelengkapan Data</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Notification 1: Nilai Belum Lengkap */}
          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-900">
                  {unevaluatedSantri.length > 0
                    ? `Perhatian: Ada ${unevaluatedSantri.length} Santri Belum Dinilai`
                    : 'Semua Santri Sudah Memiliki Catatan Nilai'}
                </div>
                <div className="text-xs text-amber-800 mt-1">
                  {unevaluatedSantri.length > 0 ? (
                    <>
                      Tahun Pelajaran <span className="font-semibold">{activeTahun.tahun}</span> Semester{' '}
                      <span className="font-semibold">{activeTahun.semesterAktif}</span>. Mohon ustadz segera
                      menyelesaikan rekapitulasi nilai sebelum cetak rapor.
                    </>
                  ) : (
                    'Seluruh santri aktif telah memiliki catatan nilai di semester aktif saat ini.'
                  )}
                </div>
                {unevaluatedSantri.length > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToGrades();
                    }}
                    className="mt-2.5 px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                  >
                    Buka Input Nilai Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification 2: Biodata Santri Belum Lengkap */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-900">
                  {incompleteBiodataSantri.length > 0
                    ? `${incompleteBiodataSantri.length} Santri Perlu Melengkapi Kontak/Alamat`
                    : 'Biodata & Kontak Santri Lengkap'}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Kontak orang tua/wali diperlukan untuk konfirmasi kehadiran dan pengesahan rapor berkala.
                </p>
                {incompleteBiodataSantri.length > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSantri();
                    }}
                    className="mt-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Lihat Daftar Santri
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification 3: Jadwal Pembagian Rapor */}
          <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Jadwal Pembagian Rapor Semester {activeTahun.semesterAktif}
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Tanggal yang ditetapkan:{' '}
                  <span className="font-semibold">
                    {activeTahun.semesterAktif === 'Ganjil'
                      ? activeTahun.tanggalRaporGanjil || '20 Desember 2025'
                      : activeTahun.tanggalRaporGenap || '20 Juni 2026'}
                  </span>
                  . Pastikan seluruh piagam penghargaan juara telah dicetak.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
