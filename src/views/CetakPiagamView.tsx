import React, { useState } from 'react';
import {
  Award,
  Download,
  Printer,
  Sparkles,
  Trophy,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import {
  LembagaProfile,
  TahunPelajaran,
  Kelas,
  Santri,
  PiagamJuara
} from '../types';
import { storageService } from '../services/storageService';
import { pdfService } from '../services/pdfService';
import { directPrintPiagam } from '../utils/printHelper';

interface CetakPiagamViewProps {
  lembaga: LembagaProfile;
  tahunList: TahunPelajaran[];
  activeTahun: TahunPelajaran;
  kelasList: Kelas[];
  santriList: Santri[];
  piagamList: PiagamJuara[];
  onSavePiagam: (piagam: PiagamJuara) => void;
  onDeletePiagam: (id: string) => void;
}

export const CetakPiagamView: React.FC<CetakPiagamViewProps> = ({
  lembaga,
  tahunList,
  activeTahun,
  kelasList,
  santriList,
  piagamList,
  onSavePiagam,
  onDeletePiagam
}) => {
  const [selectedTahunId, setSelectedTahunId] = useState(activeTahun.id);
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>(activeTahun.semesterAktif);
  const [selectedKelasId, setSelectedKelasId] = useState(kelasList[0]?.id || '');
  const [previewPiagam, setPreviewPiagam] = useState<PiagamJuara | null>(piagamList[0] || null);
  const [piagamOrientation, setPiagamOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const curTahun = tahunList.find(t => t.id === selectedTahunId) || activeTahun;
  const classSantri = santriList.filter(s => s.kelasId === selectedKelasId && s.status === 'aktif');
  const curKelas = kelasList.find(k => k.id === selectedKelasId);

  // Form for manual piagam creation
  const [formData, setFormData] = useState<Partial<PiagamJuara>>({
    santriId: classSantri[0]?.id || '',
    kategori: 'Prestasi Akademik Rapor Semester Ganjil',
    juara: 1,
    nilaiAkhir: 90,
    tanggalTerbit: curTahun.tanggalRaporGanjil || '2025-12-20'
  });

  // Auto-Rank Generator from semester scores
  const handleGenerateAutoRank = () => {
    if (!classSantri.length) return;

    // Calculate score for each student
    const ranked = classSantri
      .map(s => {
        const sc = storageService.calculateSantriNilai(s.id, selectedTahunId, selectedSemester);
        return {
          santri: s,
          rataRata: sc.rataRata
        };
      })
      .filter(item => item.rataRata > 0)
      .sort((a, b) => b.rataRata - a.rataRata);

    if (ranked.length === 0) {
      setStatusAlert({
        type: 'error',
        message: 'Belum ada nilai santri yang diinput di kelas ini untuk dihitung peringkatnya.'
      });
      return;
    }

    // Assign Juara 1, 2, 3
    const top3 = ranked.slice(0, 3);
    top3.forEach((item, index) => {
      const juaraNum = (index + 1) as 1 | 2 | 3;
      const nomorPiagam = `PG/TPQ-ADZ/${curTahun.tahun.replace('/', '-')}/${(piagamList.length + index + 1).toString().padStart(3, '0')}`;
      const newPiagam: PiagamJuara = {
        id: `pg-${Date.now()}-${index}`,
        nomorPiagam,
        santriId: item.santri.id,
        tahunId: selectedTahunId,
        semester: selectedSemester,
        kelasId: selectedKelasId,
        kategori: `Prestasi Nilai Rapor Semester ${selectedSemester}`,
        juara: juaraNum,
        nilaiAkhir: item.rataRata,
        tanggalTerbit: selectedSemester === 'Ganjil' ? curTahun.tanggalRaporGanjil : curTahun.tanggalRaporGenap
      };
      onSavePiagam(newPiagam);
    });

    setStatusAlert({
      type: 'success',
      message: `Berhasil menentukan Juara 1, 2, dan 3 otomatis berdasarkan nilai tertinggi di ${curKelas?.namaKelas}!`
    });
  };

  const handleDownloadSinglePDF = async (piagam: PiagamJuara) => {
    const s = santriList.find(item => item.id === piagam.santriId);
    if (!s) return;
    setIsGeneratingPDF(true);
    setStatusAlert(null);
    try {
      const k = kelasList.find(item => item.id === piagam.kelasId);
      const t = tahunList.find(item => item.id === piagam.tahunId);
      await pdfService.generatePiagamPDF(piagam, s, k, t, lembaga, true, piagamOrientation);
      setStatusAlert({
        type: 'success',
        message: `Piagam Juara ${piagam.juara} (${s.namaLengkap}) format ${piagamOrientation.toUpperCase()} berhasil diunduh.`
      });
    } catch (e) {
      console.error(e);
      setStatusAlert({
        type: 'error',
        message: 'Gagal mendownload PDF Piagam.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Mass PDF Download for all piagam in this class & semester (Single multi-page PDF)
  const handleDownloadAllPiagamPDF = async () => {
    const targets = piagamList.filter(
      p => p.tahunId === selectedTahunId && p.semester === selectedSemester && p.kelasId === selectedKelasId
    );
    if (targets.length === 0) {
      setStatusAlert({
        type: 'error',
        message: 'Tidak ada piagam penghargaan pada periode dan kelas yang dipilih.'
      });
      return;
    }

    setIsGeneratingPDF(true);
    setStatusAlert({
      type: 'info',
      message: `Sedang menyusun seluruh ${targets.length} piagam ke dalam 1 file PDF kolektif siap cetak...`
    });
    try {
      const targetsWithData = targets.map(p => ({
        piagam: p,
        santri: santriList.find(item => item.id === p.santriId) || ({} as Santri),
        kelas: kelasList.find(item => item.id === p.kelasId),
        tahun: tahunList.find(item => item.id === p.tahunId)
      })).filter(item => item.santri.id);

      const filename = `Piagam_Massal_${curKelas?.namaKelas || 'Kelas'}_${piagamOrientation}.pdf`;
      await pdfService.generateBatchPiagamPDF(targetsWithData, lembaga, piagamOrientation, filename);
      setStatusAlert({
        type: 'success',
        message: `Berhasil mengunduh dokumen kolektif ${targets.length} piagam penghargaan (${piagamOrientation.toUpperCase()})!`
      });
    } catch (e) {
      console.error(e);
      setStatusAlert({
        type: 'error',
        message: 'Terjadi kesalahan saat memproses unduh massal piagam.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Native Print Handler for isolated Piagam Document
  const handleNativePrint = () => {
    if (!previewPiagam) return;
    const s = previewSantri || santriList.find(item => item.id === previewPiagam.santriId);
    directPrintPiagam(
      'piagam-print-sheet',
      piagamOrientation,
      `Piagam Juara ${previewPiagam.juara} - ${s?.namaLengkap || 'Santri'}`
    );
  };

  const handleManualCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.santriId) return;

    const nomorPiagam = `PG/TPQ-ADZ/${curTahun.tahun.replace('/', '-')}/${(piagamList.length + 1).toString().padStart(3, '0')}`;
    const newObj: PiagamJuara = {
      id: `pg-${Date.now()}`,
      nomorPiagam,
      santriId: formData.santriId,
      tahunId: selectedTahunId,
      semester: selectedSemester,
      kelasId: selectedKelasId,
      kategori: formData.kategori || 'Prestasi Akademik Rapor',
      juara: Number(formData.juara) as 1 | 2 | 3,
      nilaiAkhir: Number(formData.nilaiAkhir) || 90,
      tanggalTerbit: formData.tanggalTerbit || new Date().toISOString().split('T')[0]
    };

    onSavePiagam(newObj);
    setPreviewPiagam(newObj);
    setIsCreateModalOpen(false);
  };

  // Filtered piagam list
  const filteredPiagamList = piagamList.filter(
    p => p.tahunId === selectedTahunId && p.semester === selectedSemester && p.kelasId === selectedKelasId
  );

  const previewSantri = previewPiagam ? santriList.find(s => s.id === previewPiagam.santriId) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Pencetakan Piagam Penghargaan Santri (Juara 1, 2, 3)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Desain piagam resmi Islami berbingkai kaligrafi, auto-ranking nilai rapor, dan ekspor jsPDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateAutoRank}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Hitung otomatis santri dengan nilai tertinggi di kelas ini"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tentukan Juara Otomatis</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Tambah Piagam Manual</span>
          </button>

          <button
            onClick={handleDownloadAllPiagamPDF}
            disabled={isGeneratingPDF || filteredPiagamList.length === 0}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Semua Piagam ({filteredPiagamList.length})</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
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

      {/* Selector Toolbar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
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
          <label className="block font-semibold text-slate-700 mb-1">Kelas / Halaqoh</label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
          >
            {kelasList.map(k => (
              <option key={k.id} value={k.id}>{k.namaKelas}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Format Orientasi Cetak</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setPiagamOrientation('landscape')}
              className={`py-1.5 text-center font-bold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 ${
                piagamOrientation === 'landscape'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-3.5 h-2.5 border-2 border-current rounded-xs inline-block"></span>
              <span>Landscape</span>
            </button>
            <button
              type="button"
              onClick={() => setPiagamOrientation('portrait')}
              className={`py-1.5 text-center font-bold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 ${
                piagamOrientation === 'portrait'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-2.5 h-3.5 border-2 border-current rounded-xs inline-block"></span>
              <span>Portrait</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Piagam Cards & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left List: Piagam Recipients */}
        <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Daftar Penerima Piagam</span>
            <span className="text-xs font-normal text-slate-400">{filteredPiagamList.length} Piagam</span>
          </h3>

          <div className="space-y-2">
            {filteredPiagamList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada piagam di kelas ini. Klik tombol <strong>"Tentukan Juara Otomatis"</strong> di atas.
              </div>
            ) : (
              filteredPiagamList
                .sort((a, b) => a.juara - b.juara)
                .map(p => {
                  const santri = santriList.find(s => s.id === p.santriId);
                  const isSelected = previewPiagam?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setPreviewPiagam(p)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                            p.juara === 1
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : p.juara === 2
                              ? 'bg-slate-200 text-slate-800 border border-slate-300'
                              : 'bg-amber-800/15 text-amber-900 border border-amber-400/40'
                          }`}>
                            {p.juara}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{santri?.namaLengkap}</div>
                            <div className="text-[11px] text-slate-500">Nilai Rata-rata: {p.nilaiAkhir.toFixed(1)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSinglePDF(p);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Download PDF Piagam"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Hapus piagam penghargaan ini?')) {
                                onDeletePiagam(p.id);
                                if (previewPiagam?.id === p.id) setPreviewPiagam(null);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Piagam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 mt-2 italic truncate">
                        "{p.kategori}"
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Preview (Modern Minimalist Certificate: Landscape & Portrait) */}
        <div className="lg:col-span-2">
          {previewPiagam && previewSantri ? (
            <div className="space-y-4">
              <div className="no-print flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-800">Preview Desain Piagam:</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                    {piagamOrientation === 'landscape' ? 'Format Landscape (Mendatar)' : 'Format Portrait (Tegak)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNativePrint}
                    className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Cetak Langsung (Print)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSinglePDF(previewPiagam)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF ({piagamOrientation.toUpperCase()})</span>
                  </button>
                </div>
              </div>

              {/* Certificate Paper Container - Modern Minimalist Elegant with Enlarged Fonts */}
              <div
                id="piagam-print-sheet"
                className={`mx-auto bg-white rounded-2xl shadow-xl border-2 border-emerald-600 p-4 sm:p-7 relative overflow-hidden text-slate-800 transition-all ${
                  piagamOrientation === 'portrait' ? 'max-w-xl' : 'max-w-4xl'
                }`}
              >
                {/* Inner Thin Gold Hairline Frame with Modern Minimalist Accents */}
                <div className="border border-amber-500/90 p-6 sm:p-9 rounded-xl relative bg-gradient-to-b from-white via-slate-50/25 to-white text-center space-y-4">
                  {/* Modern Minimalist Corner Brackets */}
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-600 pointer-events-none"></div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-600 pointer-events-none"></div>
                  <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-600 pointer-events-none"></div>
                  <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-600 pointer-events-none"></div>

                  {/* Lembaga Header & Logo */}
                  <div className="space-y-1.5">
                    <img
                      src={lembaga.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
                      alt="Logo TPQ"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto drop-shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">
                      {lembaga.yayasan}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-800 uppercase tracking-tight">
                      {lembaga.nama}
                    </div>
                    <div className="text-xs text-slate-500">
                      NSTPQ: {lembaga.nstpq || lembaga.nspq} · {lembaga.alamat}
                    </div>
                  </div>

                  <div className="w-32 h-0.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600 mx-auto"></div>

                  {/* Indonesian Bismillah without Arabic script */}
                  <div className="text-sm sm:text-base italic text-slate-700 font-medium tracking-wide py-0.5">
                    "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang"
                  </div>

                  {/* Title Piagam */}
                  <div className="pt-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-widest text-slate-900 uppercase">
                      PIAGAM PENGHARGAAN
                    </h1>
                    <div className="text-xs sm:text-sm text-slate-500 font-mono mt-1 tracking-wider">
                      Nomor: {previewPiagam.nomorPiagam}
                    </div>
                  </div>

                  <div className="text-sm sm:text-base text-slate-600 font-medium pt-1">
                    Diberikan dengan penuh rasa syukur dan bangga kepada:
                  </div>

                  {/* Nama Santri Menonjol (Substantially Enlarged) */}
                  <div className="py-2">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-700 uppercase tracking-wide inline-block border-b-2 border-amber-500 pb-1">
                      {previewSantri.namaLengkap}
                    </span>
                    <div className="text-xs sm:text-sm text-slate-600 font-semibold mt-1.5">
                      NIS: {previewSantri.nis} · Kelas / Halaqoh: {curKelas?.namaKelas}
                    </div>
                  </div>

                  {/* Juara Modern Minimalist Badge (Prominent) */}
                  <div className="py-2">
                    <div className="inline-block px-7 py-2 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl shadow-2xs">
                      <div className={`text-base sm:text-xl font-black uppercase tracking-wider ${
                        previewPiagam.juara === 1 ? 'text-amber-700' : previewPiagam.juara === 2 ? 'text-slate-700' : 'text-amber-900'
                      }`}>
                        SEBAGAI JUARA {previewPiagam.juara}
                      </div>
                    </div>
                    <div className="text-sm sm:text-base text-slate-800 mt-2.5 font-medium">
                      Atas pencapaian "{previewPiagam.kategori}" dengan Nilai Rata-rata <strong>{previewPiagam.nilaiAkhir.toFixed(1)}</strong>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 mt-1">
                      Tahun Pelajaran {curTahun.tahun} · Semester {previewPiagam.semester}
                    </div>
                  </div>

                  {/* Signatures Modern */}
                  <div className={`pt-6 grid grid-cols-2 gap-4 text-center ${piagamOrientation === 'portrait' ? 'pt-8' : 'pt-6'}`}>
                    <div>
                      <div className="text-xs sm:text-sm text-slate-500">Mengetahui / Menyetujui,</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Wali Kelas / Halaqoh</div>
                      <div className="h-14 sm:h-16"></div>
                      <div className="font-extrabold text-slate-900 text-sm sm:text-base">( .................................... )</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-slate-500">
                        {lembaga.kotaPenerbitan}, {previewPiagam.tanggalTerbit || '20 Desember 2025'}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{lembaga.jabatanPenandatangan}</div>
                      <div className="h-10 sm:h-12 flex items-center justify-center text-xs text-slate-400 italic">
                        [ Cap Stempel Lembaga ]
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm sm:text-base">( {lembaga.kepalaTpq} )</div>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="text-[11px] sm:text-xs text-slate-400 pt-4 border-t border-slate-100">
                    {lembaga.footnote}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-16 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
              Pilih salah satu piagam penghargaan di panel sebelah kiri untuk melihat preview.
            </div>
          )}
        </div>
      </div>

      {/* Modal Manual Create Piagam */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Terbitkan Piagam Penghargaan Manual
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleManualCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Santri Penerima *
                </label>
                <select
                  required
                  value={formData.santriId}
                  onChange={(e) => setFormData({ ...formData, santriId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                >
                  {classSantri.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} ({s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peringkat Juara *
                </label>
                <select
                  value={formData.juara}
                  onChange={(e) => setFormData({ ...formData, juara: Number(e.target.value) as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-800"
                >
                  <option value={1}>JUARA 1</option>
                  <option value={2}>JUARA 2</option>
                  <option value={3}>JUARA 3</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Perlombaan / Penilaian *
                </label>
                <input
                  type="text"
                  required
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  placeholder="Contoh: Prestasi Belajar Rapor / Munaqosyah Tartil"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nilai Rata-rata
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.nilaiAkhir}
                    onChange={(e) => setFormData({ ...formData, nilaiAkhir: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalTerbit}
                    onChange={(e) => setFormData({ ...formData, tanggalTerbit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Terbitkan Piagam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
