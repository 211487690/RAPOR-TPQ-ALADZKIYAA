import React, { useState } from 'react';
import { Sliders, Plus, Edit2, Trash2, Check, X, AlertTriangle, Layers, Percent } from 'lucide-react';
import { KomponenPenilaian, PredikatRule } from '../types';

interface KomponenNilaiViewProps {
  komponenList: KomponenPenilaian[];
  predikatList: PredikatRule[];
  onSaveKomponen: (k: KomponenPenilaian) => void;
  onDeleteKomponen: (id: string) => void;
  onSavePredikat: (p: PredikatRule) => void;
  onDeletePredikat: (id: string) => void;
}

export const KomponenNilaiView: React.FC<KomponenNilaiViewProps> = ({
  komponenList,
  predikatList,
  onSaveKomponen,
  onDeleteKomponen,
  onSavePredikat,
  onDeletePredikat
}) => {
  // Tabs: 'komponen' | 'predikat'
  const [activeTab, setActiveTab] = useState<'komponen' | 'predikat'>('komponen');

  // Modal Komponen
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKomponen, setEditingKomponen] = useState<KomponenPenilaian | null>(null);
  const [formData, setFormData] = useState<Partial<KomponenPenilaian>>({
    nama: '',
    bobot: 15,
    urutan: komponenList.length + 1,
    kategori: 'Al-Qur\'an & Tajwid',
    isAktif: true,
    showInRapor: true,
    deskripsiDefault: ''
  });

  // Modal Predikat
  const [isPredikatModalOpen, setIsPredikatModalOpen] = useState(false);
  const [editingPredikat, setEditingPredikat] = useState<PredikatRule | null>(null);
  const [predikatForm, setPredikatForm] = useState<Partial<PredikatRule>>({
    predikat: 'A+',
    label: 'Istimewa / Mutqin',
    minScore: 95,
    maxScore: 100,
    keterangan: 'Pencapaian sempurna dan teladan'
  });

  const totalBobot = komponenList
    .filter(k => k.isAktif)
    .reduce((sum, item) => sum + item.bobot, 0);

  const handleOpenCreateKomponen = () => {
    setEditingKomponen(null);
    setFormData({
      nama: '',
      bobot: 15,
      urutan: komponenList.length + 1,
      kategori: 'Al-Qur\'an & Tajwid',
      isAktif: true,
      showInRapor: true,
      deskripsiDefault: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditKomponen = (k: KomponenPenilaian) => {
    setEditingKomponen(k);
    setFormData({ ...k });
    setIsModalOpen(true);
  };

  const handleSubmitKomponen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;

    const obj: KomponenPenilaian = {
      id: editingKomponen ? editingKomponen.id : `kp-${Date.now()}`,
      nama: formData.nama || '',
      bobot: Number(formData.bobot) || 0,
      urutan: Number(formData.urutan) || 1,
      kategori: (formData.kategori as any) || 'Al-Qur\'an & Tajwid',
      isAktif: formData.isAktif ?? true,
      showInRapor: formData.showInRapor ?? true,
      deskripsiDefault: formData.deskripsiDefault || ''
    };

    onSaveKomponen(obj);
    setIsModalOpen(false);
  };

  // Predikat Handlers
  const handleOpenCreatePredikat = () => {
    setEditingPredikat(null);
    setPredikatForm({
      predikat: '',
      label: '',
      minScore: 70,
      maxScore: 80,
      keterangan: ''
    });
    setIsPredikatModalOpen(true);
  };

  const handleOpenEditPredikat = (p: PredikatRule) => {
    setEditingPredikat(p);
    setPredikatForm({ ...p });
    setIsPredikatModalOpen(true);
  };

  const handleSubmitPredikat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!predikatForm.predikat || !predikatForm.label) return;

    const obj: PredikatRule = {
      id: editingPredikat ? editingPredikat.id : `pr-${Date.now()}`,
      predikat: predikatForm.predikat || '',
      label: predikatForm.label || '',
      minScore: Number(predikatForm.minScore) || 0,
      maxScore: Number(predikatForm.maxScore) || 100,
      keterangan: predikatForm.keterangan || ''
    };

    onSavePredikat(obj);
    setIsPredikatModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <span>Komponen Penilaian &amp; Skala Predikat</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kustomisasi komponen nilai, pembobotan otomatis, kategori, serta rentang predikat rapor
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('komponen')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'komponen'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Komponen Nilai &amp; Bobot
          </button>
          <button
            onClick={() => setActiveTab('predikat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'predikat'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skala Nilai &amp; Predikat
          </button>
        </div>
      </div>

      {activeTab === 'komponen' ? (
        <>
          {/* Bobot Alert Banner */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalBobot === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Total Bobot Komponen Aktif: <span className={totalBobot === 100 ? 'text-emerald-700' : 'text-amber-600'}>{totalBobot}%</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {totalBobot === 100
                    ? 'Total bobot telah pas 100% untuk penghitungan nilai akhir terbobot.'
                    : 'Perhatian: Total bobot sebaiknya bernilai 100% agar perhitungan nilai akhir seimbang.'}
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenCreateKomponen}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Komponen</span>
            </button>
          </div>

          {/* Komponen Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Urutan</th>
                    <th className="px-4 py-3">Nama Komponen</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-center">Bobot (%)</th>
                    <th className="px-4 py-3 text-center">Tampil di Rapor</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {komponenList
                    .sort((a, b) => a.urutan - b.urutan)
                    .map(k => (
                      <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-slate-400">#{k.urutan}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{k.nama}</div>
                          {k.deskripsiDefault && (
                            <div className="text-[11px] text-slate-500">{k.deskripsiDefault}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {k.kategori}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900 tabular-nums">
                          {k.bobot}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          {k.showInRapor ? (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                              Ya
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                              Tidak
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            k.isAktif ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {k.isAktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditKomponen(k)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus komponen penilaian "${k.nama}"?`)) {
                                  onDeleteKomponen(k.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Predikat Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skala Nilai &amp; Konversi Predikat</h3>
              <p className="text-xs text-slate-500">
                Tentukan rentang angka (0-100), sebutan predikat, dan deskripsi kualitatif capaian
              </p>
            </div>
            <button
              onClick={handleOpenCreatePredikat}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Predikat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predikatList
              .sort((a, b) => b.minScore - a.minScore)
              .map(p => (
                <div key={p.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                          {p.predikat}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{p.label}</div>
                          <div className="text-xs text-slate-500">Rentang Nilai: <strong>{p.minScore} - {p.maxScore}</strong></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPredikat(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus aturan predikat "${p.predikat}"?`)) {
                              onDeletePredikat(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                      "{p.keterangan}"
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal Komponen Penilaian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingKomponen ? 'Edit Komponen Penilaian' : 'Tambah Komponen Penilaian'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitKomponen} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Komponen Penilaian *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Makharijul Huruf / Hafalan Surat"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option value="Al-Qur'an & Tajwid">Al-Qur'an &amp; Tajwid</option>
                  <option value="Hafalan">Hafalan Surat Pendek / Juz Amma</option>
                  <option value="Praktik Ibadah">Praktik Ibadah &amp; Doa Harian</option>
                  <option value="Akhlak & Adab">Akhlak &amp; Adab</option>
                  <option value="Lainnya">Lainnya / Ekstrakurikuler</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bobot Persentase (%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formData.bobot}
                    onChange={(e) => setFormData({ ...formData, bobot: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan Standar
                </label>
                <textarea
                  rows={2}
                  value={formData.deskripsiDefault}
                  onChange={(e) => setFormData({ ...formData, deskripsiDefault: e.target.value })}
                  placeholder="Deskripsi kompetensi yang dinilai"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.showInRapor}
                    onChange={(e) => setFormData({ ...formData, showInRapor: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Tampilkan komponen ini pada lembar rapor fisik/PDF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isAktif}
                    onChange={(e) => setFormData({ ...formData, isAktif: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Status Aktif</span>
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
                  Simpan Komponen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Predikat */}
      {isPredikatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingPredikat ? 'Edit Aturan Predikat' : 'Tambah Aturan Predikat Baru'}
              </h3>
              <button onClick={() => setIsPredikatModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitPredikat} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Huruf Predikat *
                  </label>
                  <input
                    type="text"
                    required
                    value={predikatForm.predikat}
                    onChange={(e) => setPredikatForm({ ...predikatForm, predikat: e.target.value.toUpperCase() })}
                    placeholder="Contoh: A / A+ / B"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Label Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    value={predikatForm.label}
                    onChange={(e) => setPredikatForm({ ...predikatForm, label: e.target.value })}
                    placeholder="Contoh: Sangat Baik (Mumtaz)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nilai Minimal (Skala 100) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={predikatForm.minScore}
                    onChange={(e) => setPredikatForm({ ...predikatForm, minScore: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nilai Maksimal (Skala 100) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={predikatForm.maxScore}
                    onChange={(e) => setPredikatForm({ ...predikatForm, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Narasi Capaian
                </label>
                <textarea
                  rows={3}
                  value={predikatForm.keterangan}
                  onChange={(e) => setPredikatForm({ ...predikatForm, keterangan: e.target.value })}
                  placeholder="Keterangan kualitatif yang dicantumkan pada rapor santri"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPredikatModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Simpan Predikat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
