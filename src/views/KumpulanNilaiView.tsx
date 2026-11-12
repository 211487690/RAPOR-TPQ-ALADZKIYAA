import React, { useState } from 'react';
import {
  Award,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  Trophy,
  Medal,
  Calendar,
  Building2,
  Users,
  Eye,
  FileText,
  Sparkles
} from 'lucide-react';
import {
  LembagaProfile,
  TahunPelajaran,
  Kelas,
  Santri,
  Ustadz,
  KomponenPenilaian,
  PredikatRule
} from '../types';
import { storageService } from '../services/storageService';
import { pdfService } from '../services/pdfService';
import { excelService } from '../services/excelService';

interface KumpulanNilaiViewProps {
  lembaga: LembagaProfile;
  tahunList: TahunPelajaran[];
  activeTahun: TahunPelajaran;
  kelasList: Kelas[];
  santriList: Santri[];
  ustadzList: Ustadz[];
  komponenList: KomponenPenilaian[];
  predikatList: PredikatRule[];
  onNavigateToRapor: (santriId: string) => void;
  onNavigateToPiagam: () => void;
}

export const KumpulanNilaiView: React.FC<KumpulanNilaiViewProps> = ({
  lembaga,
  tahunList,
  activeTahun,
  kelasList,
  santriList,
  ustadzList,
  komponenList,
  onNavigateToRapor,
  onNavigateToPiagam
}) => {
  const [selectedTahunId, setSelectedTahunId] = useState(activeTahun.id);
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>(activeTahun.semesterAktif);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<string>('aktif');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const curTahun = tahunList.find(t => t.id === selectedTahunId) || activeTahun;
  const curKelas = kelasList.find(k => k.id === selectedKelasId);
  const curUstadz = ustadzList.find(u => u.id === curKelas?.ustadzId);
  const activeComps = komponenList.filter(k => k.isAktif);

  // Compute rankings based on class and status filter
  const rankedList = React.useMemo(() => {
    let pool = santriList;
    if (selectedKelasId !== 'semua') {
      pool = pool.filter(s => s.kelasId === selectedKelasId);
    }
    if (statusFilter !== 'semua') {
      pool = pool.filter(s => s.status === statusFilter);
    }

    const scored = pool.map(s => {
      const calculation = storageService.calculateSantriNilai(s.id, selectedTahunId, selectedSemester);
      return {
        santri: s,
        calculation,
        ranking: 0
      };
    });

    // Sort by average score descending
    scored.sort((a, b) => b.calculation.rataRata - a.calculation.rataRata);

    // Assign rank
    let currentRank = 1;
    return scored.map((item, idx) => {
      if (idx > 0 && item.calculation.rataRata < scored[idx - 1].calculation.rataRata) {
        currentRank = idx + 1;
      }
      return {
        ...item,
        ranking: item.calculation.rataRata > 0 ? currentRank : scored.length,
        totalSantri: scored.length
      };
    });
  }, [santriList, selectedKelasId, statusFilter, selectedTahunId, selectedSemester]);

  // Filtered by search (name or NIS)
  const filteredList = rankedList.filter(r =>
    r.santri.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.santri.nis.includes(searchTerm) ||
    (r.santri.namaPanggilan && r.santri.namaPanggilan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Statistics
  const avgScores = rankedList.map(r => r.calculation.rataRata).filter(s => s > 0);
  const classAvg = avgScores.length > 0 ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1) : '0';
  const maxScore = avgScores.length > 0 ? Math.max(...avgScores).toFixed(1) : '0';
  const minScore = avgScores.length > 0 ? Math.min(...avgScores).toFixed(1) : '0';
  const totalTuntas = rankedList.filter(r => r.calculation.rataRata >= 70).length;

  // Top 3 for Podium
  const top1 = rankedList.find(r => r.ranking === 1);
  const top2 = rankedList.find(r => r.ranking === 2);
  const top3 = rankedList.find(r => r.ranking === 3);

  // Export to PDF
  const handleExportPDF = async () => {
    if (rankedList.length === 0) {
      alert('Tidak ada data nilai santri untuk diekspor.');
      return;
    }
    const exportKelas: Kelas = curKelas || {
      id: 'semua',
      namaKelas: 'Semua Kelas / Halaqoh',
      tingkatan: 'Semua',
      urutan: 0,
      kapasitas: santriList.length,
      ustadzId: ''
    };
    setIsExportingPDF(true);
    try {
      await pdfService.generateLegerPDF(
        {
          lembaga,
          kelas: exportKelas,
          tahun: curTahun,
          semester: selectedSemester,
          ustadz: curUstadz,
          komponenList: activeComps,
          rankedData: rankedList
        },
        true
      );
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor PDF Leger Nilai.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export to XLSX
  const handleExportXLSX = () => {
    if (rankedList.length === 0) {
      alert('Tidak ada data nilai santri untuk diekspor.');
      return;
    }
    excelService.exportLegerXLSX({
      kelasNama: curKelas ? curKelas.namaKelas : 'Semua Kelas',
      tahun: curTahun.tahun,
      semester: selectedSemester,
      waliKelas: curUstadz?.nama || '-',
      komponenList: activeComps.map(c => ({ id: c.id, nama: c.nama })),
      rankedData: rankedList
    });
  };

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" />
            <span>Kumpulan Nilai &amp; Peringkat Kelas (Leger Nilai)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi lengkap nilai seluruh komponen belajar, urutan peringkat juara kelas, serta ekspor PDF dan Excel (XLSX)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportXLSX}
            disabled={rankedList.length === 0}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Download Spreadsheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF || rankedList.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Download Berkas PDF Resmi (.pdf)"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'Membuat PDF...' : 'Export PDF (A4)'}</span>
          </button>

          <button
            onClick={onNavigateToPiagam}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            title="Terbitkan Piagam Juara 1, 2, 3 Kelas Ini"
          >
            <Trophy className="w-4 h-4" />
            <span>Cetak Piagam Juara</span>
          </button>
        </div>
      </div>

      {/* Selector Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tahun Pelajaran</span>
          </label>
          <select
            value={selectedTahunId}
            onChange={(e) => setSelectedTahunId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            {tahunList.map(t => (
              <option key={t.id} value={t.id}>{t.tahun} {t.isAktif ? '(Aktif)' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Semester</span>
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Kelas / Halaqoh</span>
          </label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white font-semibold text-slate-800"
          >
            <option value="semua">Semua Kelas / Halaqoh</option>
            {kelasList.map(k => (
              <option key={k.id} value={k.id}>{k.namaKelas}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Status Santri</span>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white font-medium text-slate-800"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Santri Aktif</option>
            <option value="lulus">Lulus / Alumni</option>
            <option value="mutasi">Mutasi Pindah</option>
            <option value="nonaktif">Non-Aktif</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Cari Santri</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama / NIS..."
              className="w-full pl-8 pr-7 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 3 Podium Juara */}
      {rankedList.length >= 2 && (
        <div className="bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/40 p-5 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Podium Peringkat Teratas (Juara Kelas {curKelas?.namaKelas})</span>
            </h3>
            <span className="text-xs text-slate-500">
              TP {curTahun.tahun} · Semester {selectedSemester}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Juara 2 */}
            {top2 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs relative overflow-hidden order-2 md:order-1">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-lg shrink-0">
                  🥈
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    JUARA 2 KELAS
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{top2.santri.namaLengkap}</h4>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Rata-rata: <strong className="text-slate-800">{top2.calculation.rataRata.toFixed(1)}</strong> ({top2.calculation.predikat})
                  </div>
                </div>
              </div>
            )}

            {/* Juara 1 (Golden Highlight) */}
            {top1 && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white rounded-xl border-2 border-amber-400 p-4 flex items-center gap-3 shadow-xs relative overflow-hidden order-1 md:order-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  🥇
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>JUARA 1 (NILAI TERTINGGI)</span>
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base truncate">{top1.santri.namaLengkap}</h4>
                  <div className="text-xs text-slate-700 mt-0.5">
                    Rata-rata: <strong className="text-amber-700 text-sm">{top1.calculation.rataRata.toFixed(1)}</strong> ({top1.calculation.predikat} - {top1.calculation.label})
                  </div>
                </div>
              </div>
            )}

            {/* Juara 3 */}
            {top3 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs relative overflow-hidden order-3">
                <div className="w-12 h-12 rounded-xl bg-amber-800/10 border border-amber-700/20 flex items-center justify-center font-black text-amber-900 text-lg shrink-0">
                  🥉
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    JUARA 3 KELAS
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{top3.santri.namaLengkap}</h4>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Rata-rata: <strong className="text-slate-800">{top3.calculation.rataRata.toFixed(1)}</strong> ({top3.calculation.predikat})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Class Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Rata-rata Kelas</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">{classAvg}</span>
          <span className="text-[10px] text-slate-400">Skor tertimbang</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Nilai Tertinggi</span>
          <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{maxScore}</span>
          <span className="text-[10px] text-slate-400">Peringkat 1 ({top1?.santri.namaPanggilan || '-'})</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Nilai Terendah</span>
          <span className="text-xl font-extrabold text-slate-700 mt-0.5 block">{minScore}</span>
          <span className="text-[10px] text-slate-400">Batas kelulusan: 70.0</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Jumlah Santri Dinilai</span>
          <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
            {rankedList.filter(r => r.calculation.rataRata > 0).length} / {rankedList.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">{totalTuntas} santri tuntas</span>
        </div>
      </div>

      {/* Tabel Kumpulan Nilai Lengkap (Leger Nilai) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Tabel Leger Nilai Santri: {curKelas ? curKelas.namaKelas : 'Semua Kelas / Halaqoh'}
            </h3>
            <p className="text-xs text-slate-500">
              Wali Kelas: {curUstadz?.nama || (selectedKelasId === 'semua' ? 'Semua Pengampu' : 'Belum Ditentukan')} {curKelas ? `· Kapasitas: ${curKelas.kapasitas} Santri` : ''}
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Menampilkan <strong>{filteredList.length}</strong> santri {statusFilter !== 'semua' ? `(${statusFilter})` : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-100 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-3 py-3 w-12 text-center">No</th>
                <th className="px-3 py-3 w-16 text-center">Rank</th>
                <th className="px-3 py-3 w-24">NIS</th>
                <th className="px-3 py-3 min-w-[200px]">Nama Santri</th>
                {activeComps.map(comp => (
                  <th key={comp.id} className="px-3 py-3 text-center min-w-[90px]" title={`${comp.nama} (${comp.bobot}%)`}>
                    <div className="truncate">{comp.nama}</div>
                    <div className="text-[9px] text-emerald-400 font-normal">{comp.bobot}%</div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center w-24 bg-slate-800">Rata-rata</th>
                <th className="px-3 py-3 text-center w-16 bg-slate-800">Predikat</th>
                <th className="px-3 py-3 min-w-[130px]">Status / Capaian</th>
                <th className="px-3 py-3 text-center w-32 no-print">Aksi Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6 + activeComps.length} className="px-4 py-12 text-center text-slate-400">
                    Tidak ditemukan santri yang sesuai dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isTop3 = item.ranking <= 3;
                  return (
                    <tr
                      key={item.santri.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.ranking === 1
                          ? 'bg-amber-50/30'
                          : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold">
                        {item.ranking === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black shadow-xs">
                            1
                          </span>
                        ) : item.ranking === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs font-black shadow-xs">
                            2
                          </span>
                        ) : item.ranking === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-800/20 text-amber-900 border border-amber-600/30 text-xs font-black">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">{item.ranking}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">
                        {item.santri.nis}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{item.santri.namaLengkap}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span>JK: {item.santri.jk}</span>
                          <span>·</span>
                          <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {kelasList.find(k => k.id === item.santri.kelasId)?.namaKelas || '-'}
                          </span>
                          {item.santri.status !== 'aktif' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase font-semibold">
                              {item.santri.status}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Component Grades */}
                      {activeComps.map(comp => {
                        const grade = item.calculation.items.find(it => it.komponenId === comp.id)?.nilai;
                        const hasScore = grade !== undefined && grade > 0;
                        return (
                          <td key={comp.id} className="px-3 py-2.5 text-center tabular-nums">
                            {hasScore ? (
                              <span className="font-semibold text-slate-800">{grade}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Average */}
                      <td className="px-3 py-2.5 text-center tabular-nums font-bold text-sm bg-emerald-50/50 text-emerald-800">
                        {item.calculation.rataRata.toFixed(1)}
                      </td>

                      {/* Predikat */}
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {item.calculation.predikat}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.calculation.rataRata >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.calculation.rataRata >= 70
                            ? 'bg-blue-100 text-blue-800'
                            : item.calculation.rataRata > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.calculation.label}
                        </span>
                      </td>

                      {/* Quick Actions: Direct Print Report */}
                      <td className="px-3 py-2.5 text-center no-print">
                        <button
                          onClick={() => onNavigateToRapor(item.santri.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Buka & Cetak Rapor Santri Ini"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Rapor</span>
                        </button>
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
