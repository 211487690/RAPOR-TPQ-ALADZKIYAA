import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowRightLeft,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { Santri, Kelas, MetodePembelajaran } from '../types';
import { excelService } from '../services/excelService';

interface SantriViewProps {
  santriList: Santri[];
  kelasList: Kelas[];
  metodeList: MetodePembelajaran[];
  onSaveSantri: (santri: Santri) => void;
  onDeleteSantri: (id: string) => void;
  onBulkImport: (newList: Santri[]) => void;
}

export const SantriView: React.FC<SantriViewProps> = ({
  santriList,
  kelasList,
  metodeList,
  onSaveSantri,
  onDeleteSantri,
  onBulkImport
}) => {
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterJk, setFilterJk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [selectedForMove, setSelectedForMove] = useState<Santri | null>(null);
  const [targetKelasId, setTargetKelasId] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Santri>>({
    nis: '',
    namaLengkap: '',
    namaPanggilan: '',
    jk: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '2017-01-01',
    alamat: '',
    namaAyah: '',
    namaIbu: '',
    noHpOrtu: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    kelasId: kelasList[0]?.id || '',
    metodeId: metodeList[0]?.id || '',
    jilidId: metodeList[0]?.jilidList[0]?.id || '',
    status: 'aktif',
    username: '',
    password: 'password123'
  });

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    const nextNis = `20250${(santriList.length + 1).toString().padStart(2, '0')}`;
    setEditingSantri(null);
    setFormData({
      nis: nextNis,
      namaLengkap: '',
      namaPanggilan: '',
      jk: 'L',
      tempatLahir: 'Malang',
      tanggalLahir: '2017-01-01',
      alamat: '',
      namaAyah: '',
      namaIbu: '',
      noHpOrtu: '',
      tanggalMasuk: new Date().toISOString().split('T')[0],
      kelasId: kelasList[0]?.id || '',
      metodeId: metodeList[0]?.id || '',
      jilidId: metodeList[0]?.jilidList[0]?.id || '',
      status: 'aktif',
      username: `santri_${nextNis}`,
      password: 'password123'
    });
    setIsModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setFormData({ ...santri });
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nis) return;

    const santriObj: Santri = {
      id: editingSantri ? editingSantri.id : `s-${Date.now()}`,
      nis: formData.nis || '',
      namaLengkap: formData.namaLengkap || '',
      namaPanggilan: formData.namaPanggilan || formData.namaLengkap.split(' ')[0],
      jk: (formData.jk as 'L' | 'P') || 'L',
      tempatLahir: formData.tempatLahir || 'Malang',
      tanggalLahir: formData.tanggalLahir || '2017-01-01',
      alamat: formData.alamat || '-',
      namaAyah: formData.namaAyah || '-',
      namaIbu: formData.namaIbu || '-',
      noHpOrtu: formData.noHpOrtu || '-',
      tanggalMasuk: formData.tanggalMasuk || new Date().toISOString().split('T')[0],
      foto: formData.foto || '',
      kelasId: formData.kelasId || kelasList[0]?.id || '',
      metodeId: formData.metodeId || metodeList[0]?.id || '',
      jilidId: formData.jilidId || '',
      status: (formData.status as any) || 'aktif',
      username: formData.username || formData.nis || `santri_${Date.now()}`,
      password: formData.password || 'password123'
    };

    onSaveSantri(santriObj);
    setIsModalOpen(false);
  };

  // Handle Class Move
  const handleMoveClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForMove || !targetKelasId) return;

    const updated = { ...selectedForMove, kelasId: targetKelasId };
    onSaveSantri(updated);
    setIsMoveModalOpen(false);
    setSelectedForMove(null);
  };

  // Handle XLSX File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await excelService.parseSantriXLSX(file);
      const defaultK = kelasList[0]?.id || '';
      const defaultM = metodeList[0]?.id || '';
      const defaultJ = metodeList[0]?.jilidList[0]?.id || '';

      const newSantriList: Santri[] = parsed.map((item, idx) => ({
        id: `s-import-${Date.now()}-${idx}`,
        nis: item.nis || `S-${Math.floor(10000 + Math.random() * 90000)}`,
        namaLengkap: item.namaLengkap || 'Santri Baru',
        namaPanggilan: item.namaPanggilan || 'Santri',
        jk: item.jk || 'L',
        tempatLahir: item.tempatLahir || 'Malang',
        tanggalLahir: item.tanggalLahir || '2017-01-01',
        alamat: item.alamat || '-',
        namaAyah: item.namaAyah || '-',
        namaIbu: item.namaIbu || '-',
        noHpOrtu: item.noHpOrtu || '-',
        tanggalMasuk: item.tanggalMasuk || new Date().toISOString().split('T')[0],
        foto: '',
        kelasId: defaultK,
        metodeId: defaultM,
        jilidId: defaultJ,
        status: item.status || 'aktif',
        username: item.username || item.nis || `santri_${idx}`,
        password: item.password || 'password123'
      }));

      onBulkImport(newSantriList);
      alert(`Berhasil mengimpor ${newSantriList.length} data santri dari file Excel!`);
    } catch (err) {
      alert('Gagal mengimpor file Excel. Pastikan format kolom sesuai template.');
    }
    e.target.value = '';
  };

  // Filtered List
  const filteredSantri = santriList.filter(s => {
    const matchSearch =
      s.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase()) ||
      s.namaPanggilan.toLowerCase().includes(search.toLowerCase());
    const matchKelas = filterKelas === 'all' || s.kelasId === filterKelas;
    const matchJk = filterJk === 'all' || s.jk === filterJk;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchKelas && matchJk && matchStatus;
  });

  const selectedMetode = metodeList.find(m => m.id === formData.metodeId) || metodeList[0];

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Pengelolaan Data Santri</span>
          </h2>
          <p className="text-xs text-slate-500">
            Total {santriList.length} santri terdaftar · Dilengkapi akun login santri &amp; ekspor XLSX
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={() => excelService.downloadSantriTemplateXLSX()}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Download template kosong Excel (.xlsx) untuk impor data"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template Excel</span>
          </button>

          {/* Import XLSX */}
          <label className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import XLSX</span>
            <input
              type="file"
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Export XLSX */}
          <button
            onClick={() => excelService.exportSantriToXLSX(filteredSantri, kelasList, metodeList)}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            title="Export data santri yang sedang difilter ke Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export XLSX</span>
          </button>

          {/* Tambah Santri */}
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari santri berdasarkan nama / NIS..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Kelas */}
        <select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Semua Kelas / Halaqoh</option>
          {kelasList.map(k => (
            <option key={k.id} value={k.id}>{k.namaKelas}</option>
          ))}
        </select>

        {/* Filter JK */}
        <select
          value={filterJk}
          onChange={(e) => setFilterJk(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Semua Gender</option>
          <option value="L">Laki-laki (Putra)</option>
          <option value="P">Perempuan (Putri)</option>
        </select>

        {/* Filter Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="lulus">Lulus</option>
          <option value="pindah">Pindah</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Santri Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3">L/P</th>
                <th className="px-4 py-3">Kelas / Halaqoh</th>
                <th className="px-4 py-3">Metode &amp; Jilid</th>
                <th className="px-4 py-3">Akun Santri</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data santri yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((s, index) => {
                  const kelas = kelasList.find(k => k.id === s.kelasId);
                  const metode = metodeList.find(m => m.id === s.metodeId);
                  const jilid = metode?.jilidList.find(j => j.id === s.jilidId);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">{s.nis}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{s.namaLengkap}</div>
                        <div className="text-[11px] text-slate-500">
                          Panggilan: {s.namaPanggilan} · Telp: {s.noHpOrtu}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.jk === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {s.jk === 'L' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{kelas?.namaKelas || '-'}</div>
                        <div className="text-[10px] text-slate-400">{kelas?.tingkatan || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-emerald-800">{jilid?.nama || '-'}</div>
                        <div className="text-[10px] text-slate-400">{metode?.nama || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          <span>{s.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          s.status === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.status === 'lulus'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pindah Halaqoh */}
                          <button
                            onClick={() => {
                              setSelectedForMove(s);
                              setTargetKelasId(s.kelasId);
                              setIsMoveModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Pindah Kelas / Halaqoh"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Edit Data Santri"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data santri "${s.namaLengkap}"? Data nilai terkait juga akan diperbarui.`)) {
                                onDeleteSantri(s.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Santri"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Induk Santri (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Santri
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus</option>
                    <option value="pindah">Pindah</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={formData.namaPanggilan}
                    onChange={(e) => setFormData({ ...formData, namaPanggilan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="jk"
                        checked={formData.jk === 'L'}
                        onChange={() => setFormData({ ...formData, jk: 'L' })}
                      />
                      <span>Laki-laki (Putra)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="jk"
                        checked={formData.jk === 'P'}
                        onChange={() => setFormData({ ...formData, jk: 'P' })}
                      />
                      <span>Perempuan (Putri)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Masuk
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalMasuk}
                    onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas / Halaqoh
                  </label>
                  <select
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Metode Pembelajaran
                  </label>
                  <select
                    value={formData.metodeId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      const met = metodeList.find(m => m.id === mId);
                      setFormData({
                        ...formData,
                        metodeId: mId,
                        jilidId: met?.jilidList[0]?.id || ''
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  >
                    {metodeList.map(m => (
                      <option key={m.id} value={m.id}>{m.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jilid / Tingkat Saat Ini
                  </label>
                  <select
                    value={formData.jilidId}
                    onChange={(e) => setFormData({ ...formData, jilidId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  >
                    {selectedMetode?.jilidList.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.nama} (Target: {j.target})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ayah
                  </label>
                  <input
                    type="text"
                    value={formData.namaAyah}
                    onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ibu
                  </label>
                  <input
                    type="text"
                    value={formData.namaIbu}
                    onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. HP / WhatsApp Orang Tua (Wali)
                  </label>
                  <input
                    type="text"
                    value={formData.noHpOrtu}
                    onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Tempat Tinggal
                  </label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Nama jalan, RT/RW, Dusun, Desa"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                {/* Akses Login Santri */}
                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Akun Login Santri / Wali (Portal Siswa)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Username Login *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Password *</label>
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
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
                >
                  Simpan Data Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pindah Halaqoh */}
      {isMoveModalOpen && selectedForMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Pindah Halaqoh / Kelas
              </h3>
              <button onClick={() => setIsMoveModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Santri: <span className="font-bold text-slate-800">{selectedForMove.namaLengkap}</span> ({selectedForMove.nis})
            </p>

            <form onSubmit={handleMoveClassSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Halaqoh / Kelas Tujuan
                </label>
                <select
                  value={targetKelasId}
                  onChange={(e) => setTargetKelasId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                >
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.namaKelas} ({k.tingkatan})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Catatan: Riwayat nilai semester dan evaluasi jilid sebelumnya tetap aman tersimpan.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  Simpan Perpindahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
