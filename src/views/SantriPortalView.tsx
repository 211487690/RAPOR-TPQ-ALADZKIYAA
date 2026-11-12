import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileText,
  Trophy
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  Santri,
  Kelas,
  MetodePembelajaran,
  TahunPelajaran,
  NilaiSantri,
  EvaluasiKenaikanJilid,
  PiagamJuara,
  KomponenPenilaian,
  UserSession
} from '../types';
import { storageService } from '../services/storageService';

interface SantriPortalViewProps {
  currentUser: UserSession;
  santriList: Santri[];
  kelasList: Kelas[];
  metodeList: MetodePembelajaran[];
  activeTahun: TahunPelajaran;
  evaluasiJilidList: EvaluasiKenaikanJilid[];
  piagamList: PiagamJuara[];
  komponenList: KomponenPenilaian[];
  onNavigateToRapor: () => void;
}

export const SantriPortalView: React.FC<SantriPortalViewProps> = ({
  currentUser,
  santriList,
  kelasList,
  metodeList,
  activeTahun,
  evaluasiJilidList,
  piagamList,
  komponenList,
  onNavigateToRapor
}) => {
  // If logged in as student, select self; else default to first student
  const mySantriId = currentUser.santriId || santriList[0]?.id;
  const [selectedSantriId, setSelectedSantriId] = useState<string>(mySantriId);
  const [activeTab, setActiveTab] = useState<'perkembangan' | 'biodata' | 'histori_jilid' | 'prestasi'>('perkembangan');

  const curSantri = santriList.find(s => s.id === selectedSantriId) || santriList[0];
  const curKelas = kelasList.find(k => k.id === curSantri?.kelasId);
  const curMetode = metodeList.find(m => m.id === curSantri?.metodeId);
  const curJilid = curMetode?.jilidList.find(j => j.id === curSantri?.jilidId);

  // Student's evaluation history
  const studentEvalHistory = evaluasiJilidList.filter(e => e.santriId === curSantri?.id);

  // Student's awards/certificates
  const studentAwards = piagamList.filter(p => p.santriId === curSantri?.id);

  // Student's score calculation
  const scoreResult = curSantri
    ? storageService.calculateSantriNilai(curSantri.id, activeTahun.id, activeTahun.semesterAktif)
    : { totalNilai: 0, rataRata: 0, predikat: '-', label: '-', items: [] };

  // Chart data: Component scores
  const scoreChartData = scoreResult.items.map(item => ({
    name: item.nama.length > 15 ? item.nama.substring(0, 13) + '..' : item.nama,
    nilai: item.nilai,
    bobot: item.bobot
  }));

  // Chart data: Jilid evaluation progress
  const evalTimelineData = studentEvalHistory.map((item, idx) => ({
    name: `Ujian ${idx + 1}`,
    nilai: item.nilaiUjian,
    tanggal: item.tanggalUjian
  }));

  return (
    <div className="space-y-5">
      {/* Header & Student Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>Portal &amp; Profil Santri TPQ</span>
          </h2>
          <p className="text-xs text-slate-500">
            Lihat grafik capaian belajar, rekapitulasi nilai semester, histori jilid, dan piagam prestasi
          </p>
        </div>

        {currentUser.role !== 'santri' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">Pilih Santri:</span>
            <select
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              {santriList.filter(s => s.status === 'aktif').map(s => (
                <option key={s.id} value={s.id}>
                  {s.namaLengkap} ({s.nis})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {curSantri && (
        <>
          {/* Santri Hero Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-emerald-300 text-white font-bold text-2xl flex items-center justify-center shrink-0">
                  {curSantri.namaLengkap.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100 font-mono">
                      NIS: {curSantri.nis}
                    </span>
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded font-semibold capitalize">
                      Santri {curSantri.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                    {curSantri.namaLengkap}
                  </h3>
                  <div className="text-xs text-emerald-100/90 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span>Halaqoh: <strong>{curKelas?.namaKelas}</strong></span>
                    <span>·</span>
                    <span>Metode: <strong>{curMetode?.nama}</strong></span>
                    <span>·</span>
                    <span>Tingkat: <strong className="text-amber-300">{curJilid?.nama}</strong></span>
                  </div>
                </div>
              </div>

              {/* Rata-rata Score Badge */}
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-[140px]">
                <div className="text-[11px] text-emerald-100 uppercase tracking-wider font-semibold">
                  Nilai Rata-rata
                </div>
                <div className="text-3xl font-extrabold text-white mt-0.5 tabular-nums">
                  {scoreResult.rataRata > 0 ? scoreResult.rataRata : '-'}
                </div>
                <div className="text-xs font-bold text-amber-300 mt-0.5">
                  Predikat: {scoreResult.predikat}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('perkembangan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'perkembangan'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grafik Perkembangan Nilai
            </button>
            <button
              onClick={() => setActiveTab('biodata')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'biodata'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Biodata &amp; Informasi Santri
            </button>
            <button
              onClick={() => setActiveTab('histori_jilid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'histori_jilid'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Kenaikan Jilid ({studentEvalHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('prestasi')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'prestasi'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prestasi &amp; Piagam ({studentAwards.length})
            </button>
          </div>

          {/* Tab 1: Grafik Perkembangan Nilai via Recharts */}
          {activeTab === 'perkembangan' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* BarChart: Komponen Nilai Semester Aktif */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Grafik Capaian Komponen Belajar
                      </h4>
                      <p className="text-xs text-slate-500">
                        Semester {activeTahun.semesterAktif} · {activeTahun.tahun}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Skala 0-100
                    </span>
                  </div>

                  <div className="h-64 w-full pt-2">
                    {scoreChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                          />
                          <Bar dataKey="nilai" name="Nilai Santri" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                        Belum ada data nilai pada semester ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* LineChart: Evaluasi Ujian Jilid Over Time */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Tren Nilai Ujian Kenaikan Jilid
                      </h4>
                      <p className="text-xs text-slate-500">
                        Perkembangan hasil munaqosyah tingkat jilid
                      </p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="h-64 w-full pt-2">
                    {evalTimelineData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={evalTimelineData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="nilai"
                            name="Nilai Ujian"
                            stroke="#0284c7"
                            strokeWidth={3}
                            dot={{ fill: '#0284c7', r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                        Belum ada riwayat ujian kenaikan jilid yang tercatat.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rekap Nilai Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Rincian Komponen Nilai &amp; Catatan Ustadz
                  </h4>
                  <button
                    onClick={onNavigateToRapor}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buka Lembar Rapor Lengkap →</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Komponen Penilaian</th>
                        <th className="px-4 py-3 text-center">Bobot</th>
                        <th className="px-4 py-3 text-center">Nilai Angka</th>
                        <th className="px-4 py-3 text-center">Predikat</th>
                        <th className="px-4 py-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scoreResult.items.map(item => (
                        <tr key={item.komponenId} className="hover:bg-slate-50/70">
                          <td className="px-4 py-2.5 font-medium text-slate-900">{item.nama}</td>
                          <td className="px-4 py-2.5 text-center text-slate-500">{item.bobot}%</td>
                          <td className="px-4 py-2.5 text-center font-bold text-slate-900 tabular-nums">{item.nilai}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-emerald-700">{item.predikat}</td>
                          <td className="px-4 py-2.5 text-slate-600 text-[11px]">{item.catatan || item.predikatLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Biodata Santri */}
          {activeTab === 'biodata' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Informasi Biodata &amp; Orang Tua / Wali
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-36 text-slate-500">Nama Lengkap</span>
                    <span className="font-bold text-slate-900">: {curSantri.namaLengkap}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Nama Panggilan</span>
                    <span className="text-slate-800">: {curSantri.namaPanggilan}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Nomor Induk (NIS)</span>
                    <span className="font-mono text-slate-900">: {curSantri.nis}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Jenis Kelamin</span>
                    <span className="text-slate-800">
                      : {curSantri.jk === 'L' ? 'Laki-laki (Putra)' : 'Perempuan (Putri)'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Tempat, Tgl Lahir</span>
                    <span className="text-slate-800">: {curSantri.tempatLahir}, {curSantri.tanggalLahir}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Tanggal Masuk TPQ</span>
                    <span className="text-slate-800">: {curSantri.tanggalMasuk}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-36 text-slate-500">Nama Ayah</span>
                    <span className="text-slate-800">: {curSantri.namaAyah}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Nama Ibu</span>
                    <span className="text-slate-800">: {curSantri.namaIbu}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">No. HP / WA Ortu</span>
                    <span className="text-slate-800 font-semibold">: {curSantri.noHpOrtu}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Alamat Tempat Tinggal</span>
                    <span className="text-slate-800">: {curSantri.alamat}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500">Akun Login Santri</span>
                    <span className="font-mono text-emerald-800 font-semibold">: {curSantri.username}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Riwayat Kenaikan Jilid */}
          {activeTab === 'histori_jilid' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Histori Kelulusan &amp; Kenaikan Tingkat Jilid
              </h4>

              {studentEvalHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada catatan evaluasi jilid sebelumnya.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentEvalHistory.map(ev => {
                    const dariJilid = curMetode?.jilidList.find(j => j.id === ev.dariJilidId);
                    const keJilid = curMetode?.jilidList.find(j => j.id === ev.keJilidId);

                    return (
                      <div key={ev.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {dariJilid?.nama || 'Jilid Awal'} → {keJilid?.nama || 'Jilid Berikutnya'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ev.status === 'Lulus (Naik Jilid)' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ev.status}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Tanggal: {ev.tanggalUjian} · Nilai: <strong>{ev.nilaiUjian}</strong> · Penguji: {ev.penguji}
                          </div>
                          {ev.catatan && (
                            <p className="text-slate-700 italic pt-1">"{ev.catatan}"</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Prestasi & Piagam */}
          {activeTab === 'prestasi' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Piagam Penghargaan &amp; Prestasi Kejuaraan
              </h4>

              {studentAwards.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada piagam penghargaan yang diterbitkan untuk ananda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studentAwards.map(aw => (
                    <div key={aw.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-amber-950 text-sm">
                          JUARA {aw.juara} · {aw.kategori}
                        </div>
                        <div className="text-slate-600">
                          Nomor Piagam: <span className="font-mono">{aw.nomorPiagam}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Nilai Rata-rata: <strong>{aw.nilaiAkhir.toFixed(1)}</strong> · {aw.tanggalTerbit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
