'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Award,
  GraduationCap,
  Database,
  FileSpreadsheet,
  Bell,
  LogOut,
  School,
  Menu,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface CurrentUser {
  userId: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  fullName: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on admin login page, don't wrap with admin dashboard sidebar
  const isLoginPage = pathname === '/admin/login';

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(!isLoginPage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push('/admin/login');
          return;
        }
        setCurrentUser(data.user);
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loadingUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">กำลังตรวจสอบสิทธิ์เจ้าหน้าที่...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'ภาพรวม Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'จัดการข้อมูลผู้สมัคร', href: '/admin/applicants', icon: Users },
    { label: 'การคัดเลือกและโควตา', href: '/admin/selection', icon: Award },
    { label: 'ระบบมอบตัวนักศึกษา', href: '/admin/enrollment', icon: GraduationCap },
    { label: 'จัดการข้อมูลหลัก (Master)', href: '/admin/master-data', icon: Database },
    { label: 'ส่งออกข้อมูล (Excel/CSV)', href: '/admin/export', icon: FileSpreadsheet },
    { label: 'การแจ้งเตือน & ระบบ', href: '/admin/notifications', icon: Bell },
  ];

  const roleLabels: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
    ADMIN: { label: 'Admission Admin', color: 'bg-blue-100 text-blue-800' },
    STAFF: { label: 'Document Staff', color: 'bg-amber-100 text-amber-800' },
  };

  const userRoleMeta = currentUser ? roleLabels[currentUser.role] : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="โลโก้วิทยาลัย" className="w-7 h-7 object-contain" />
          <span className="font-semibold text-sm">ระบบเจ้าหน้าที่ วท.ท่าหลวงฯ</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-slate-800 no-print flex flex-col justify-between`}
      >
        <div className="p-5 space-y-6">
          {/* Brand */}
          <div className="hidden lg:flex items-center gap-3 pb-4 border-b border-slate-800">
            <img src="/logo.png" alt="โลโก้วิทยาลัย" className="w-10 h-10 object-contain shrink-0" />
            <div>
              <h2 className="font-display font-bold text-white text-sm leading-tight">
                วิทยาลัยเทคนิคท่าหลวงฯ
              </h2>
              <p className="text-[11px] text-slate-400">ระบบบริหารการรับสมัคร</p>
            </div>
          </div>

          {/* User Profile Info Card */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.fullName}</p>
                <p className="text-[11px] text-slate-400 font-mono">@{currentUser?.username}</p>
              </div>
            </div>
            {userRoleMeta && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${userRoleMeta.color}`}
              >
                {userRoleMeta.label}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <span>ดูหน้าเว็บไซต์ผู้สมัคร</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
