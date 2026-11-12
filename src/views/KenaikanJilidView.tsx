import React, { useState } from 'react';
import {
  ArrowUpCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  Calendar,
  X,
  History
} from 'lucide-react';
import {
  Santri,
  MetodePembelajaran,
  EvaluasiKenaikanJilid,
  Ustadz
} from '../types';

interface KenaikanJilidViewProps {
  santriList: Santri[];
  metodeList: MetodePembelajaran[];
  ustadzList: Ustadz[];
  evaluasiJilidList: EvaluasiKenaikanJilid[];
  onSaveEvaluasi: (evaluasi: EvaluasiKenaikanJilid, updateSantriJilid?: boolean) => void;
}

export const KenaikanJilidView: React.FC<KenaikanJilidViewProps> = ({
  santriList,
  metodeList,
  ustadzList,
  evaluasiJilidList,
  onSaveEvaluasi
}) => {
  const [search, setSearch] = useState('');
  const [filterMetode, setFilterMetode] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  const [formData, setFormData] = useState<Partial<EvaluasiKenaikanJilid>>({
    santriId: '',
    tanggalUjian: new Date().toISOString().split('T')[0],
    metodeId: '',
    dariJilidId: '',
    keJilidId: '',
    nilaiUjian: 85,
    status: 'Lulus (Naik Jilid)',
    penguji: ustadzList[0]?.nama || 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.',
    catatan: ''
  });

  const handleOpenEvaluationModal = (santri: Santri) => {
    setSelectedSantri(santri);
    const met = metodeList.find(m => m.id === santri.metodeId) || metodeList[0];
    const currentJilidIndex = met.jilidList.findIndex(j => j.id === santri.jilidId);
    const nextJilid = met.jilidList[currentJilidIndex + 1] || met.jilidList[currentJilidIndex];

    setFormData({
      santriId: santri.id,
      tanggalUjian: new Date().toISOString().split('T')[0],
      metodeId: santri.metodeId,
      dariJilidId: santri.jilidId,
      keJilidId: nextJilid ? nextJilid.id : santri.jilidId,
      nilaiUjian: 85,
      status: 'Lulus (Naik Jilid)',
      penguji: ustadzList[0]?.nama || 'Ust. Moh. Umar Jaelani, S.Pd.I,.Gr.',
      catatan: 'Lancar dan tartil, layak melanjutkan ke jilid berikutnya.'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.santriId || !formData.keJilidId) return;

    const evalObj: EvaluasiKenaikanJilid = {
      id: `ev-${Date.now()}`,
      santriId: formData.santriId,
      tanggalUjian: formData.tanggalUjian || new Date().toISOString().split('T')[0],
      metodeId: formData.metodeId || '',
      dariJilidId: formData.dariJilidId || '',
      keJilidId: formData.keJilidId || '',
      nilaiUjian: Number(formData.nilaiUjian) || 0,
      status: (formData.status as any) || 'Lulus (Naik Jilid)',
      penguji: formData.penguji || 'Ustadz Penguji',
      catatan: formData.catatan || ''
    };

    const shouldPromote = evalObj.status === 'Lulus (Naik Jilid)';
    onSaveEvaluasi(evalObj, shouldPromote);
    setIsModalOpen(false);
  };

  const filteredSantri = santriList.filter(s => {
    if (s.status !== 'aktif') return false;
    const matchSearch = s.namaLengkap.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    const matchMetode = filterMetode === 'all' || s.metodeId === filterMetode;
    return matchSearch && matchMetode;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            <span>Kenaikan Jilid &amp; Evaluasi Munaqosyah</span>
          </h2>
          <p className="text-xs text-slate-500">
            Penilaian berkala ketuntasan jilid (Bilqolam, Juz 'Amma, Al-Qur'an) dengan pencatatan riwayat permanen
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari santri..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={filterMetode}
          onChange={(e) => setFilterMetode(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">Semua Metode Pembelajaran</option>
          {metodeList.map(m => (
            <option key={m.id} value={m.id}>{m.nama}</option>
          ))}
        </select>
      </div>

      {/* Main Grid: Santri Ready for Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSantri.map(santri => {
          const metode = metodeList.find(m => m.id === santri.metodeId);
          const currentJilid = metode?.jilidList.find(j => j.id === santri.jilidId);
          const historyForSantri = evaluasiJilidList.filter(e => e.santriId === santri.id);
          const latestEval = historyForSantri[historyForSantri.length - 1];

          return (
            <div
              key={santri.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-emerald-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{santri.namaLengkap}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">NIS: {santri.nis}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {currentJilid?.nama || 'Jilid Dasar'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Metode:</span>
                    <span className="font-medium text-slate-800">{metode?.nama || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Target Capaian:</span>
                    <span className="text-slate-700">{currentJilid?.target || '-'}</span>
                  </div>
                </div>

                {latestEval && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">Ujian Terakhir:</span> {latestEval.status} ({latestEval.nilaiUjian}) · {latestEval.tanggalUjian}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {historyForSantri.length}x Evaluasi
                </span>
                <button
                  onClick={() => handleOpenEvaluationModal(santri)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  <span>Ujian / Evaluasi Jilid</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form Evaluasi Kenaikan Jilid */}
      {isModalOpen && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ujian Kenaikan Jilid Santri
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSantri.namaLengkap} ({selectedSantri.nis})
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Pengujian *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalUjian}
                    onChange={(e) => setFormData({ ...formData, tanggalUjian: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nilai Evaluasi (0 - 100) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formData.nilaiUjian}
                    onChange={(e) => setFormData({ ...formData, nilaiUjian: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hasil / Keputusan Evaluasi *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Lulus (Naik Jilid)' })}
                    className={`p-2 rounded border text-center font-semibold text-xs ${
                      formData.status === 'Lulus (Naik Jilid)'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    Naik Jilid
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Belum Naik' })}
                    className={`p-2 rounded border text-center font-semibold text-xs ${
                      formData.status === 'Belum Naik'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    Belum Naik
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Ulangi Evaluasi' })}
                    className={`p-2 rounded border text-center font-semibold text-xs ${
                      formData.status === 'Ulangi Evaluasi'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    Ulangi Evaluasi
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rekomendasi Tingkat / Jilid Berikutnya *
                </label>
                <select
                  value={formData.keJilidId}
                  onChange={(e) => setFormData({ ...formData, keJilidId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                >
                  {metodeList
                    .find(m => m.id === selectedSantri.metodeId)
                    ?.jilidList.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.nama} (Target: {j.target})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ustadz / Ustadzah Penguji *
                </label>
                <select
                  value={formData.penguji}
                  onChange={(e) => setFormData({ ...formData, penguji: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  {ustadzList.map(u => (
                    <option key={u.id} value={u.nama}>{u.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Evaluasi / Penguji
                </label>
                <textarea
                  rows={2}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Keterangan kelancaran membaca, makhroj, dan tajwid..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
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
                  Simpan Hasil Kenaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
