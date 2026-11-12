import React, { useState } from 'react';
import { BookmarkCheck, Plus, Edit2, Trash2, BookOpen, Layers, Check, X } from 'lucide-react';
import { MetodePembelajaran, JilidItem } from '../types';

interface MetodeJilidViewProps {
  metodeList: MetodePembelajaran[];
  onSaveMetode: (m: MetodePembelajaran) => void;
  onDeleteMetode: (id: string) => void;
}

export const MetodeJilidView: React.FC<MetodeJilidViewProps> = ({
  metodeList,
  onSaveMetode,
  onDeleteMetode
}) => {
  const [selectedMetodeId, setSelectedMetodeId] = useState<string>(metodeList[0]?.id || '');
  const [isMetodeModalOpen, setIsMetodeModalOpen] = useState(false);
  const [isJilidModalOpen, setIsJilidModalOpen] = useState(false);

  const [editingMetode, setEditingMetode] = useState<MetodePembelajaran | null>(null);
  const [metodeForm, setMetodeForm] = useState({ nama: '', deskripsi: '' });

  const [editingJilid, setEditingJilid] = useState<JilidItem | null>(null);
  const [jilidForm, setJilidForm] = useState({
    nama: '',
    target: '',
    syaratLulus: '',
    urutan: 1
  });

  const activeMetode = metodeList.find(m => m.id === selectedMetodeId) || metodeList[0];

  // Open Create Metode Modal
  const handleOpenCreateMetode = () => {
    setEditingMetode(null);
    setMetodeForm({ nama: '', deskripsi: '' });
    setIsMetodeModalOpen(true);
  };

  const handleOpenEditMetode = (m: MetodePembelajaran) => {
    setEditingMetode(m);
    setMetodeForm({ nama: m.nama, deskripsi: m.deskripsi });
    setIsMetodeModalOpen(true);
  };

  const handleSubmitMetode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodeForm.nama) return;

    if (editingMetode) {
      const updated: MetodePembelajaran = {
        ...editingMetode,
        nama: metodeForm.nama,
        deskripsi: metodeForm.deskripsi
      };
      onSaveMetode(updated);
    } else {
      const newMetode: MetodePembelajaran = {
        id: `m-${Date.now()}`,
        nama: metodeForm.nama,
        deskripsi: metodeForm.deskripsi,
        jilidList: []
      };
      onSaveMetode(newMetode);
      setSelectedMetodeId(newMetode.id);
    }
    setIsMetodeModalOpen(false);
  };

  // Open Create Jilid Modal
  const handleOpenCreateJilid = () => {
    if (!activeMetode) return;
    setEditingJilid(null);
    setJilidForm({
      nama: `${activeMetode.nama} Jilid ${(activeMetode.jilidList.length + 1)}`,
      target: '',
      syaratLulus: 'Lancar membaca dan menguasai materi jilid',
      urutan: activeMetode.jilidList.length + 1
    });
    setIsJilidModalOpen(true);
  };

  const handleOpenEditJilid = (j: JilidItem) => {
    setEditingJilid(j);
    setJilidForm({
      nama: j.nama,
      target: j.target,
      syaratLulus: j.syaratLulus,
      urutan: j.urutan
    });
    setIsJilidModalOpen(true);
  };

  const handleSubmitJilid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMetode || !jilidForm.nama) return;

    let updatedJilidList = [...activeMetode.jilidList];
    if (editingJilid) {
      updatedJilidList = updatedJilidList.map(item =>
        item.id === editingJilid.id
          ? {
              ...item,
              nama: jilidForm.nama,
              target: jilidForm.target,
              syaratLulus: jilidForm.syaratLulus,
              urutan: Number(jilidForm.urutan)
            }
          : item
      );
    } else {
      const newJilid: JilidItem = {
        id: `j-${Date.now()}`,
        nama: jilidForm.nama,
        target: jilidForm.target,
        syaratLulus: jilidForm.syaratLulus,
        urutan: Number(jilidForm.urutan)
      };
      updatedJilidList.push(newJilid);
    }

    const updatedMetode: MetodePembelajaran = {
      ...activeMetode,
      jilidList: updatedJilidList.sort((a, b) => a.urutan - b.urutan)
    };

    onSaveMetode(updatedMetode);
    setIsJilidModalOpen(false);
  };

  const handleDeleteJilid = (jId: string) => {
    if (!activeMetode) return;
    if (confirm('Hapus tingkatan jilid ini?')) {
      const updatedMetode: MetodePembelajaran = {
        ...activeMetode,
        jilidList: activeMetode.jilidList.filter(item => item.id !== jId)
      };
      onSaveMetode(updatedMetode);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-600" />
            <span>Metode Pembelajaran &amp; Tingkatan Jilid</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kelola metode pembelajaran (Bilqolam, Juz 'Amma, Al-Qur'an 30 Juz) beserta tingkatan kompetensi
          </p>
        </div>

        <button
          onClick={handleOpenCreateMetode}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Metode Baru</span>
        </button>
      </div>

      {/* Metode Selection Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200">
        {metodeList.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMetodeId(m.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              (activeMetode?.id === m.id)
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{m.nama}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeMetode?.id === m.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {m.jilidList.length} Tingkat
            </span>
          </button>
        ))}
      </div>

      {/* Active Metode Detail & Jilid List */}
      {activeMetode && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{activeMetode.nama}</h3>
                <button
                  onClick={() => handleOpenEditMetode(activeMetode)}
                  className="p-1 text-slate-400 hover:text-emerald-700"
                  title="Edit Nama Metode"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {metodeList.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus metode "${activeMetode.nama}"?`)) {
                        onDeleteMetode(activeMetode.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Hapus Metode"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{activeMetode.deskripsi || 'Tidak ada keterangan khusus.'}</p>
            </div>

            <button
              onClick={handleOpenCreateJilid}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tambah Tingkat / Jilid</span>
            </button>
          </div>

          {/* Jilid Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeMetode.jilidList
              .sort((a, b) => a.urutan - b.urutan)
              .map(j => (
                <div
                  key={j.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Tingkat #{j.urutan}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditJilid(j)}
                          className="p-1 text-slate-400 hover:text-emerald-700"
                          title="Edit Jilid"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteJilid(j.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Hapus Jilid"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-2">{j.nama}</h4>

                    <div className="space-y-1 mt-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Target Capaian:</span>
                        <span className="text-slate-800">{j.target || '-'}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-400 text-[11px] block">Syarat Kenaikan:</span>
                        <span className="text-slate-800">{j.syaratLulus || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Metode */}
      {isMetodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingMetode ? 'Edit Metode Pembelajaran' : 'Tambah Metode Pembelajaran'}
              </h3>
              <button onClick={() => setIsMetodeModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitMetode} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Metode Pembelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={metodeForm.nama}
                  onChange={(e) => setMetodeForm({ ...metodeForm, nama: e.target.value })}
                  placeholder="Contoh: Metode Bilqolam / Qira'ati"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Kaidah Singkat
                </label>
                <textarea
                  rows={3}
                  value={metodeForm.deskripsi}
                  onChange={(e) => setMetodeForm({ ...metodeForm, deskripsi: e.target.value })}
                  placeholder="Uraian pendekatan dan metode pembelajaran"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMetodeModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Simpan Metode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Jilid */}
      {isJilidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingJilid ? 'Edit Jilid / Tingkatan' : 'Tambah Jilid / Tingkatan Baru'}
              </h3>
              <button onClick={() => setIsJilidModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitJilid} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Jilid / Tingkatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={jilidForm.nama}
                    onChange={(e) => setJilidForm({ ...jilidForm, nama: e.target.value })}
                    placeholder="Contoh: Bilqolam Jilid 1"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={jilidForm.urutan}
                    onChange={(e) => setJilidForm({ ...jilidForm, urutan: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Pembelajaran &amp; Materi *
                </label>
                <textarea
                  rows={2}
                  required
                  value={jilidForm.target}
                  onChange={(e) => setJilidForm({ ...jilidForm, target: e.target.value })}
                  placeholder="Contoh: Mengenal huruf tunggal berharokat fathah / Hafalan surat pendek"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Syarat Kelulusan / Standar Kenaikan Jilid *
                </label>
                <textarea
                  rows={2}
                  required
                  value={jilidForm.syaratLulus}
                  onChange={(e) => setJilidForm({ ...jilidForm, syaratLulus: e.target.value })}
                  placeholder="Contoh: Lancar membaca tanpa mengeja dan makhroj jelas"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJilidModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Simpan Jilid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
