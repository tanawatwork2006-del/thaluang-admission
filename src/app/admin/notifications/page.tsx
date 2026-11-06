'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  MessageSquare,
  Mail,
  Smartphone,
  Info,
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Test form
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('ทดสอบการแจ้งเตือนจากระบบรับสมัคร วท.ท่าหลวงฯ');
  const [sending, setSending] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: testRecipient,
          message: testMessage,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert('ส่งการแจ้งเตือนทดสอบเรียบร้อยแล้ว');
      loadNotifications();
    } catch (err: any) {
      alert(err.message || 'ส่งการแจ้งเตือนไม่สำเร็จ');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200 mb-1">
          <Bell className="w-3.5 h-3.5 text-amber-600" />
          <span>ระบบแจ้งเตือนอัตโนมัติ (Automated Notification Engine)</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900">
          บันทึกและตั้งค่าระบบแจ้งเตือน (LINE & Email)
        </h1>
        <p className="text-xs text-slate-500">
          แจ้งเตือนอัตโนมัติเมื่อมีผู้สมัครใหม่ เอกสารผ่าน/ไม่ผ่าน ประกาศผล และขั้นตอนมอบตัว
        </p>
      </div>

      {/* API Configuration Status Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
            <MessageSquare className="w-4 h-4" />
            <span>LINE Official Account / Notify</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            รองรับการส่งข้อความผ่าน LINE Notify API และ LINE Messaging API
            โดยสามารถกำหนดค่า <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">LINE_NOTIFY_TOKEN</code> ในไฟล์ <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.env</code>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
            <Mail className="w-4 h-4" />
            <span>Email (SMTP Server)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            รองรับการส่งอีเมลยืนยันการสมัครและผลการคัดเลือกผ่าน SMTP Host และพอร์ตของวิทยาลัย
            โดยกำหนดค่าใน <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">SMTP_HOST</code> และ <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">SMTP_USER</code>
          </p>
        </div>
      </div>

      {/* Test Notification Box */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Send className="w-4 h-4 text-blue-900" />
          ทดสอบส่งข้อความแจ้งเตือน (Test Notification)
        </h3>

        <form onSubmit={handleSendTest} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5">
            <label className="block font-semibold text-slate-700 mb-1">
              ผู้รับ (เบอร์โทร หรือ อีเมล)
            </label>
            <input
              type="text"
              required
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="เช่น 0812345678 หรือ test@email.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block font-semibold text-slate-700 mb-1">ข้อความ</label>
            <input
              type="text"
              required
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'กำลังส่ง...' : 'ทดสอบส่ง'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-display font-bold text-slate-900 text-sm">
            ประวัติการแจ้งเตือนล่าสุด ({notifications.length} รายการ)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">ช่องทาง</th>
                <th className="py-3 px-4">ผู้รับ</th>
                <th className="py-3 px-4">หัวข้อ</th>
                <th className="py-3 px-4">ข้อความ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">เวลาที่ส่ง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    กำลังโหลดประวัติการแจ้งเตือน...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    ยังไม่มีประวัติการแจ้งเตือนในระบบ
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                        {n.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{n.recipient}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{n.subject}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-[280px] truncate">{n.message}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          n.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {n.status === 'SENT' ? 'ส่งสำเร็จ' : 'บันทึกในระบบ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(n.sentAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
