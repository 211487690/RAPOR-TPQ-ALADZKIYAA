import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, UserCheck, X } from 'lucide-react';
import { Kelas, Ustadz, Santri } from '../types';

interface KelasViewProps {
  kelasList: Kelas[];
  ustadzList: Ustadz[];
  santriList: Santri[];
  onSaveKelas: (k: Kelas) => void;
  onDeleteKelas: (id: string) => void;
  onAssignSantri: (santriId: string, targetKelasId: string) => void;
}

export const KelasView: React.FC<KelasViewProps> = ({
  kelasList,
  ustadzList,
  santriList,
  onSaveKelas,
  onDeleteKelas,
  onAssignSantri
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [selectedRosterKelas, setSelectedRosterKelas] = useState<Kelas | null>(null);

  const [formData, setFormData] = useState<Partial<Kelas>>({
    namaKelas: '',
    tingkatan: 'Pemula',
    ustadzId: ustadzList[0]?.id || '',
    urutan: kelasList.length + 1,
    kapasitas: 25,
    keterangan: ''
  });

  const handleOpenCreate = () => {
    setEditingKelas(null);
    setFormData({
      namaKelas: '',
      tingkatan: 'Pemula',
      ustadzId: ustadzList[0]?.id || '',
      urutan: kelasList.length + 1,
      kapasitas: 25,
      keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (k: Kelas) => {
    setEditingKelas(k);
    setFormData({ ...k });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKelas) return;

    const kelasObj: Kelas = {
      id: editingKelas ? editingKelas.id : `k-${Date.now()}`,
      namaKelas: formData.namaKelas || '',
      tingkatan: formData.tingkatan || 'Pemula',
      ustadzId: formData.ustadzId || '',
      urutan: Number(formData.urutan) || 1,
      kapasitas: Number(formData.kapasitas) || 25,
      keterangan: formData.keterangan || ''
    };

    onSaveKelas(kelasObj);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Kelas &amp; Halaqoh Belajar</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kelola nama kelompok, tingkatan, wali pengampu, urutan rapor, dan daftar anggota santri
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas / Halaqoh</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kelasList
          .sort((a, b) => a.urutan - b.urutan)
          .map(k => {
            const pengampu = ustadzList.find(u => u.id === k.ustadzId);
            const santriInKelas = santriList.filter(s => s.kelasId === k.id && s.status === 'aktif');

            return (
              <div
                key={k.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-emerald-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Urutan Rapor #{k.urutan} · {k.tingkatan}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{k.namaKelas}</h4>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Wali: <strong className="text-slate-800">{pengampu?.nama || 'Belum Ditentukan'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Jumlah Santri: <strong className="text-emerald-700">{santriInKelas.length}</strong> / {k.kapasitas} Santri</span>
                    </div>
                    {k.keterangan && (
                      <p className="text-[11px] text-slate-500 italic mt-1">{k.keterangan}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => setSelectedRosterKelas(k)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Lihat Anggota ({santriInKelas.length})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(k)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded"
                      title="Edit Kelas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus kelas "${k.namaKelas}"? Santri dalam kelas ini akan dipindahkan ke kategori umum.`)) {
                          onDeleteKelas(k.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal Add / Edit Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingKelas ? 'Edit Kelas / Halaqoh' : 'Tambah Kelas / Halaqoh Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kelas / Halaqoh *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaKelas}
                  onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                  placeholder="Contoh: Halaqoh Bilqolam Abu Bakar"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkatan
                </label>
                <select
                  value={formData.tingkatan}
                  onChange={(e) => setFormData({ ...formData, tingkatan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option value="Pemula">Pemula (Dasar)</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjutan">Lanjutan (Mahir)</option>
                  <option value="Tahfidz">Tahfidz</option>
                  <option value="Pasca TPQ">Pasca TPQ</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Wali Kelas / Ustadz Pengampu
                </label>
                <select
                  value={formData.ustadzId}
                  onChange={(e) => setFormData({ ...formData, ustadzId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option value="">-- Pilih Ustadz --</option>
                  {ustadzList.map(u => (
                    <option key={u.id} value={u.id}>{u.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urutan di Rapor
                  </label>
                  <input
                    type="number"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas Santri
                  </label>
                  <input
                    type="number"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan / Catatan
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Daftar Anggota Kelas (Roster) & Pengaturan Santri */}
      {selectedRosterKelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan Santri: {selectedRosterKelas.namaKelas}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Wali Halaqoh: {ustadzList.find(u => u.id === selectedRosterKelas.ustadzId)?.nama || 'Belum Ditentukan'} · Kapasitas: {selectedRosterKelas.kapasitas} Santri
                </p>
              </div>
              <button onClick={() => setSelectedRosterKelas(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add / Move Student into This Class */}
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  + Masukkan / Pindahkan Santri ke Kelas Ini:
                </label>
                <select
                  id="select-santri-transfer"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih santri yang ingin dimasukkan --</option>
                  {santriList
                    .filter(s => s.status === 'aktif' && s.kelasId !== selectedRosterKelas.id)
                    .map(s => {
                      const curK = kelasList.find(k => k.id === s.kelasId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.namaLengkap} (NIS: {s.nis}) — {curK ? `Dari: ${curK.namaKelas}` : 'Belum Punya Kelas'}
                        </option>
                      );
                    })}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  const selectEl = document.getElementById('select-santri-transfer') as HTMLSelectElement;
                  const santriId = selectEl?.value;
                  if (!santriId) {
                    alert('Silakan pilih santri terlebih dahulu.');
                    return;
                  }
                  onAssignSantri(santriId, selectedRosterKelas.id);
                  selectEl.value = '';
                }}
                className="mt-2 sm:mt-4 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors self-end sm:self-auto shrink-0"
              >
                Tambahkan ke Kelas Ini
              </button>
            </div>

            {/* Current Roster List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Daftar Santri Terdaftar ({santriList.filter(s => s.kelasId === selectedRosterKelas.id && s.status === 'aktif').length} Santri):</span>
                <span className="text-[11px] text-slate-500 font-normal">Guru &amp; Admin dapat mengatur/memindahkan kelas</span>
              </div>

              {santriList.filter(s => s.kelasId === selectedRosterKelas.id && s.status === 'aktif').length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                  Belum ada santri aktif di halaqoh ini. Gunakan menu di atas untuk memasukkan santri.
                </div>
              ) : (
                santriList
                  .filter(s => s.kelasId === selectedRosterKelas.id && s.status === 'aktif')
                  .map((s, idx) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 w-5">{idx + 1}.</span>
                        <div>
                          <div className="font-bold text-slate-900">{s.namaLengkap}</div>
                          <div className="text-[11px] text-slate-500">
                            NIS: {s.nis} · JK: {s.jk} · Jilid: {s.jilidId}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Move to another class */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Pindah ke:</span>
                          <select
                            value={s.kelasId}
                            onChange={(e) => {
                              const targetId = e.target.value;
                              if (targetId && targetId !== selectedRosterKelas.id) {
                                onAssignSantri(s.id, targetId);
                              }
                            }}
                            className="text-[11px] px-2 py-1 border border-slate-300 rounded bg-white text-slate-700"
                          >
                            <option value={selectedRosterKelas.id}>Tetap di Kelas Ini</option>
                            {kelasList
                              .filter(k => k.id !== selectedRosterKelas.id)
                              .map(k => (
                                <option key={k.id} value={k.id}>{k.namaKelas}</option>
                              ))}
                          </select>
                        </div>

                        {/* Unassign button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Keluarkan ${s.namaLengkap} dari kelas ${selectedRosterKelas.namaKelas}?`)) {
                              onAssignSantri(s.id, '');
                            }
                          }}
                          className="px-2 py-1 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                          title="Keluarkan santri dari kelas ini"
                        >
                          Lepas Kelas
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Total Kuota: {selectedRosterKelas.kapasitas} | Terisi: {santriList.filter(s => s.kelasId === selectedRosterKelas.id && s.status === 'aktif').length} Santri
              </span>
              <button
                onClick={() => setSelectedRosterKelas(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 shadow-2xs"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
