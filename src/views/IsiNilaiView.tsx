import React, { useState } from 'react';
import {
  ClipboardPen,
  Save,
  CheckCircle2,
  AlertCircle,
  Filter,
  Users,
  Search,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import {
  TahunPelajaran,
  Kelas,
  Santri,
  KomponenPenilaian,
  NilaiSantri,
  PredikatRule,
  CatatanRapor,
  UserSession
} from '../types';

interface IsiNilaiViewProps {
  tahunList: TahunPelajaran[];
  activeTahun: TahunPelajaran;
  kelasList: Kelas[];
  santriList: Santri[];
  komponenList: KomponenPenilaian[];
  predikatList: PredikatRule[];
  nilaiList: NilaiSantri[];
  catatanRaporList: CatatanRapor[];
  currentUser: UserSession;
  onSaveNilaiBatch: (entries: NilaiSantri[], catatanList?: CatatanRapor[]) => void;
}

export const IsiNilaiView: React.FC<IsiNilaiViewProps> = ({
  tahunList,
  activeTahun,
  kelasList,
  santriList,
  komponenList,
  predikatList,
  nilaiList,
  catatanRaporList,
  currentUser,
  onSaveNilaiBatch
}) => {
  const [selectedTahunId, setSelectedTahunId] = useState(activeTahun.id);
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>(activeTahun.semesterAktif);
  const [selectedKelasId, setSelectedKelasId] = useState(kelasList[0]?.id || '');
  const [inputMode, setInputMode] = useState<'massal' | 'satuan'>('massal');
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');
  const [filterBelumDinilaiOnly, setFilterBelumDinilaiOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Local draft states for mass input
  // Map of `${santriId}_${komponenId}` -> { nilai: number, catatan: string }
  const [massScoreDraft, setMassScoreDraft] = useState<Record<string, { nilai: string; catatan: string }>>({});
  const [catatanWaliDraft, setCatatanWaliDraft] = useState<Record<string, string>>({});

  // Active komponen list
  const activeKomponen = komponenList.filter(k => k.isAktif).sort((a, b) => a.urutan - b.urutan);

  // Active santri in chosen class
  const classSantri = santriList.filter(s => s.kelasId === selectedKelasId && s.status === 'aktif');

  // Compute which santri has scores
  const getSantriEvaluatedStatus = (sId: string) => {
    return nilaiList.some(
      n => n.santriId === sId && n.tahunId === selectedTahunId && n.semester === selectedSemester
    );
  };

  const filteredClassSantri = classSantri.filter(s => {
    const matchSearch = s.namaLengkap.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    const hasScores = getSantriEvaluatedStatus(s.id);
    if (filterBelumDinilaiOnly && hasScores) return false;
    return matchSearch;
  });

  // Get current stored score or draft
  const getScoreValue = (santriId: string, komponenId: string) => {
    const key = `${santriId}_${komponenId}`;
    if (massScoreDraft[key] !== undefined) {
      return massScoreDraft[key].nilai;
    }
    const found = nilaiList.find(
      n => n.santriId === santriId && n.tahunId === selectedTahunId && n.semester === selectedSemester && n.komponenId === komponenId
    );
    return found ? String(found.nilaiAngka) : '';
  };

  const getScoreNote = (santriId: string, komponenId: string) => {
    const key = `${santriId}_${komponenId}`;
    if (massScoreDraft[key] !== undefined) {
      return massScoreDraft[key].catatan;
    }
    const found = nilaiList.find(
      n => n.santriId === santriId && n.tahunId === selectedTahunId && n.semester === selectedSemester && n.komponenId === komponenId
    );
    return found ? found.catatan || '' : '';
  };

  const handleScoreChange = (santriId: string, komponenId: string, val: string) => {
    const key = `${santriId}_${komponenId}`;
    const prev = massScoreDraft[key] || { nilai: '', catatan: getScoreNote(santriId, komponenId) };
    setMassScoreDraft({
      ...massScoreDraft,
      [key]: { ...prev, nilai: val }
    });
  };

  const handleNoteChange = (santriId: string, komponenId: string, note: string) => {
    const key = `${santriId}_${komponenId}`;
    const prev = massScoreDraft[key] || { nilai: getScoreValue(santriId, komponenId), catatan: '' };
    setMassScoreDraft({
      ...massScoreDraft,
      [key]: { ...prev, catatan: note }
    });
  };

  const getCatatanWali = (santriId: string) => {
    if (catatanWaliDraft[santriId] !== undefined) {
      return catatanWaliDraft[santriId];
    }
    const found = catatanRaporList.find(
      c => c.santriId === santriId && c.tahunId === selectedTahunId && c.semester === selectedSemester
    );
    return found ? found.catatanWali : '';
  };

  const handleCatatanWaliChange = (santriId: string, text: string) => {
    setCatatanWaliDraft({
      ...catatanWaliDraft,
      [santriId]: text
    });
  };

  // Save Massal
  const handleSaveMassal = () => {
    const newNilaiEntries: NilaiSantri[] = [];
    const updatedCatatanList: CatatanRapor[] = [];

    classSantri.forEach(santri => {
      activeKomponen.forEach(comp => {
        const key = `${santri.id}_${comp.id}`;
        const valStr = massScoreDraft[key]?.nilai !== undefined ? massScoreDraft[key].nilai : getScoreValue(santri.id, comp.id);
        const noteStr = massScoreDraft[key]?.catatan !== undefined ? massScoreDraft[key].catatan : getScoreNote(santri.id, comp.id);

        if (valStr !== '' && !isNaN(Number(valStr))) {
          const num = Math.min(100, Math.max(0, Number(valStr)));
          newNilaiEntries.push({
            id: `n-${santri.id}-${comp.id}-${selectedTahunId}-${selectedSemester}`,
            santriId: santri.id,
            tahunId: selectedTahunId,
            semester: selectedSemester,
            komponenId: comp.id,
            nilaiAngka: num,
            catatan: noteStr,
            tanggalInput: new Date().toISOString().split('T')[0],
            ustadzId: currentUser.id
          });
        }
      });

      // Save Catatan Wali
      const noteWali = catatanWaliDraft[santri.id] !== undefined ? catatanWaliDraft[santri.id] : getCatatanWali(santri.id);
      const existingNote = catatanRaporList.find(
        c => c.santriId === santri.id && c.tahunId === selectedTahunId && c.semester === selectedSemester
      );
      updatedCatatanList.push({
        id: existingNote ? existingNote.id : `cr-${santri.id}-${selectedTahunId}-${selectedSemester}`,
        santriId: santri.id,
        tahunId: selectedTahunId,
        semester: selectedSemester,
        catatanWali: noteWali || 'Alhamdulillah santri rajin dan berprestasi.',
        catatanKepala: existingNote?.catatanKepala || 'Terus istiqomah dalam membaca dan mengamalkan Al-Qur\'an.',
        capaianHafalan: existingNote?.capaianHafalan || 'Sesuai kurikulum target jilid',
        capaianIbadah: existingNote?.capaianIbadah || 'Hafal bacaan sholat dan doa harian',
        sakit: existingNote?.sakit || 0,
        izin: existingNote?.izin || 0,
        tanpaKeterangan: existingNote?.tanpaKeterangan || 0,
        keputusanKenaikanKelas: existingNote?.keputusanKenaikanKelas || 'Belum Ditentukan'
      });
    });

    onSaveNilaiBatch(newNilaiEntries, updatedCatatanList);
    setSaveSuccessMsg('Seluruh nilai santri berhasil disimpan ke database!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Helper calculate predicate from number
  const getPredikatBadge = (num: number) => {
    if (isNaN(num) || num <= 0) return null;
    const rule = predikatList.find(p => num >= p.minScore && num <= p.maxScore);
    if (!rule) return null;
    return (
      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
        {rule.predikat}
      </span>
    );
  };

  const singleSantri = santriList.find(s => s.id === selectedSantriId);

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardPen className="w-5 h-5 text-emerald-600" />
            <span>Pengisian Nilai Hasil Belajar Santri</span>
          </h2>
          <p className="text-xs text-slate-500">
            Mendukung input massal per kelas &amp; per santri, auto-rekap bobot, dan validasi nilai
          </p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setInputMode('massal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              inputMode === 'massal'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Input Massal (Tabel Kelas)
          </button>
          <button
            onClick={() => setInputMode('satuan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              inputMode === 'satuan'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Input Per Santri
          </button>
        </div>
      </div>

      {/* Filter & Selector Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Tahun Pelajaran */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
            <select
              value={selectedTahunId}
              onChange={(e) => setSelectedTahunId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              {tahunList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.tahun} {t.isAktif ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
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

          {/* Kelas / Halaqoh */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kelas / Halaqoh</label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} ({k.tingkatan})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Filter Pending */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari santri di kelas ini..."
                className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterBelumDinilaiOnly}
                onChange={(e) => setFilterBelumDinilaiOnly(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Hanya santri belum dinilai</span>
            </label>
          </div>

          {/* Save Status / Button */}
          <div className="flex items-center gap-3">
            {saveSuccessMsg && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccessMsg}
              </span>
            )}
            <button
              onClick={handleSaveMassal}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua Nilai Kelas</span>
            </button>
          </div>
        </div>
      </div>

      {inputMode === 'massal' ? (
        /* Mass Table Input Mode */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 w-10">No</th>
                  <th className="px-3 py-3 min-w-[160px]">Nama Santri</th>
                  {activeKomponen.map(k => (
                    <th key={k.id} className="px-2 py-3 text-center min-w-[100px]">
                      <div>{k.nama}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Bobot {k.bobot}%</div>
                    </th>
                  ))}
                  <th className="px-3 py-3 min-w-[180px]">Catatan Perkembangan Ustadz</th>
                  <th className="px-3 py-3 text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassSantri.length === 0 ? (
                  <tr>
                    <td colSpan={3 + activeKomponen.length} className="text-center py-8 text-slate-400">
                      Tidak ada santri di kelas ini yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredClassSantri.map((santri, idx) => {
                    const isEvaluated = getSantriEvaluatedStatus(santri.id);

                    return (
                      <tr key={santri.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-900">{santri.namaLengkap}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIS: {santri.nis}</div>
                        </td>

                        {activeKomponen.map(comp => {
                          const val = getScoreValue(santri.id, comp.id);
                          const numVal = Number(val);

                          return (
                            <td key={comp.id} className="px-2 py-2 text-center">
                              <div className="inline-flex flex-col items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={val}
                                  onChange={(e) => handleScoreChange(santri.id, comp.id, e.target.value)}
                                  placeholder="0-100"
                                  className="w-16 px-1.5 py-1 text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums"
                                />
                                {getPredikatBadge(numVal)}
                              </div>
                            </td>
                          );
                        })}

                        {/* Catatan Ustadz */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={getCatatanWali(santri.id)}
                            onChange={(e) => handleCatatanWaliChange(santri.id, e.target.value)}
                            placeholder="Catatan perkembangan & motivasi santri..."
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none"
                          />
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2 text-center">
                          {isEvaluated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Terisi
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Belum
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Single Santri Input Mode */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Santri Selector List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Pilih Santri</h3>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {classSantri.map(s => {
                const isSelected = s.id === selectedSantriId;
                const isEvaluated = getSantriEvaluatedStatus(s.id);

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSantriId(s.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{s.namaLengkap}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        NIS: {s.nis}
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : isEvaluated
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isEvaluated ? 'Terisi' : 'Kosong'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Score Details */}
          <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            {singleSantri ? (
              <>
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{singleSantri.namaLengkap}</h3>
                    <p className="text-xs text-slate-500">
                      NIS: {singleSantri.nis} · Status: <span className="capitalize">{singleSantri.status}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleSaveMassal}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Nilai Santri Ini</span>
                  </button>
                </div>

                {/* Score Components Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {activeKomponen.map(comp => {
                    const scoreVal = getScoreValue(singleSantri.id, comp.id);
                    const noteVal = getScoreNote(singleSantri.id, comp.id);

                    return (
                      <div key={comp.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{comp.nama}</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Bobot {comp.bobot}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreVal}
                            onChange={(e) => handleScoreChange(singleSantri.id, comp.id, e.target.value)}
                            placeholder="Nilai (0-100)"
                            className="w-24 px-2 py-1 font-bold text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          />
                          {getPredikatBadge(Number(scoreVal))}
                        </div>
                        <input
                          type="text"
                          value={noteVal}
                          onChange={(e) => handleNoteChange(singleSantri.id, comp.id, e.target.value)}
                          placeholder="Catatan komponen..."
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Catatan Rapor Khusus Santri */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <label className="block font-semibold text-slate-700">
                    Catatan &amp; Motivasi Wali Kelas untuk Rapor
                  </label>
                  <textarea
                    rows={3}
                    value={getCatatanWali(singleSantri.id)}
                    onChange={(e) => handleCatatanWaliChange(singleSantri.id, e.target.value)}
                    placeholder="Tuliskan motivasi, perkembangan membaca, dan bimbingan akhlak..."
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Silakan pilih santri dari daftar di sebelah kiri.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
