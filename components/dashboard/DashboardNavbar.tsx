'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function DashboardNavbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">

      {/* 로고 — 독립된 플로팅 버튼 */}
      <a
        href="/"
        className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md text-white no-underline hover:bg-white/[0.1] transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
      >
        <img src="/nailart.png" alt="Nailart AI" className="w-6 h-6 rounded-md object-contain" />
        <span className="text-sm font-bold tracking-tight">Nailart AI</span>
      </a>

      {/* 프로필 팝오버 — 독립된 플로팅 버튼 */}
      <div className="pointer-events-auto relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md hover:bg-white/[0.1] transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.3)] cursor-pointer"
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <User size={14} className="text-white/70" />
            </div>
          )}
          <span className="text-sm text-white/80 font-medium max-w-[120px] truncate">
            {user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email}
          </span>
        </button>

        {/* 팝오버 */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#1a1a1a] border border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-white truncate">
                {user?.user_metadata?.full_name ?? '사용자'}
              </p>
              <p className="text-xs text-white/40 truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-150 cursor-pointer border-0 bg-transparent text-left"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
