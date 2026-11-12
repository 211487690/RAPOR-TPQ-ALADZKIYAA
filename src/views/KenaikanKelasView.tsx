import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Search,
  Filter
} from 'lucide-react';
import {
  Kelas,
  Santri,
  TahunPelajaran,
  RiwayatKenaikanKelas
} from '../types';
import { storageService } from '../services/storageService';

interface KenaikanKelasViewProps {
  kelasList: Kelas[];
  santriList: Santri[];
  activeTahun: TahunPelajaran;
  riwayatList: RiwayatKenaikanKelas[];
  onExecutePromotion: (
    promotions: {
      santriId: string;
      dariKelasId: string;
      keKelasId: string;
      status: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah';
      catatan: string;
    }[]
  ) => void;
}

export const KenaikanKelasView: React.FC<KenaikanKelasViewProps> = ({
  kelasList,
  santriList,
  activeTahun,
  riwayatList,
  onExecutePromotion
}) => {
  const [selectedKelasId, setSelectedKelasId] = useState(kelasList[0]?.id || '');
  const [targetKelasId, setTargetKelasId] = useState(kelasList[1]?.id || kelasList[0]?.id || '');
  const [search, setSearch] = useState('');
  const [statusMap, setStatusMap] = useState<Record<string, 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah'>>({});
  const [catatanMap, setCatatanMap] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const classSantri = santriList.filter(s => s.kelasId === selectedKelasId && s.status === 'aktif');
  const sourceKelas = kelasList.find(k => k.id === selectedKelasId);
  const destKelas = kelasList.find(k => k.id === targetKelasId);

  const getPromotionStatus = (sId: string): 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah' => {
    return statusMap[sId] || 'Naik Kelas';
  };

  const setPromotionStatus = (sId: string, status: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah') => {
    setStatusMap({ ...statusMap, [sId]: status });
  };

  const handlePromoteAll = () => {
    if (!classSantri.length) return;
    if (!confirm(`Proses kenaikan kelas untuk ${classSantri.length} santri dari "${sourceKelas?.namaKelas}" menuju "${destKelas?.namaKelas}"?`)) {
      return;
    }

    const payload = classSantri.map(s => {
      const status = getPromotionStatus(s.id);
      return {
        santriId: s.id,
        dariKelasId: selectedKelasId,
        keKelasId: status === 'Naik Kelas' ? targetKelasId : selectedKelasId,
        status,
        catatan: catatanMap[s.id] || (status === 'Naik Kelas' ? `Naik ke ${destKelas?.namaKelas}` : status)
      };
    });

    onExecutePromotion(payload);
    setSuccessMsg('Kenaikan kelas berhasil diproses dan disimpan ke riwayat!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredSantri = classSantri.filter(s =>
    s.namaLengkap.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>Kenaikan Kelas &amp; Kelulusan Santri</span>
          </h2>
          <p className="text-xs text-slate-500">
            Penetapan status kenaikan kelas akhir semester genap / tahun ajaran tanpa menghapus riwayat nilai lampau
          </p>
        </div>

        {successMsg && (
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </span>
        )}
      </div>

      {/* Class Transition Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Dari Kelas */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800">
              1. Dari Kelas / Halaqoh Asal
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} ({k.tingkatan})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500">
              Total santri aktif di kelas ini: <strong className="text-emerald-700">{classSantri.length}</strong> santri
            </div>
          </div>

          {/* Ke Kelas */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
            <label className="block font-bold text-emerald-950">
              2. Ke Kelas / Halaqoh Tujuan (Jika Naik Kelas)
            </label>
            <select
              value={targetKelasId}
              onChange={(e) => setTargetKelasId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} ({k.tingkatan})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-emerald-800">
              Santri yang berstatus "Naik Kelas" akan dipindahkan ke kelas tujuan ini
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari santri..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded"
            />
          </div>

          <button
            onClick={handlePromoteAll}
            disabled={classSantri.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Keputusan Kenaikan Kelas</span>
          </button>
        </div>
      </div>

      {/* Santri Promotion Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">No</th>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3 text-center">Nilai Rata-rata</th>
                <th className="px-4 py-3">Keputusan Kenaikan</th>
                <th className="px-4 py-3">Catatan Ustadz / Wali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Tidak ada santri di kelas ini.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((santri, idx) => {
                  const scoreData = storageService.calculateSantriNilai(
                    santri.id,
                    activeTahun.id,
                    activeTahun.semesterAktif
                  );
                  const currentStatus = getPromotionStatus(santri.id);

                  return (
                    <tr key={santri.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{santri.namaLengkap}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NIS: {santri.nis}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 tabular-nums">
                        {scoreData.rataRata > 0 ? (
                          <div className="flex flex-col items-center">
                            <span>{scoreData.rataRata}</span>
                            <span className="text-[10px] text-emerald-700 font-medium">{scoreData.predikat}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Belum Dinilai</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(['Naik Kelas', 'Tinggal Kelas', 'Lulus', 'Pindah'] as const).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setPromotionStatus(santri.id, st)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                currentStatus === st
                                  ? st === 'Naik Kelas'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'Lulus'
                                    ? 'bg-blue-600 text-white'
                                    : st === 'Tinggal Kelas'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={catatanMap[santri.id] || ''}
                          onChange={(e) => setCatatanMap({ ...catatanMap, [santri.id]: e.target.value })}
                          placeholder="Catatan kelulusan / alasan tinggal kelas..."
                          className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
