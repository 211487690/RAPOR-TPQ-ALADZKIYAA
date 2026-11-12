import React from 'react';
import { LogOut, Bell, MessageSquare, Shield, GraduationCap, UserCheck, Menu } from 'lucide-react';
import { UserSession, LembagaProfile } from '../types';

interface HeaderProps {
  user: UserSession;
  lembaga: LembagaProfile;
  unreadChatCount: number;
  unreadNotifCount: number;
  onOpenChat: () => void;
  onOpenNotif: () => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lembaga,
  unreadChatCount,
  unreadNotifCount,
  onOpenChat,
  onOpenNotif,
  onLogout,
  onToggleSidebar
}) => {
  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'kepala':
        return <UserCheck className="w-4 h-4 text-teal-600" />;
      case 'ustadz':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'santri':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'admin':
        return 'Administrator TPQ';
      case 'kepala':
        return 'Kepala / Pengasuh TPQ';
      case 'ustadz':
        return 'Ustadz / Ustadzah';
      case 'santri':
        return 'Santri TPQ';
      default:
        return user.role;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 h-14 flex items-center transition-all">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left: Mobile Toggle & Institution Sub-Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 truncate">
            <img
              src={lembaga.logoUrl || '/assets/aistudio/LOGO_TPQ_AL_ADZKIYAA__3D_a517a7be.png'}
              alt="Logo TPQ"
              className="w-8 h-8 object-contain shrink-0 rounded"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // styled svg fallback if needed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="truncate hidden sm:block">
              <span className="font-bold text-slate-900 tracking-tight text-sm block truncate">
                {lembaga.nama}
              </span>
              <span className="text-xs text-slate-500 block truncate">
                {lembaga.yayasan}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Chat, Notifications & Clean Unclipped User Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Internal Chat Button */}
          <button
            onClick={onOpenChat}
            className="relative p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Pesan Internal / Koordinasi"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Internal Notifications Button */}
          <button
            onClick={onOpenNotif}
            className="relative p-2 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
            title="Pemberitahuan Sistem & Kelengkapan Data"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* User Profile Card: Designed with generous space and no overlap */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div
                className="text-sm font-semibold text-slate-900 max-w-[200px] truncate"
                title={user.nama}
              >
                {user.nama}
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>
            </div>

            {/* Logout Button: Clear, distinct, never overlaps with the user's name */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 shrink-0"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
