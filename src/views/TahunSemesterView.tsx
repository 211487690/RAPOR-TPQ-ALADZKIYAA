import React, { useState } from 'react';
import { CalendarDays, Plus, Edit2, Trash2, Lock, Unlock, CheckCircle2, X } from 'lucide-react';
import { TahunPelajaran } from '../types';

interface TahunSemesterViewProps {
  tahunList: TahunPelajaran[];
  onSaveTahun: (t: TahunPelajaran) => void;
  onSetActiveTahun: (id: string, semester: 'Ganjil' | 'Genap') => void;
  onToggleLock: (id: string) => void;
  onDeleteTahun: (id: string) => void;
}

export const TahunSemesterView: React.FC<TahunSemesterViewProps> = ({
  tahunList,
  onSaveTahun,
  onSetActiveTahun,
  onToggleLock,
  onDeleteTahun
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTahun, setEditingTahun] = useState<TahunPelajaran | null>(null);

  const [formData, setFormData] = useState<Partial<TahunPelajaran>>({
    tahun: '2026/2027',
    semesterAktif: 'Ganjil',
    isAktif: false,
    isLocked: false,
    tanggalRaporGanjil: '2026-12-19',
    tanggalRaporGenap: '2027-06-19'
  });

  const handleOpenCreate = () => {
    setEditingTahun(null);
    setFormData({
      tahun: '2026/2027',
      semesterAktif: 'Ganjil',
      isAktif: false,
      isLocked: false,
      tanggalRaporGanjil: '2026-12-19',
      tanggalRaporGenap: '2027-06-19'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TahunPelajaran) => {
    setEditingTahun(t);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tahun) return;

    const tahunObj: TahunPelajaran = {
      id: editingTahun ? editingTahun.id : `tp-${Date.now()}`,
      tahun: formData.tahun || '',
      semesterAktif: (formData.semesterAktif as any) || 'Ganjil',
      isAktif: formData.isAktif || false,
      isLocked: formData.isLocked || false,
      tanggalRaporGanjil: formData.tanggalRaporGanjil || '2025-12-20',
      tanggalRaporGenap: formData.tanggalRaporGenap || '2026-06-20'
    };

    onSaveTahun(tahunObj);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <span>Tahun Pelajaran &amp; Semester</span>
          </h2>
          <p className="text-xs text-slate-500">
            Atur tahun aktif, pergantian semester ganjil/genap, penguncian data rapor, dan tanggal pembagian
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tahun Pelajaran</span>
        </button>
      </div>

      {/* Grid of Academic Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tahunList.map(t => (
          <div
            key={t.id}
            className={`p-5 rounded-xl border transition-all ${
              t.isAktif
                ? 'bg-emerald-50/50 border-emerald-500 shadow-sm'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{t.tahun}</h3>
                  {t.isAktif && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                      TAHUN AKTIF
                    </span>
                  )}
                  {t.isLocked ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Terkunci
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Terbuka
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Semester Aktif:{' '}
                  <strong className="text-slate-800">{t.semesterAktif}</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                  title="Edit Periode"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleLock(t.id)}
                  className={`p-1.5 rounded transition-colors ${
                    t.isLocked ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title={t.isLocked ? 'Buka Kunci Tahun Ini' : 'Kunci Tahun (Mencegah Perubahan Nilai)'}
                >
                  {t.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                {!t.isAktif && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus periode tahun pelajaran "${t.tahun}"?`)) {
                        onDeleteTahun(t.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Hapus Tahun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Dates & Semester Options */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 p-2.5 rounded border border-slate-200">
                <div className="font-semibold text-slate-700">Semester Ganjil</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Rapor: {t.tanggalRaporGanjil || '20 Des 2025'}
                </div>
                {t.isAktif && t.semesterAktif === 'Genap' && (
                  <button
                    onClick={() => onSetActiveTahun(t.id, 'Ganjil')}
                    className="mt-2 text-[10px] font-semibold text-emerald-700 hover:underline"
                  >
                    Aktifkan Semester Ganjil
                  </button>
                )}
              </div>

              <div className="bg-white/80 p-2.5 rounded border border-slate-200">
                <div className="font-semibold text-slate-700">Semester Genap</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Rapor: {t.tanggalRaporGenap || '20 Jun 2026'}
                </div>
                {t.isAktif && t.semesterAktif === 'Ganjil' && (
                  <button
                    onClick={() => onSetActiveTahun(t.id, 'Genap')}
                    className="mt-2 text-[10px] font-semibold text-emerald-700 hover:underline"
                  >
                    Aktifkan Semester Genap
                  </button>
                )}
              </div>
            </div>

            {/* Set as Active Button */}
            {!t.isAktif && (
              <div className="mt-3 text-right">
                <button
                  onClick={() => onSetActiveTahun(t.id, t.semesterAktif)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded hover:bg-emerald-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jadikan Tahun Pelajaran Aktif</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Tahun */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTahun ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Format Tahun Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                  placeholder="Contoh: 2026/2027"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Semester Aktif
                </label>
                <select
                  value={formData.semesterAktif}
                  onChange={(e) => setFormData({ ...formData, semesterAktif: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Rapor Ganjil
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalRaporGanjil}
                    onChange={(e) => setFormData({ ...formData, tanggalRaporGanjil: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Rapor Genap
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalRaporGenap}
                    onChange={(e) => setFormData({ ...formData, tanggalRaporGenap: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Kunci tahun ini (selesai &amp; arsip rapor tidak boleh tertimpa)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Simpan Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
