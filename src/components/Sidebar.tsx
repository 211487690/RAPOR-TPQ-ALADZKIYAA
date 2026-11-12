import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  Users,
  Building2,
  Sliders,
  BookmarkCheck,
  ClipboardPen,
  ArrowUpCircle,
  GraduationCap,
  FileText,
  Award,
  MessageSquare,
  User,
  Database,
  Settings,
  X
} from 'lucide-react';
import { UserSession, LembagaProfile } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserSession;
  lembaga: LembagaProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  lembaga,
  isOpen,
  onClose
}) => {
  const role = user.role;

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard, roles: ['admin', 'kepala', 'ustadz'] },
        { id: 'profil_santri', label: 'Profil Santri', icon: User, roles: ['admin', 'santri', 'ustadz'] },
        { id: 'chat', label: 'Pesan Internal', icon: MessageSquare, roles: ['admin', 'kepala', 'ustadz'] }
      ]
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'tahun_semester', label: 'Tahun & Semester', icon: CalendarDays, roles: ['admin', 'kepala'] },
        { id: 'ustadz', label: 'Ustadz / Ustadzah', icon: UserCheck, roles: ['admin', 'kepala'] },
        { id: 'santri', label: 'Data Santri', icon: Users, roles: ['admin', 'kepala', 'ustadz'] },
        { id: 'kelas', label: 'Kelas / Halaqoh', icon: Building2, roles: ['admin', 'kepala', 'ustadz'] },
        { id: 'metode_jilid', label: 'Metode & Jilid', icon: BookmarkCheck, roles: ['admin', 'kepala'] },
        { id: 'komponen_nilai', label: 'Komponen Nilai', icon: Sliders, roles: ['admin', 'kepala'] }
      ]
    },
    {
      title: 'PENILAIAN & AKADEMIK',
      items: [
        { id: 'isi_nilai', label: 'Isi Nilai Santri', icon: ClipboardPen, roles: ['admin', 'ustadz'] },
        { id: 'kumpulan_nilai', label: 'Leger & Ranking Nilai', icon: Award, roles: ['admin', 'kepala', 'ustadz'] },
        { id: 'kenaikan_jilid', label: 'Kenaikan Jilid', icon: ArrowUpCircle, roles: ['admin', 'ustadz'] },
        { id: 'kenaikan_kelas', label: 'Kenaikan Kelas', icon: GraduationCap, roles: ['admin', 'kepala'] }
      ]
    },
    {
      title: 'DOKUMEN & CETAK',
      items: [
        { id: 'cetak_rapor', label: 'Cetak Rapor Santri', icon: FileText, roles: ['admin', 'kepala', 'ustadz', 'santri'] },
        { id: 'cetak_piagam', label: 'Piagam Penghargaan', icon: Award, roles: ['admin', 'kepala', 'ustadz'] }
      ]
    },
    {
      title: 'SISTEM',
      items: [
        { id: 'backup', label: 'Cadangan & Paket ZIP', icon: Database, roles: ['admin', 'kepala', 'ustadz'] },
        { id: 'pengaturan', label: 'Pengaturan TPQ', icon: Settings, roles: ['admin', 'kepala', 'ustadz'] }
      ]
    }
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel - Fixed and Static on desktop with independent vertical scroll */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col shrink-0 lg:top-14 lg:bottom-0 lg:left-0 lg:z-20 transition-transform duration-200 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header (Displayed in mobile slide-out drawer) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900 lg:hidden">
          <div className="flex items-center gap-3">
            <img
              src={lembaga.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
              alt="Logo TPQ"
              className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <h1 className="font-bold text-sm leading-tight text-white truncate">
                {lembaga.nama}
              </h1>
              <p className="text-xs text-emerald-400 font-medium tracking-wide truncate">
                Sistem Rapor Digital
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links with Dedicated Vertical Scrolling, Enlarged Fonts, and Generous Spacing */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8">
          {menuSections.map((section, idx) => {
            const visibleItems = section.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                <div className="px-4 text-[11px] font-extrabold uppercase tracking-widest text-emerald-400/90 mb-2.5">
                  {section.title}
                </div>
                <div className="space-y-1.5">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-[15px] font-medium rounded-xl transition-all text-left ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md font-semibold'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate leading-snug">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer Badge - Always pinned at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 text-center text-xs text-slate-400 shrink-0">
          <div className="font-bold text-slate-100 text-sm truncate">TPQ Al-Adzkiyaa’</div>
          <div className="text-xs text-slate-400 truncate mt-0.5">Singosari · Kab. Malang</div>
        </div>
      </aside>
    </>
  );
};
