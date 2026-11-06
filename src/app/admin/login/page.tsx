'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, School, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="โลโก้วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์"
            className="w-20 h-20 mx-auto object-contain drop-shadow-md mb-2"
          />
          <h1 className="font-display font-bold text-2xl text-slate-900">
            ระบบสำหรับเจ้าหน้าที่
          </h1>
          <p className="text-xs text-slate-500">
            วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin หรือ admission"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านเจ้าหน้าที่"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบจัดการ</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-900" /> บัญชีทดสอบในระบบ (Default Roles):
            </p>
            <p>
              • <b>Super Admin:</b> <span className="font-mono">admin</span> /{' '}
              <span className="font-mono">admin123456</span>
            </p>
            <p>
              • <b>Admission Admin:</b> <span className="font-mono">admission</span> /{' '}
              <span className="font-mono">staff123456</span>
            </p>
            <p>
              • <b>Staff ตรวจเอกสาร:</b> <span className="font-mono">staff</span> /{' '}
              <span className="font-mono">staff123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
