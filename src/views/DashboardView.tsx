import React from 'react';
import {
  Users,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpCircle,
  GraduationCap,
  PlusCircle,
  FileText,
  Printer,
  Calendar,
  CheckSquare,
  Clock,
  DownloadCloud
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  LembagaProfile,
  TahunPelajaran,
  Santri,
  Ustadz,
  Kelas,
  NilaiSantri,
  EvaluasiKenaikanJilid,
  RiwayatKenaikanKelas,
  MetodePembelajaran,
  JilidItem
} from '../types';

interface DashboardViewProps {
  lembaga: LembagaProfile;
  tahunAktif: TahunPelajaran;
  santriList: Santri[];
  ustadzList: Ustadz[];
  kelasList: Kelas[];
  nilaiList: NilaiSantri[];
  evaluasiJilidList: EvaluasiKenaikanJilid[];
  riwayatKenaikanKelas: RiwayatKenaikanKelas[];
  metodeList?: MetodePembelajaran[];
  onNavigate: (view: string) => void;
  onDownloadZip: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lembaga,
  tahunAktif,
  santriList,
  ustadzList,
  kelasList,
  nilaiList,
  evaluasiJilidList,
  riwayatKenaikanKelas,
  metodeList = [],
  onNavigate,
  onDownloadZip
}) => {
  const activeSantri = santriList.filter(s => s.status === 'aktif');
  const countL = activeSantri.filter(s => s.jk === 'L').length;
  const countP = activeSantri.filter(s => s.jk === 'P').length;

  // Nilai semester ini
  const currentSemesterNilai = nilaiList.filter(
    n => n.tahunId === tahunAktif.id && n.semester === tahunAktif.semesterAktif
  );
  const evaluatedSantriIds = new Set(currentSemesterNilai.map(n => n.santriId));
  const countDinilai = evaluatedSantriIds.size;
  const countBelumDinilai = Math.max(0, activeSantri.length - countDinilai);
  const percentDinilai = activeSantri.length > 0 ? Math.round((countDinilai / activeSantri.length) * 100) : 0;

  // Kenaikan jilid dan kelas
  const countNaikJilid = evaluasiJilidList.filter(e => e.status === 'Lulus (Naik Jilid)').length;
  const countNaikKelas = riwayatKenaikanKelas.filter(k => k.status === 'Naik Kelas').length;

  // Chart 1: Santri per Kelas
  const dataKelasChart = kelasList.map(k => {
    const total = activeSantri.filter(s => s.kelasId === k.id).length;
    return {
      nama: k.namaKelas.length > 18 ? k.namaKelas.substring(0, 16) + '...' : k.namaKelas,
      jumlah: total
    };
  });

  // Chart 2: Santri Berdasarkan Jilid Aktif
  const allJilids: { id: string; nama: string; urutan: number; metodeNama: string }[] = [];
  metodeList.forEach((m: MetodePembelajaran) => {
    (m.jilidList || []).forEach((j: JilidItem) => {
      allJilids.push({
        id: j.id,
        nama: j.nama,
        urutan: j.urutan,
        metodeNama: m.nama
      });
    });
  });

  // Count active santri per jilid
  const jilidCounts: Record<string, number> = {};
  activeSantri.forEach(s => {
    const key = s.jilidId || 'dasar';
    jilidCounts[key] = (jilidCounts[key] || 0) + 1;
  });

  let dataJilidChart = allJilids
    .map(j => {
      const count = jilidCounts[j.id] || 0;
      // Clean short label for chart axis
      const shortName = j.nama
        .replace(/Bilqolam\s+/i, 'Jld ')
        .replace(/Level\s+/i, 'Lvl ')
        .replace(/Tadarus\s+/i, 'Tad. ');
      return {
        id: j.id,
        nama: j.nama,
        shortName: shortName.length > 13 ? shortName.substring(0, 12) + '..' : shortName,
        jumlah: count,
        metode: j.metodeNama,
        persen: activeSantri.length > 0 ? Math.round((count / activeSantri.length) * 100) : 0
      };
    })
    .filter(item => item.jumlah > 0 || allJilids.length <= 8);

  if (dataJilidChart.length === 0 && Object.keys(jilidCounts).length > 0) {
    dataJilidChart = Object.entries(jilidCounts).map(([jId, count]) => ({
      id: jId,
      nama: `Jilid ${jId}`,
      shortName: `Jld ${jId}`,
      jumlah: count,
      metode: 'Metode Pembelajaran',
      persen: activeSantri.length > 0 ? Math.round((count / activeSantri.length) * 100) : 0
    }));
  }

  // Chart 2: Komposisi Gender
  const dataGender = [
    { name: 'Santri Putra (L)', value: countL, color: '#059669' },
    { name: 'Santri Putri (P)', value: countP, color: '#0284c7' }
  ];

  // Daily Reminders List
  const dailyTasks = [
    {
      title: 'Verifikasi Pengisian Nilai Halaqoh Bilqolam',
      desc: 'Pastikan 100% santri di halaqoh dasar sudah terinput nilai makharijul huruf',
      due: 'Hari ini, 17:00 WIB',
      isPending: countBelumDinilai > 0
    },
    {
      title: 'Jadwal Munaqosyah & Ujian Kenaikan Jilid',
      desc: 'Evaluasi 3 santri calon kenaikan ke Bilqolam Jilid 4 bersama penguji',
      due: 'Besok, 15:30 WIB',
      isPending: true
    },
    {
      title: 'Validasi Tanggal Penerbitan Rapor Semester',
      desc: `Rencana pembagian rapor ${tahunAktif.semesterAktif}: ${tahunAktif.semesterAktif === 'Ganjil' ? tahunAktif.tanggalRaporGanjil : tahunAktif.tanggalRaporGenap}`,
      due: 'Minggu ini',
      isPending: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-sm border border-emerald-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={lembaga.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
              alt="Logo TPQ"
              className="w-16 h-16 object-contain rounded-xl bg-white/10 p-2 shrink-0 backdrop-blur-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-900/60 text-emerald-200 rounded border border-emerald-500/30">
                  Semester {tahunAktif.semesterAktif}
                </span>
                <span className="text-xs text-emerald-200">
                  Tahun Pelajaran {tahunAktif.tahun}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
                {lembaga.nama}
              </h1>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {lembaga.yayasan} · {lembaga.alamat}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('isi_nilai')}
              className="px-3.5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <span>Input Nilai</span>
            </button>
            <button
              onClick={() => onNavigate('cetak_rapor')}
              className="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg border border-emerald-500/40 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor</span>
            </button>
            <button
              onClick={onDownloadZip}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              title="Download source code lengkap PHP 8+ dan database MySQL .sql"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Paket ZIP Deploy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Semester Grade Completion Progress Summary Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-50 rounded-full opacity-60 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Progres Penilaian Santri</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Semester {tahunAktif.semesterAktif} · TP {tahunAktif.tahun}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Keterisian Nilai Rapor Semester Ini
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Sebanyak <strong className="text-slate-900 font-bold">{countDinilai}</strong> dari total <strong className="text-slate-900 font-bold">{activeSantri.length}</strong> santri aktif (<span className="text-emerald-700 font-bold">{percentDinilai}%</span>) telah memiliki evaluasi nilai semester dan siap diterbitkan rapornya.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tabular-nums">
                {percentDinilai}%
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block">
                {countDinilai} dari {activeSantri.length} Santri
              </span>
            </div>
            <button
              onClick={() => onNavigate(countBelumDinilai > 0 ? 'isi_nilai' : 'cetak_rapor')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{countBelumDinilai > 0 ? 'Lengkapi Nilai' : 'Cetak Semua Rapor'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Component */}
        <div className="mt-4 pt-3 border-t border-slate-100 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Santri Sudah Dinilai: <strong>{countDinilai}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Belum Lengkap: <strong>{countBelumDinilai}</strong>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden flex shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percentDinilai === 100
                  ? 'bg-emerald-600'
                  : percentDinilai >= 70
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : percentDinilai >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(percentDinilai > 0 ? 4 : 0, percentDinilai))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span className={percentDinilai === 100 ? 'text-emerald-700 font-bold' : ''}>100% Siap Rapor</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Santri */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Santri</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeSantri.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {countL} Putra · {countP} Putri
          </div>
        </div>

        {/* Ustadz/Ustadzah */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Ustadz / Ustadzah</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {ustadzList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Pengampu Halaqoh
          </div>
        </div>

        {/* Halaqoh/Kelas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Kelas / Halaqoh</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {kelasList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Kelompok Belajar
          </div>
        </div>

        {/* Sudah Dinilai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sudah Dinilai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {countDinilai}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Santri Terdata
          </div>
        </div>

        {/* Belum Dinilai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Belum Dinilai</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            {countBelumDinilai}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Perlu Diisi Ustadz
          </div>
        </div>

        {/* Kenaikan Jilid */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Naik Jilid</span>
            <ArrowUpCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 tabular-nums">
            {countNaikJilid}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {countNaikKelas} Naik Kelas
          </div>
        </div>
      </div>

      {/* Row: Charts & Daily Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recharts Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Baru: Ringkasan Santri Berdasarkan Jilid Aktif */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Jumlah Santri Berdasarkan Jilid Aktif (Kemajuan Belajar)
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Grafik Batang
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemantauan cepat posisi jilid santri dari tingkat dasar (Bilqolam) hingga tahfidz dan tadarus Al-Qur'an
                </p>
              </div>
              <button
                onClick={() => onNavigate('kenaikan_jilid')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Kenaikan Jilid →</span>
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataJilidChart} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700 space-y-1">
                            <div className="font-bold text-emerald-400">{data.nama}</div>
                            <div className="text-[11px] text-slate-300">Metode: {data.metode}</div>
                            <div className="text-[11px] text-slate-200 font-semibold pt-1 border-t border-slate-700">
                              Jumlah: <span className="text-amber-400 font-bold">{data.jumlah}</span> Santri ({data.persen}% dari total)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                  />
                  <Bar
                    dataKey="jumlah"
                    name="Jumlah Santri"
                    fill="#059669"
                    radius={[5, 5, 0, 0]}
                  >
                    {dataJilidChart.map((entry, index) => {
                      // Visual progressive gradient per level
                      const colors = ['#059669', '#047857', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#7c3aed', '#d97706'];
                      return <Cell key={`cell-jilid-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Summary Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Ringkasan Kemajuan:</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                {dataJilidChart.length} Tingkat Jilid Aktif
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                {activeSantri.length} Total Santri Berjalan
              </span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold">
                {countNaikJilid} Santri Lulus Naik Jilid
              </span>
            </div>
          </div>

          {/* Chart 1: Santri per Halaqoh */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Distribusi Santri Berdasarkan Kelas / Halaqoh
                </h3>
                <p className="text-xs text-slate-500">
                  Jumlah santri aktif di setiap tingkatan kelompok belajar
                </p>
              </div>
              <button
                onClick={() => onNavigate('kelas')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Kelola Halaqoh →
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKelasChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="nama" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                  />
                  <Bar dataKey="jumlah" name="Jumlah Santri" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Akses Cepat Pengelolaan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => onNavigate('santri')}
                className="p-3 text-center rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <PlusCircle className="w-5 h-5 mx-auto text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800 block">Tambah Santri</span>
              </button>

              <button
                onClick={() => onNavigate('isi_nilai')}
                className="p-3 text-center rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <FileText className="w-5 h-5 mx-auto text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800 block">Input Nilai</span>
              </button>

              <button
                onClick={() => onNavigate('kenaikan_jilid')}
                className="p-3 text-center rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all group"
              >
                <ArrowUpCircle className="w-5 h-5 mx-auto text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800 block">Kenaikan Jilid</span>
              </button>

              <button
                onClick={() => onNavigate('kenaikan_kelas')}
                className="p-3 text-center rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
              >
                <GraduationCap className="w-5 h-5 mx-auto text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800 block">Kenaikan Kelas</span>
              </button>

              <button
                onClick={() => onNavigate('cetak_rapor')}
                className="p-3 text-center rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all group"
              >
                <Printer className="w-5 h-5 mx-auto text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800 block">Cetak Rapor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Daily Reminders & Gender Composition */}
        <div className="space-y-6">
          {/* Daily Reminders */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Pengingat Harian TPQ</h3>
              </div>
              <span className="text-[11px] text-slate-400">Otomatis</span>
            </div>

            <div className="space-y-3">
              {dailyTasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-colors ${
                    task.isPending ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 leading-snug">
                      {task.title}
                    </span>
                    {task.isPending ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-600 text-white rounded shrink-0">
                        Perlu Tindakan
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium bg-emerald-100 text-emerald-800 rounded shrink-0">
                        Terjadwal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {task.desc}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Composition Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Komposisi Santri Putra &amp; Putri
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Perbandingan santri laki-laki dan perempuan aktif
            </p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataGender}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
