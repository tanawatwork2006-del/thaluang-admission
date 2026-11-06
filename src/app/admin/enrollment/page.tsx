'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Edit3,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatCitizenId, formatPhone } from '@/lib/validation';

export default function AdminEnrollmentPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected for enrollment editing
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [studentId, setStudentId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('ผู้ปกครอง');
  const [witnessName, setWitnessName] = useState('นายพิเชษฐ์ วิศวกรรมศาสตร์ (หัวหน้าแผนก)');
  const [enrollmentStatus, setEnrollmentStatus] = useState('COMPLETED');
  const [saving, setSaving] = useState(false);

  const fetchEnrollmentCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications?limit=50&year=2570');
      const data = await res.json();
      if (res.ok) {
        // Filter only candidates who are PASSED, PENDING_ENROLLMENT, or ENROLLED
        const candidates = (data.applications || []).filter((a: any) =>
          ['PASSED', 'PENDING_ENROLLMENT', 'ENROLLED'].includes(a.status)
        );
        setApplications(candidates);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentCandidates();
  }, []);

  const openEnrollModal = (app: any) => {
    setSelectedApp(app);
    setStudentId(app.enrollment?.studentId || '');
    setGuardianName(
      app.enrollment?.guardianName || app.parentInfo?.fatherName || app.parentInfo?.motherName || ''
    );
    setGuardianPhone(app.enrollment?.guardianPhone || app.applicant.phone || '');
    setGuardianRelation(app.enrollment?.guardianRelation || 'บิดา/มารดา');
    setWitnessName(app.enrollment?.witnessName || 'นายพิเชษฐ์ วิศวกรรมศาสตร์ (หัวหน้าแผนก)');
    setEnrollmentStatus(app.enrollment?.status || 'COMPLETED');
  };

  const handleSaveEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSaving(true);
    try {
      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          studentId: studentId.trim() || undefined,
          guardianName,
          guardianPhone,
          guardianRelation,
          witnessName,
          status: enrollmentStatus,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert('บันทึกข้อมูลการมอบตัวเรียบร้อยแล้ว');
      setSelectedApp(null);
      fetchEnrollmentCandidates();
    } catch (err: any) {
      alert(err.message || 'บันทึกการมอบตัวไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    return (
      app.applicant.fullName.toLowerCase().includes(q) ||
      app.applicationNo.toLowerCase().includes(q) ||
      app.primaryDept.name.toLowerCase().includes(q) ||
      (app.enrollment?.studentId && app.enrollment.studentId.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>ระบบมอบตัวและออกรหัสนักศึกษาใหม่</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            ระบบบริหารจัดการการมอบตัวนักเรียน นักศึกษาใหม่
          </h1>
          <p className="text-xs text-slate-500">
            บันทึกรหัสนักศึกษาใหม่ ข้อมูลผู้ปกครอง พยาน และพิมพ์ใบมอบตัวทางการ (PDF)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อผู้ผ่านการคัดเลือก, รหัสนักศึกษา, สาขาวิชา..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3.5 px-4">เลขที่ใบสมัคร</th>
                <th className="py-3.5 px-4">รหัสนักศึกษาใหม่</th>
                <th className="py-3.5 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3.5 px-4">สาขาวิชา</th>
                <th className="py-3.5 px-4">ผู้ปกครอง / เบอร์โทร</th>
                <th className="py-3.5 px-4 text-center">สถานะการมอบตัว</th>
                <th className="py-3.5 px-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    กำลังโหลดข้อมูลการมอบตัว...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    ยังไม่มีผู้ผ่านการคัดเลือก หรือไม่พบข้อมูลตามคำค้นหา
                  </td>
                </tr>
              ) : (
                filtered.map((app, index) => {
                  const isEnrolled = app.status === 'ENROLLED' || app.enrollment?.status === 'COMPLETED';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                        {app.applicationNo}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {app.enrollment?.studentId || (
                          <span className="text-slate-400 font-normal italic">ยังไม่ออกรหัส</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {app.applicant.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {app.primaryDept.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{app.enrollment?.guardianName || app.parentInfo?.fatherName || '-'}</span>
                        <span className="block text-[11px] text-slate-400">
                          {formatPhone(app.enrollment?.guardianPhone || app.applicant.phone)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                            isEnrolled
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isEnrolled ? 'มอบตัวเรียบร้อยแล้ว' : 'รอดำเนินการมอบตัว'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEnrollModal(app)}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-[11px] font-medium transition shadow-sm flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>บันทึกมอบตัว</span>
                          </button>

                          <Link
                            href={`/print/enrollment/${app.id}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-medium transition flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-900" />
                            <span>พิมพ์ใบมอบตัว (PDF)</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Enrollment Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  บันทึกข้อมูลการมอบตัวนักศึกษาใหม่
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.applicant.fullName} ({selectedApp.primaryDept.name})
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEnrollment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รหัสประจำตัวนักศึกษาใหม่ (Student ID)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 68301040001"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ-สกุลผู้ปกครอง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ความสัมพันธ์</label>
                  <input
                    type="text"
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value)}
                    placeholder="บิดา / มารดา / ผู้ปกครอง"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หมายเลขโทรศัพท์ผู้ปกครอง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อพยานการมอบตัว</label>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานะการมอบตัว</label>
                <select
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="COMPLETED">มอบตัวเรียบร้อยแล้ว (Completed)</option>
                  <option value="PENDING">รอดำเนินการมอบตัว (Pending)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการมอบตัว'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
