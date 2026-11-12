import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  Shield,
  Phone,
  BookOpen,
  X
} from 'lucide-react';
import { Ustadz, Kelas } from '../types';

interface UstadzViewProps {
  ustadzList: Ustadz[];
  kelasList: Kelas[];
  onSaveUstadz: (ustadz: Ustadz) => void;
  onDeleteUstadz: (id: string) => void;
}

export const UstadzView: React.FC<UstadzViewProps> = ({
  ustadzList,
  kelasList,
  onSaveUstadz,
  onDeleteUstadz
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUstadz, setEditingUstadz] = useState<Ustadz | null>(null);

  const [formData, setFormData] = useState<Partial<Ustadz>>({
    nip: '',
    nama: '',
    foto: '',
    jk: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '1990-01-01',
    alamat: '',
    noHp: '',
    pendidikan: 'S1 Pendidikan Agama Islam',
    status: 'aktif',
    username: '',
    password: 'password123',
    role: 'ustadz',
    halaqohIds: []
  });

  const handleOpenCreate = () => {
    setEditingUstadz(null);
    setFormData({
      nip: `199${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      nama: '',
      foto: '',
      jk: 'L',
      tempatLahir: 'Malang',
      tanggalLahir: '1992-01-01',
      alamat: '',
      noHp: '',
      pendidikan: 'S1 Pendidikan Agama Islam',
      status: 'aktif',
      username: `ustadz_${ustadzList.length + 1}`,
      password: 'password123',
      role: 'ustadz',
      halaqohIds: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ustadz: Ustadz) => {
    setEditingUstadz(ustadz);
    setFormData({ ...ustadz });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;

    const ustadzObj: Ustadz = {
      id: editingUstadz ? editingUstadz.id : `ust-${Date.now()}`,
      nip: formData.nip || '',
      nama: formData.nama || '',
      foto: formData.foto || '',
      jk: (formData.jk as 'L' | 'P') || 'L',
      tempatLahir: formData.tempatLahir || 'Malang',
      tanggalLahir: formData.tanggalLahir || '1990-01-01',
      alamat: formData.alamat || '-',
      noHp: formData.noHp || '-',
      pendidikan: formData.pendidikan || '-',
      status: (formData.status as any) || 'aktif',
      username: formData.username || `ustadz_${Date.now()}`,
      password: formData.password || 'password123',
      role: (formData.role as any) || 'ustadz',
      halaqohIds: formData.halaqohIds || []
    };

    onSaveUstadz(ustadzObj);
    setIsModalOpen(false);
  };

  const toggleHalaqoh = (kId: string) => {
    const current = formData.halaqohIds || [];
    if (current.includes(kId)) {
      setFormData({ ...formData, halaqohIds: current.filter(id => id !== kId) });
    } else {
      setFormData({ ...formData, halaqohIds: [...current, kId] });
    }
  };

  const filteredUstadz = ustadzList.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.noHp.includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Data Ustadz &amp; Ustadzah (Tenaga Pengajar)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kelola pengampu halaqoh, akun login (username &amp; password), dan penugasan kelas
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ustadz / Ustadzah</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, username, atau no HP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Ustadz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUstadz.map(u => {
          const assignedHalaqoh = kelasList.filter(k => (u.halaqohIds || []).includes(k.id) || k.ustadzId === u.id);

          return (
            <div key={u.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                      {u.nama.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{u.nama}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        NIP: {u.nip || '-'} · <span className="capitalize">{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    u.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.noHp || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.pendidikan || 'Pendidikan Agama'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Login: {u.username} (***)</span>
                  </div>
                </div>

                {/* Assigned Halaqoh list */}
                <div className="pt-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Halaqoh yang Diampu:
                  </span>
                  {assignedHalaqoh.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Belum ada penugasan halaqoh</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {assignedHalaqoh.map(k => (
                        <span key={k.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {k.namaKelas}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus data ustadz "${u.nama}"?`)) {
                      onDeleteUstadz(u.id);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Ustadz */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingUstadz ? 'Edit Data Ustadz' : 'Tambah Ustadz / Ustadzah Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.I."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Induk Pegawai / NIP
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peran / Jabatan
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="ustadz">Ustadz / Ustadzah Pengampu</option>
                    <option value="kepala">Kepala / Pengasuh TPQ</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jk}
                    onChange={(e) => setFormData({ ...formData, jk: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="L">Laki-laki (Ustadz)</option>
                    <option value="P">Perempuan (Ustadzah)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Handphone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <input
                    type="text"
                    value={formData.pendidikan}
                    onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Domisili
                  </label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                {/* Akun Login Ustadz (Username & Password) */}
                <div className="sm:col-span-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Akses Login Ustadz (Username &amp; Password)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">Username Login *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Password Login *</label>
                      <input
                        type="text"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Penugasan Halaqoh */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Penugasan Sebagai Pengampu Halaqoh / Kelas:
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 p-2.5 rounded bg-slate-50">
                    {kelasList.map(k => (
                      <label key={k.id} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={(formData.halaqohIds || []).includes(k.id)}
                          onChange={() => toggleHalaqoh(k.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{k.namaKelas} ({k.tingkatan})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
                >
                  Simpan Ustadz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
