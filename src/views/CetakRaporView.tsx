import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Eye,
  QrCode
} from 'lucide-react';
import {
  LembagaProfile,
  TahunPelajaran,
  Kelas,
  Santri,
  Ustadz,
  MetodePembelajaran,
  CatatanRapor
} from '../types';
import { storageService } from '../services/storageService';
import { pdfService } from '../services/pdfService';
import { directPrintElement } from '../utils/printHelper';
import { generateRaporQRDataUrl } from '../utils/qrHelper';

interface CetakRaporViewProps {
  lembaga: LembagaProfile;
  tahunList: TahunPelajaran[];
  activeTahun: TahunPelajaran;
  kelasList: Kelas[];
  santriList: Santri[];
  ustadzList: Ustadz[];
  metodeList: MetodePembelajaran[];
  catatanRaporList: CatatanRapor[];
  initialSantriId?: string;
}

export const CetakRaporView: React.FC<CetakRaporViewProps> = ({
  lembaga,
  tahunList,
  activeTahun,
  kelasList,
  santriList,
  ustadzList,
  metodeList,
  catatanRaporList,
  initialSantriId
}) => {
  const [selectedTahunId, setSelectedTahunId] = useState(activeTahun.id);
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>(activeTahun.semesterAktif);
  const [selectedKelasId, setSelectedKelasId] = useState(() => {
    if (initialSantriId) {
      const match = santriList.find(s => s.id === initialSantriId);
      if (match?.kelasId) return match.kelasId;
    }
    return kelasList[0]?.id || '';
  });
  const [selectedSantriId, setSelectedSantriId] = useState(initialSantriId || santriList[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const curTahun = tahunList.find(t => t.id === selectedTahunId) || activeTahun;
  const classSantri = santriList.filter(s => s.kelasId === selectedKelasId && s.status === 'aktif');
  const targetSantri = santriList.find(s => s.id === selectedSantriId) || classSantri[0] || santriList[0];

  // Prepare Rapor Data for selected student
  const getStudentRaporPayload = (santri: Santri) => {
    const scores = storageService.calculateSantriNilai(santri.id, selectedTahunId, selectedSemester);
    const kelas = kelasList.find(k => k.id === santri.kelasId);
    const ustadz = ustadzList.find(u => u.id === kelas?.ustadzId);
    const metode = metodeList.find(m => m.id === santri.metodeId);
    const jilid = metode?.jilidList.find(j => j.id === santri.jilidId);
    const catatanRapor = catatanRaporList.find(
      c => c.santriId === santri.id && c.tahunId === selectedTahunId && c.semester === selectedSemester
    );
    const rankInfo = storageService.getSantriRanking(santri.id, santri.kelasId, selectedTahunId, selectedSemester);

    return {
      santri,
      scores,
      kelas,
      ustadz,
      metode,
      jilidNama: jilid?.nama || 'Dasar',
      catatanRapor,
      lembaga,
      ranking: rankInfo.ranking,
      totalSantriKelas: rankInfo.totalSantri,
      tahun: curTahun,
      semester: selectedSemester
    };
  };

  const previewData = targetSantri ? getStudentRaporPayload(targetSantri) : null;
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate unique verifiable QR Code whenever target student or period changes
  useEffect(() => {
    let isMounted = true;
    if (previewData) {
      generateRaporQRDataUrl(
        previewData.santri,
        previewData.tahun,
        previewData.semester,
        previewData.kelas?.namaKelas || 'Umum'
      ).then(url => {
        if (isMounted) setQrDataUrl(url);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [targetSantri?.id, selectedTahunId, selectedSemester]);

  // Single PDF Download
  const handleDownloadPDF = async () => {
    if (!previewData) return;
    setIsGeneratingPDF(true);
    setStatusAlert(null);
    try {
      await pdfService.generateRaporPDF(previewData, true);
      setStatusAlert({
        type: 'success',
        message: `Rapor PDF untuk ananda ${previewData.santri.namaLengkap} berhasil diunduh.`
      });
    } catch (e) {
      console.error(e);
      setStatusAlert({
        type: 'error',
        message: 'Gagal membuat file PDF. Silakan periksa kembali kelengkapan data.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Mass PDF Download for entire class (Consolidated single multi-page PDF document)
  const handleBatchDownloadPDF = async () => {
    if (!classSantri.length) return;
    setIsGeneratingPDF(true);
    const curKelas = kelasList.find(k => k.id === selectedKelasId);
    setStatusAlert({
      type: 'info',
      message: `Sedang menyusun seluruh rapor ${classSantri.length} santri kelas ${curKelas?.namaKelas || ''} ke dalam 1 berkas PDF siap cetak...`
    });
    try {
      const payloadList = classSantri.map(s => getStudentRaporPayload(s));
      const filename = `Rapor_Massal_${curKelas?.namaKelas || 'Kelas'}_${curTahun.tahun.replace('/', '-')}_Semester_${selectedSemester}.pdf`;
      await pdfService.generateBatchRaporPDF(payloadList, filename);
      setStatusAlert({
        type: 'success',
        message: `Berhasil mengunduh dokumen massal ${classSantri.length} rapor santri dalam satu file PDF!`
      });
    } catch (e) {
      console.error(e);
      setStatusAlert({
        type: 'error',
        message: 'Terjadi kesalahan saat memproses cetak massal rapor PDF.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Direct Browser Native Print for isolated Rapor document
  const handleNativePrint = () => {
    if (!previewData) return;
    directPrintElement('rapor-print-sheet', `Rapor - ${previewData.santri.namaLengkap} (${previewData.santri.nis})`);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Pencetakan Rapor Hasil Belajar Santri</span>
          </h2>
          <p className="text-xs text-slate-500">
            Preview lembar rapor resmi, ekspor PDF resolusi tinggi via jsPDF, dan cetak massal satu kelas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNativePrint}
            className="px-3.5 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Langsung (Print)</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF || !targetSantri}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Download Rapor (PDF)'}</span>
          </button>

          <button
            onClick={handleBatchDownloadPDF}
            disabled={isGeneratingPDF || classSantri.length === 0}
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Download seluruh rapor santri dalam kelas ini sekaligus"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak Massal 1 Kelas ({classSantri.length})</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner for Single & Batch Operations */}
      {statusAlert && (
        <div
          className={`no-print p-3 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in ${
            statusAlert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusAlert.type === 'info'
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusAlert.message}</span>
          </div>
          <button
            onClick={() => setStatusAlert(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Selector Panel */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
            <select
              value={selectedTahunId}
              onChange={(e) => setSelectedTahunId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              {tahunList.map(t => (
                <option key={t.id} value={t.id}>{t.tahun} {t.isAktif ? '(Aktif)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas / Halaqoh</label>
            <select
              value={selectedKelasId}
              onChange={(e) => {
                setSelectedKelasId(e.target.value);
                const firstS = santriList.find(s => s.kelasId === e.target.value && s.status === 'aktif');
                if (firstS) setSelectedSantriId(firstS.id);
              }}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>{k.namaKelas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Santri yang Dilihat</label>
            <select
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              {classSantri.map(s => (
                <option key={s.id} value={s.id}>{s.namaLengkap} ({s.nis})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RAPOR PREVIEW CONTAINER (Ready for Print & PDF) */}
      {previewData ? (
        <div
          id="rapor-print-sheet"
          className="bg-white p-6 sm:p-9 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-5 text-slate-800 print:shadow-none print:border-none print:p-0 print:space-y-4"
        >
          {/* KOP RAPOR */}
          <div className="flex items-center gap-4 border-b-2 border-emerald-600 pb-3">
            <img
              src={lembaga.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
              alt="Logo TPQ"
              className="w-18 h-18 sm:w-20 sm:h-20 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-center flex-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {lembaga.yayasan}
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight leading-tight uppercase mt-0.5">
                {lembaga.nama}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nomor Statistik (NSTPQ): <strong>{lembaga.nstpq || lembaga.nspq}</strong> · Telp/WA: {lembaga.telepon}
              </p>
              <p className="text-[11px] text-slate-500">
                {lembaga.alamat}, {lembaga.kota} · Website: {lembaga.website}
              </p>
            </div>
          </div>

          {/* Judul Rapor */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              RAPOR HASIL BELAJAR SANTRI
            </h3>
            <p className="text-xs text-slate-500">
              Tahun Pelajaran {curTahun.tahun} · Semester {selectedSemester}
            </p>
          </div>

          {/* Identitas Santri Box - Strict CSS Grid & Wrapping */}
          <div className="rapor-grid bg-slate-50 border border-slate-300 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] overflow-hidden break-inside-avoid">
            <div className="flex items-start min-w-0">
              <span className="w-28 shrink-0 text-slate-500">Nama Lengkap</span>
              <span className="font-bold text-slate-900 break-words min-w-0 flex-1">: {previewData.santri.namaLengkap}</span>
            </div>
            <div className="flex items-start min-w-0">
              <span className="w-28 shrink-0 text-slate-500">Kelas / Halaqoh</span>
              <span className="font-semibold text-slate-900 break-words min-w-0 flex-1">: {previewData.kelas?.namaKelas || 'Umum'}</span>
            </div>
            <div className="flex items-start min-w-0">
              <span className="w-28 shrink-0 text-slate-500">Nomor Induk (NIS)</span>
              <span className="font-mono text-slate-900 break-words min-w-0 flex-1">: {previewData.santri.nis}</span>
            </div>
            <div className="flex items-start min-w-0">
              <span className="w-28 shrink-0 text-slate-500">Wali / Pengampu</span>
              <span className="text-slate-900 break-words min-w-0 flex-1">: {previewData.ustadz?.nama || '-'}</span>
            </div>
            <div className="flex items-start min-w-0">
              <span className="w-28 shrink-0 text-slate-500">Metode / Jilid</span>
              <span className="font-semibold text-emerald-800 break-words min-w-0 flex-1">
                : {previewData.metode?.nama} - {previewData.jilidNama}
              </span>
            </div>
            <div className="flex items-start min-w-0">
              <span className="w-28 shrink-0 text-slate-500">Status Santri</span>
              <span className="font-bold uppercase text-emerald-700 break-words min-w-0 flex-1">: {previewData.santri.status}</span>
            </div>
            <div className="flex items-center sm:col-span-2 pt-1 border-t border-slate-200 flex-wrap gap-1">
              <span className="w-28 shrink-0 text-slate-500">Peringkat Kelas</span>
              <span className="font-bold text-amber-700 flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                <span>:</span>
                {previewData.ranking && previewData.ranking > 0 ? (
                  <>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                      Peringkat Ke-{previewData.ranking}
                    </span>
                    <span className="text-slate-500 font-normal">dari total {previewData.totalSantriKelas || 0} santri</span>
                  </>
                ) : (
                  <span>Belum ditentukan</span>
                )}
              </span>
            </div>
          </div>

          {/* A. Penilaian Hasil Belajar - Strict Table Layout with Multi-line Wrapping */}
          <div className="space-y-1.5 break-inside-avoid">
            <h4 className="font-bold text-slate-900 text-xs tracking-wide">
              A. PENILAIAN HASIL BELAJAR
            </h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="rapor-table w-full text-left text-[11px] text-slate-800 table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '35%' }} />
                </colgroup>
                <thead className="bg-emerald-600 text-white font-semibold">
                  <tr className="rapor-table-row">
                    <th className="px-2 py-1.5 text-center">No</th>
                    <th className="px-2 py-1.5">Komponen Penilaian</th>
                    <th className="px-2 py-1.5 text-center">Bobot</th>
                    <th className="px-2 py-1.5 text-center">Nilai</th>
                    <th className="px-2 py-1.5 text-center">Predikat</th>
                    <th className="px-2 py-1.5">Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewData.scores.items.map((item, index) => (
                    <tr key={item.komponenId} className={`rapor-table-row align-top ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                      <td className="px-2 py-1.5 text-center text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-2 py-1.5 font-medium text-slate-900 whitespace-normal break-words leading-snug">{item.nama}</td>
                      <td className="px-2 py-1.5 text-center text-slate-500">{item.bobot}%</td>
                      <td className="px-2 py-1.5 text-center font-bold text-slate-900 tabular-nums">{item.nilai}</td>
                      <td className="px-2 py-1.5 text-center font-bold text-emerald-700">{item.predikat}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[10px] whitespace-normal break-words leading-snug">{item.catatan || '-'}</td>
                    </tr>
                  ))}
                  {/* Row Nilai Akhir */}
                  <tr className="rapor-table-row bg-emerald-50 font-bold text-slate-900 border-t-2 border-emerald-500 align-top">
                    <td colSpan={2} className="px-2 py-1.5 text-right uppercase text-[10px]">Nilai Akhir Rata-rata</td>
                    <td className="px-2 py-1.5 text-center">100%</td>
                    <td className="px-2 py-1.5 text-center text-emerald-800 tabular-nums text-xs">
                      {previewData.scores.rataRata}
                    </td>
                    <td className="px-2 py-1.5 text-center text-emerald-800">
                      {previewData.scores.predikat}
                    </td>
                    <td className="px-2 py-1.5 text-emerald-900 text-[10px] whitespace-normal break-words leading-snug">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{previewData.scores.label}</span>
                        {previewData.ranking && previewData.ranking > 0 && (
                          <span className="inline-block px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[9px] whitespace-nowrap">
                            Peringkat {previewData.ranking}/{previewData.totalSantriKelas || 0}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* B. Capaian Pembelajaran & Kehadiran - Strict 2-column Grid with Wrapping */}
          <div className="space-y-1.5 break-inside-avoid">
            <h4 className="font-bold text-slate-900 text-xs tracking-wide">
              B. CAPAIAN PEMBELAJARAN &amp; KEHADIRAN
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] overflow-hidden">
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1 min-w-0 overflow-hidden">
                <span className="font-bold text-emerald-900 block">Capaian Materi &amp; Target:</span>
                <p className="text-slate-700 whitespace-normal break-words leading-snug">
                  • Hafalan: {previewData.catatanRapor?.capaianHafalan || 'Sesuai kurikulum target tingkat'}
                </p>
                <p className="text-slate-700 whitespace-normal break-words leading-snug">
                  • Ibadah: {previewData.catatanRapor?.capaianIbadah || 'Praktik sholat dan doa harian aktif'}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1 min-w-0 overflow-hidden">
                <span className="font-bold text-emerald-900 block">Kehadiran (Absensi) Semester Ini:</span>
                <p className="text-slate-700 whitespace-normal break-words leading-snug">
                  Sakit: <strong>{previewData.catatanRapor?.sakit || 0}</strong> hari · Izin:{' '}
                  <strong>{previewData.catatanRapor?.izin || 0}</strong> hari · Alpa:{' '}
                  <strong>{previewData.catatanRapor?.tanpaKeterangan || 0}</strong> hari
                </p>
                <div className="text-slate-800 whitespace-normal break-words leading-snug pt-0.5">
                  <span className="font-bold block">Keputusan:</span>
                  <span className="text-emerald-700 font-bold block">
                    {previewData.catatanRapor?.keputusanKenaikanKelas && previewData.catatanRapor.keputusanKenaikanKelas !== 'Belum Ditentukan'
                      ? previewData.catatanRapor.keputusanKenaikanKelas
                      : `Lulus Naik Jilid / Tingkat Selanjutnya (${previewData.jilidNama})`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Catatan & Motivasi */}
          <div className="space-y-1.5 break-inside-avoid">
            <h4 className="font-bold text-slate-900 text-xs tracking-wide">
              C. CATATAN &amp; MOTIVASI USTADZ / KEPALA TPQ
            </h4>
            <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1 text-[11px] italic text-slate-700 overflow-hidden">
              <p className="whitespace-normal break-words leading-snug">
                "Wali Kelas: {previewData.catatanRapor?.catatanWali || 'Alhamdulillah, ananda menunjukkan perkembangan membaca yang sangat baik dan tekun dalam menghafal Al-Qur\'an.'}"
              </p>
              <p className="whitespace-normal break-words leading-snug">
                "Kepala TPQ: {previewData.catatanRapor?.catatanKepala || 'Barakallah, terus istiqomah dalam membaca dan mengamalkan adab Qur\'ani setiap hari.'}"
              </p>
            </div>
          </div>

          {/* Pengesahan, Tanda Tangan & QR Code Validasi Keaslian Dokumen */}
          <div className="pt-3 border-t border-slate-300 text-[11px] break-inside-avoid">
            <div className="text-right text-slate-600 mb-2">
              {lembaga.kotaPenerbitan},{' '}
              {selectedSemester === 'Ganjil'
                ? curTahun.tanggalRaporGanjil || '20 Desember 2025'
                : curTahun.tanggalRaporGenap || '20 Juni 2026'}
            </div>

            <div className="grid grid-cols-4 text-center gap-2 items-start">
              <div className="min-w-0">
                <p className="text-slate-600 font-medium">Orang Tua / Wali Santri</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 break-words">( .................................... )</p>
              </div>

              <div className="min-w-0">
                <p className="text-slate-600 font-medium">Ustadz / Wali Halaqoh</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 whitespace-normal break-words leading-tight">
                  ( {previewData.ustadz?.nama || 'Ustadz Pembimbing'} )
                </p>
              </div>

              {/* QR Code Unik Validasi Keaslian Dokumen Rapor */}
              <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Validasi Rapor" className="w-14 h-14 object-contain shadow-2xs rounded" />
                ) : (
                  <div className="w-14 h-14 bg-slate-200 flex items-center justify-center text-[8px] text-slate-400 rounded">
                    QR Code
                  </div>
                )}
                <span className="text-[9px] font-bold text-slate-800 uppercase tracking-tight mt-1 flex items-center gap-0.5">
                  <QrCode className="w-2.5 h-2.5 text-emerald-600" />
                  Validasi Digital
                </span>
                <span className="text-[7.5px] text-slate-500 font-mono">Resmi TPQ Al-Adzkiyaa’</span>
              </div>

              <div className="min-w-0">
                <p className="text-slate-600 font-medium">Mengetahui,</p>
                <p className="text-slate-600 font-semibold">{lembaga.jabatanPenandatangan}</p>
                <div className="h-10"></div>
                <p className="font-bold text-slate-900 whitespace-normal break-words leading-tight">( {lembaga.kepalaTpq} )</p>
                {lembaga.nipKepala && (
                  <p className="text-[9px] text-slate-400">NIP: {lembaga.nipKepala}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="text-center pt-2 border-t border-slate-200 text-[9px] text-slate-400 break-inside-avoid">
            {lembaga.footnote}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
          Silakan pilih santri untuk melihat preview lembar rapor.
        </div>
      )}
    </div>
  );
};
