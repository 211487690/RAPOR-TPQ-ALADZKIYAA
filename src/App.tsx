/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LembagaProfile,
  AppSettings,
  TahunPelajaran,
  Ustadz,
  Kelas,
  Santri,
  MetodePembelajaran,
  KomponenPenilaian,
  PredikatRule,
  NilaiSantri,
  CatatanRapor,
  EvaluasiKenaikanJilid,
  RiwayatKenaikanKelas,
  PiagamJuara,
  InternalChat,
  UserSession
} from './types';
import { ShieldCheck, CheckCircle2, Printer, X } from 'lucide-react';
import { storageService } from './services/storageService';
import { zipPackageService } from './services/zipPackageService';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { NotificationModal } from './components/NotificationModal';
import { ChatModal } from './components/ChatModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { SantriView } from './views/SantriView';
import { UstadzView } from './views/UstadzView';
import { KelasView } from './views/KelasView';
import { TahunSemesterView } from './views/TahunSemesterView';
import { KomponenNilaiView } from './views/KomponenNilaiView';
import { MetodeJilidView } from './views/MetodeJilidView';
import { IsiNilaiView } from './views/IsiNilaiView';
import { KenaikanJilidView } from './views/KenaikanJilidView';
import { KenaikanKelasView } from './views/KenaikanKelasView';
import { CetakRaporView } from './views/CetakRaporView';
import { CetakPiagamView } from './views/CetakPiagamView';
import { KumpulanNilaiView } from './views/KumpulanNilaiView';
import { SantriPortalView } from './views/SantriPortalView';
import { PengaturanView } from './views/PengaturanView';

