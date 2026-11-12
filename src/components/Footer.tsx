import React from 'react';

interface FooterProps {
  footnote?: string;
}

export const Footer: React.FC<FooterProps> = ({ footnote }) => {
  return (
    <footer className="no-print mt-auto py-3 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <span className="font-medium text-slate-600">
          RAPOR TPQ AL-ADZKIYAA’ · Sistem Informasi Rapor Terpadu
        </span>
        <span className="text-slate-500">
          {footnote || 'Copyright © Umar Izzularab 2026 All Rights Reserved'}
        </span>
      </div>
    </footer>
  );
};