export default function App() {
  // Session State
  const [userSession, setUserSession] = useState<UserSession | null>(() => storageService.getUserSession());

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedSantriRaporId, setSelectedSantriRaporId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [qrVerificationData, setQrVerificationData] = useState<{
    nis: string;
    tahun?: string;
    semester?: string;
  } | null>(null);

  // Data Store States
  const [lembaga, setLembaga] = useState<LembagaProfile>(() => storageService.getLembagaProfile());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getAppSettings());
  const [tahunList, setTahunList] = useState<TahunPelajaran[]>(() => storageService.getTahunList());
  const [ustadzList, setUstadzList] = useState<Ustadz[]>(() => storageService.getUstadzList());
  const [kelasList, setKelasList] = useState<Kelas[]>(() => storageService.getKelasList());
  const [santriList, setSantriList] = useState<Santri[]>(() => storageService.getSantriList());
  const [metodeList, setMetodeList] = useState<MetodePembelajaran[]>(() => storageService.getMetodeList());
  const [komponenList, setKomponenList] = useState<KomponenPenilaian[]>(() => storageService.getKomponenList());
  const [predikatList, setPredikatList] = useState<PredikatRule[]>(() => storageService.getPredikatList());
  const [nilaiList, setNilaiList] = useState<NilaiSantri[]>(() => storageService.getNilaiList());
  const [catatanRaporList, setCatatanRaporList] = useState<CatatanRapor[]>(() => storageService.getCatatanRaporList());
  const [evaluasiJilidList, setEvaluasiJilidList] = useState<EvaluasiKenaikanJilid[]>(() => storageService.getEvaluasiJilidList());
  const [riwayatKenaikanKelas, setRiwayatKenaikanKelas] = useState<RiwayatKenaikanKelas[]>(() => storageService.getRiwayatKenaikanKelas());
  const [piagamList, setPiagamList] = useState<PiagamJuara[]>(() => storageService.getPiagamList());
  const [chatList, setChatList] = useState<InternalChat[]>(() => storageService.getChatList());

  // Listen to cross-component data updates
  useEffect(() => {
    const handleUpdate = () => {
      setLembaga(storageService.getLembagaProfile());
      setSettings(storageService.getAppSettings());
      setTahunList(storageService.getTahunList());
      setUstadzList(storageService.getUstadzList());
      setKelasList(storageService.getKelasList());
      setSantriList(storageService.getSantriList());
      setMetodeList(storageService.getMetodeList());
      setKomponenList(storageService.getKomponenList());
      setPredikatList(storageService.getPredikatList());
      setNilaiList(storageService.getNilaiList());
      setCatatanRaporList(storageService.getCatatanRaporList());
      setEvaluasiJilidList(storageService.getEvaluasiJilidList());
      setRiwayatKenaikanKelas(storageService.getRiwayatKenaikanKelas());
      setPiagamList(storageService.getPiagamList());
      setChatList(storageService.getChatList());
    };
    window.addEventListener('tpq_data_updated', handleUpdate);
    return () => window.removeEventListener('tpq_data_updated', handleUpdate);
  }, []);

  // Check URL parameters for QR Code verification
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verify') === 'rapor' || params.get('validasi') === 'rapor') {
        const nis = params.get('nis') || '';
        const th = params.get('th') || '';
        const sm = params.get('sm') || '';
        if (nis) {
          setQrVerificationData({ nis, tahun: th, semester: sm });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Set initial view based on role
  useEffect(() => {
    if (userSession?.role === 'santri') {
      setCurrentView('profil_santri');
    }
  }, [userSession]);

  const activeTahun = tahunList.find(t => t.isAktif) || tahunList[0];

  // Auth Handlers
  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    storageService.saveUserSession(session);
    if (session.role === 'santri') {
      setCurrentView('profil_santri');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    storageService.saveUserSession(null);
    setCurrentView('dashboard');
  };

  // Chat message send handler
  const handleSendMessage = (msg: string, recipientId: string, recipientName: string) => {
    if (!userSession) return;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newChat: InternalChat = {
      id: `chat-${Date.now()}`,
      senderId: userSession.id,
      senderName: userSession.nama,
      senderRole: (userSession.role === 'santri' ? 'ustadz' : userSession.role) as any,
      recipientId,
      recipientName,
      message: msg,
      timestamp: timeStr,
      isRead: false
    };

    const updated = [...chatList, newChat];
    setChatList(updated);
    storageService.saveChatList(updated);
  };

  // Kenaikan Jilid Handler
  const handleSaveEvaluasi = (evaluasi: EvaluasiKenaikanJilid, updateSantriJilid = false) => {
    const updatedEval = [...evaluasiJilidList, evaluasi];
    setEvaluasiJilidList(updatedEval);
    storageService.saveEvaluasiJilidList(updatedEval);

    if (updateSantriJilid) {
      const updatedSantri = santriList.map(s => {
        if (s.id === evaluasi.santriId) {
          return { ...s, jilidId: evaluasi.keJilidId };
        }
        return s;
      });
      setSantriList(updatedSantri);
      storageService.saveSantriList(updatedSantri);
    }
  };

  // Kenaikan Kelas Handler
  const handleExecutePromotion = (
    promotions: {
      santriId: string;
      dariKelasId: string;
      keKelasId: string;
      status: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah';
      catatan: string;
    }[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecords: RiwayatKenaikanKelas[] = promotions.map((p, idx) => ({
      id: `rk-${Date.now()}-${idx}`,
      santriId: p.santriId,
      dariKelasId: p.dariKelasId,
      keKelasId: p.keKelasId,
      tahunAjaran: activeTahun.tahun,
      status: p.status,
      catatan: p.catatan,
      tanggal: today
    }));

    const updatedRiwayat = [...riwayatKenaikanKelas, ...newRecords];
    setRiwayatKenaikanKelas(updatedRiwayat);
    storageService.saveRiwayatKenaikanKelas(updatedRiwayat);

    // Update students' classes and statuses
    const updatedSantri = santriList.map(s => {
      const match = promotions.find(p => p.santriId === s.id);
      if (match) {
        return {
          ...s,
          kelasId: match.keKelasId,
          status: match.status === 'Lulus' ? 'lulus' : match.status === 'Pindah' ? 'pindah' : s.status
        };
      }
      return s;
    });

    setSantriList(updatedSantri);
    storageService.saveSantriList(updatedSantri);
  };

  // Save Batch Grades
  const handleSaveNilaiBatch = (entries: NilaiSantri[], catatanList?: CatatanRapor[]) => {
    const updatedNilai = [...nilaiList];
    entries.forEach(newEntry => {
      const idx = updatedNilai.findIndex(
        n =>
          n.santriId === newEntry.santriId &&
          n.komponenId === newEntry.komponenId &&
          n.tahunId === newEntry.tahunId &&
          n.semester === newEntry.semester
      );
      if (idx >= 0) {
        updatedNilai[idx] = newEntry;
      } else {
        updatedNilai.push(newEntry);
      }
    });

    setNilaiList(updatedNilai);
    storageService.saveNilaiList(updatedNilai);

    if (catatanList && catatanList.length > 0) {
      const updatedCatatan = [...catatanRaporList];
      catatanList.forEach(c => {
        const idx = updatedCatatan.findIndex(
          item => item.santriId === c.santriId && item.tahunId === c.tahunId && item.semester === c.semester
        );
        if (idx >= 0) {
          updatedCatatan[idx] = c;
        } else {
          updatedCatatan.push(c);
        }
      });
      setCatatanRaporList(updatedCatatan);
      storageService.saveCatatanRaporList(updatedCatatan);
    }
  };

  // Quick assign / move santri to class
  const handleAssignSantriKelas = (santriId: string, targetKelasId: string) => {
    const updated = santriList.map(s => {
      if (s.id === santriId) {
        return { ...s, kelasId: targetKelasId };
      }
      return s;
    });
    setSantriList(updated);
    storageService.saveSantriList(updated);
  };

  // Reset database handler
  const handleResetDatabase = () => {
    storageService.resetToDefault();
    window.location.reload();
  };

  // If not logged in, render clean LoginView
  if (!userSession) {
    return (
      <LoginView
        lembaga={lembaga}
        ustadzList={ustadzList}
        santriList={santriList}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Calculate unread count for chat and notifications
  const unreadChatCount = chatList.filter(c => !c.isRead && c.recipientId !== userSession.id).length;
  const activeSantriCount = santriList.filter(s => s.status === 'aktif').length;
  const evaluatedSantriIds = new Set(
    nilaiList
      .filter(n => n.tahunId === activeTahun.id && n.semester === activeTahun.semesterAktif)
      .map(n => n.santriId)
  );
  const unreadNotifCount = Math.max(0, activeSantriCount - evaluatedSantriIds.size);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header */}
      <div className="no-print">
        <Header
          user={userSession}
          lembaga={lembaga}
          unreadChatCount={unreadChatCount}
          unreadNotifCount={unreadNotifCount}
          onOpenChat={() => setIsChatModalOpen(true)}
          onOpenNotif={() => setIsNotifModalOpen(true)}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      <div className="flex-1 flex relative min-h-0">
        {/* Navigation Sidebar (Fixed & Static on desktop, drawer on mobile) */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'chat') {
              setIsChatModalOpen(true);
            } else {
              setCurrentView(view);
            }
          }}
          user={userSession}
          lembaga={lembaga}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Column: Offset on desktop by lg:pl-72 so the fixed sidebar never overlaps content */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* View Routing */}
          {currentView === 'dashboard' && (
            <DashboardView
              lembaga={lembaga}
              tahunAktif={activeTahun}
              santriList={santriList}
              ustadzList={ustadzList}
              kelasList={kelasList}
              nilaiList={nilaiList}
              evaluasiJilidList={evaluasiJilidList}
              riwayatKenaikanKelas={riwayatKenaikanKelas}
              metodeList={metodeList}
              onNavigate={(v) => setCurrentView(v)}
              onDownloadZip={() => setCurrentView('backup')}
            />
          )}

          {currentView === 'santri' && (
            <SantriView
              santriList={santriList}
              kelasList={kelasList}
              metodeList={metodeList}
              onSaveSantri={(s) => {
                const idx = santriList.findIndex(item => item.id === s.id);
                const updated = idx >= 0
                  ? santriList.map(item => item.id === s.id ? s : item)
                  : [...santriList, s];
                setSantriList(updated);
                storageService.saveSantriList(updated);
              }}
              onDeleteSantri={(id) => {
                const updated = santriList.filter(item => item.id !== id);
                setSantriList(updated);
                storageService.saveSantriList(updated);
              }}
              onBulkImport={(newList) => {
                const updated = [...santriList, ...newList];
                setSantriList(updated);
                storageService.saveSantriList(updated);
              }}
            />
          )}

          {currentView === 'ustadz' && (
            <UstadzView
              ustadzList={ustadzList}
              kelasList={kelasList}
              onSaveUstadz={(u) => {
                const idx = ustadzList.findIndex(item => item.id === u.id);
                const updated = idx >= 0
                  ? ustadzList.map(item => item.id === u.id ? u : item)
                  : [...ustadzList, u];
                setUstadzList(updated);
                storageService.saveUstadzList(updated);
              }}
              onDeleteUstadz={(id) => {
                const updated = ustadzList.filter(item => item.id !== id);
                setUstadzList(updated);
                storageService.saveUstadzList(updated);
              }}
            />
          )}

          {currentView === 'kelas' && (
            <KelasView
              kelasList={kelasList}
              ustadzList={ustadzList}
              santriList={santriList}
              onSaveKelas={(k) => {
                const idx = kelasList.findIndex(item => item.id === k.id);
                const updated = idx >= 0
                  ? kelasList.map(item => item.id === k.id ? k : item)
                  : [...kelasList, k];
                setKelasList(updated);
                storageService.saveKelasList(updated);
              }}
              onDeleteKelas={(id) => {
                const updated = kelasList.filter(item => item.id !== id);
                setKelasList(updated);
                storageService.saveKelasList(updated);
              }}
              onAssignSantri={handleAssignSantriKelas}
            />
          )}

          {currentView === 'tahun_semester' && (
            <TahunSemesterView
              tahunList={tahunList}
              onSaveTahun={(t) => {
                const idx = tahunList.findIndex(item => item.id === t.id);
                const updated = idx >= 0
                  ? tahunList.map(item => item.id === t.id ? t : item)
                  : [...tahunList, t];
                setTahunList(updated);
                storageService.saveTahunList(updated);
              }}
              onSetActiveTahun={(id, sem) => {
                const updated = tahunList.map(t => ({
                  ...t,
                  isAktif: t.id === id,
                  semesterAktif: t.id === id ? sem : t.semesterAktif
                }));
                setTahunList(updated);
                storageService.saveTahunList(updated);
              }}
              onToggleLock={(id) => {
                const updated = tahunList.map(t => t.id === id ? { ...t, isLocked: !t.isLocked } : t);
                setTahunList(updated);
                storageService.saveTahunList(updated);
              }}
              onDeleteTahun={(id) => {
                const updated = tahunList.filter(item => item.id !== id);
                setTahunList(updated);
                storageService.saveTahunList(updated);
              }}
            />
          )}

          {currentView === 'komponen_nilai' && (
            <KomponenNilaiView
              komponenList={komponenList}
              predikatList={predikatList}
              onSaveKomponen={(k) => {
                const idx = komponenList.findIndex(item => item.id === k.id);
                const updated = idx >= 0
                  ? komponenList.map(item => item.id === k.id ? k : item)
                  : [...komponenList, k];
                setKomponenList(updated);
                storageService.saveKomponenList(updated);
              }}
              onDeleteKomponen={(id) => {
                const updated = komponenList.filter(item => item.id !== id);
                setKomponenList(updated);
                storageService.saveKomponenList(updated);
              }}
              onSavePredikat={(p) => {
                const idx = predikatList.findIndex(item => item.id === p.id);
                const updated = idx >= 0
                  ? predikatList.map(item => item.id === p.id ? p : item)
                  : [...predikatList, p];
                setPredikatList(updated);
                storageService.savePredikatList(updated);
              }}
              onDeletePredikat={(id) => {
                const updated = predikatList.filter(item => item.id !== id);
                setPredikatList(updated);
                storageService.savePredikatList(updated);
              }}
            />
          )}

          {currentView === 'metode_jilid' && (
            <MetodeJilidView
              metodeList={metodeList}
              onSaveMetode={(m) => {
                const idx = metodeList.findIndex(item => item.id === m.id);
                const updated = idx >= 0
                  ? metodeList.map(item => item.id === m.id ? m : item)
                  : [...metodeList, m];
                setMetodeList(updated);
                storageService.saveMetodeList(updated);
              }}
              onDeleteMetode={(id) => {
                const updated = metodeList.filter(item => item.id !== id);
                setMetodeList(updated);
                storageService.saveMetodeList(updated);
              }}
            />
          )}

          {currentView === 'isi_nilai' && (
            <IsiNilaiView
              tahunList={tahunList}
              activeTahun={activeTahun}
              kelasList={kelasList}
              santriList={santriList}
              komponenList={komponenList}
              predikatList={predikatList}
              nilaiList={nilaiList}
              catatanRaporList={catatanRaporList}
              currentUser={userSession}
              onSaveNilaiBatch={handleSaveNilaiBatch}
            />
          )}

          {currentView === 'kenaikan_jilid' && (
            <KenaikanJilidView
              santriList={santriList}
              metodeList={metodeList}
              ustadzList={ustadzList}
              evaluasiJilidList={evaluasiJilidList}
              onSaveEvaluasi={handleSaveEvaluasi}
            />
          )}

          {currentView === 'kenaikan_kelas' && (
            <KenaikanKelasView
              kelasList={kelasList}
              santriList={santriList}
              activeTahun={activeTahun}
              riwayatList={riwayatKenaikanKelas}
              onExecutePromotion={handleExecutePromotion}
            />
          )}

          {currentView === 'kumpulan_nilai' && (
            <KumpulanNilaiView
              lembaga={lembaga}
              tahunList={tahunList}
              activeTahun={activeTahun}
              kelasList={kelasList}
              santriList={santriList}
              ustadzList={ustadzList}
              komponenList={komponenList}
              predikatList={predikatList}
              onNavigateToRapor={(sId) => {
                setSelectedSantriRaporId(sId);
                setCurrentView('cetak_rapor');
              }}
              onNavigateToPiagam={() => setCurrentView('cetak_piagam')}
            />
          )}

          {currentView === 'cetak_rapor' && (
            <CetakRaporView
              lembaga={lembaga}
              tahunList={tahunList}
              activeTahun={activeTahun}
              kelasList={kelasList}
              santriList={santriList}
              ustadzList={ustadzList}
              metodeList={metodeList}
              catatanRaporList={catatanRaporList}
              initialSantriId={selectedSantriRaporId}
            />
          )}

          {currentView === 'cetak_piagam' && (
            <CetakPiagamView
              lembaga={lembaga}
              tahunList={tahunList}
              activeTahun={activeTahun}
              kelasList={kelasList}
              santriList={santriList}
              piagamList={piagamList}
              onSavePiagam={(p) => {
                const idx = piagamList.findIndex(item => item.id === p.id);
                const updated = idx >= 0
                  ? piagamList.map(item => item.id === p.id ? p : item)
                  : [...piagamList, p];
                setPiagamList(updated);
                storageService.savePiagamList(updated);
              }}
              onDeletePiagam={(id) => {
                const updated = piagamList.filter(item => item.id !== id);
                setPiagamList(updated);
                storageService.savePiagamList(updated);
              }}
            />
          )}

          {currentView === 'profil_santri' && (
            <SantriPortalView
              currentUser={userSession}
              santriList={santriList}
              kelasList={kelasList}
              metodeList={metodeList}
              activeTahun={activeTahun}
              evaluasiJilidList={evaluasiJilidList}
              piagamList={piagamList}
              komponenList={komponenList}
              onNavigateToRapor={() => setCurrentView('cetak_rapor')}
            />
          )}

          {currentView === 'pengaturan' && (
            <PengaturanView
              initialTab="lembaga"
              lembaga={lembaga}
              settings={settings}
              ustadzList={ustadzList}
              onSaveLembaga={(p) => {
                setLembaga(p);
                storageService.saveLembagaProfile(p);
              }}
              onSaveSettings={(s) => {
                setSettings(s);
                storageService.saveAppSettings(s);
              }}
              onSaveUstadzList={(uList) => {
                setUstadzList(uList);
                storageService.saveUstadzList(uList);
              }}
              onResetDatabase={handleResetDatabase}
            />
          )}

          {currentView === 'backup' && (
            <PengaturanView
              initialTab="backup"
              lembaga={lembaga}
              settings={settings}
              ustadzList={ustadzList}
              onSaveLembaga={(p) => {
                setLembaga(p);
                storageService.saveLembagaProfile(p);
              }}
              onSaveSettings={(s) => {
                setSettings(s);
                storageService.saveAppSettings(s);
              }}
              onSaveUstadzList={(uList) => {
                setUstadzList(uList);
                storageService.saveUstadzList(uList);
              }}
              onResetDatabase={handleResetDatabase}
            />
          )}
        </main>

          {/* Global Footnote aligned within the main content column */}
          <Footer footnote={lembaga.footnote} />
        </div>
      </div>

      {/* Global Notifications Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        santriList={santriList}
        nilaiList={nilaiList}
        activeTahun={activeTahun}
        onNavigateToGrades={() => setCurrentView('isi_nilai')}
        onNavigateToSantri={() => setCurrentView('santri')}
      />

      {/* Global Internal Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUser={userSession}
        chatList={chatList}
        ustadzList={ustadzList}
        onSendMessage={handleSendMessage}
      />

      {/* Digital QR Validation Verification Modal */}
      {qrVerificationData && (() => {
        const verifiedSantri = santriList.find(s => s.nis === qrVerificationData.nis);
        const verifiedKelas = verifiedSantri ? kelasList.find(k => k.id === verifiedSantri.kelasId) : null;
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setQrVerificationData(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Validasi QR Rapor Resmi
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Verifikasi Keaslian Dokumen Rapor
                  </h3>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 mb-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">DOKUMEN DINYATAKAN ASLI &amp; TERCATAT RESMI</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Diterbitkan oleh {lembaga.nama} ({lembaga.yayasan})
                  </p>
                </div>
              </div>

              {verifiedSantri ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Nama Santri:</span>
                    <strong className="text-slate-900 font-bold">{verifiedSantri.namaLengkap}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Nomor Induk Santri (NIS):</span>
                    <span className="font-mono font-semibold text-slate-800">{verifiedSantri.nis}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Kelas / Halaqoh:</span>
                    <span className="font-medium text-slate-800">{verifiedKelas?.namaKelas || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Tahun Pelajaran:</span>
                    <span className="font-semibold text-slate-800">{qrVerificationData.tahun || activeTahun.tahun}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Semester:</span>
                    <span className="font-semibold text-slate-800">{qrVerificationData.semester || activeTahun.semesterAktif}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  Santri dengan NIS <strong className="font-mono">{qrVerificationData.nis}</strong> terverifikasi pada sistem {lembaga.nama}.
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => {
                    setQrVerificationData(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
                {verifiedSantri && (
                  <button
                    onClick={() => {
                      setSelectedSantriRaporId(verifiedSantri.id);
                      setCurrentView('cetak_rapor');
                      setQrVerificationData(null);
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Buka Lembar Rapor</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
