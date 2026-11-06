'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import { APPLICATION_STATUS_MAP, maskCitizenId } from '@/lib/validation';

export default function AdminSelectionPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected applications for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSelectionData = async () => {
    setLoading(true);
    try {
      const url = selectedDeptId
        ? `/api/selection?deptId=${selectedDeptId}`
        : `/api/selection`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setDepartments(data.departments || []);
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching selection data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectionData();
  }, [selectedDeptId]);

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Perform Batch Selection Action (PASSED, RESERVED, REJECTED)
  const handleBatchAction = async (status: string) => {
    if (selectedIds.length === 0) {
      alert('กรุณาเลือกผู้สมัครอย่างน้อย 1 รายการ');
      return;
    }

    if (!confirm(`ยืนยันการเปลี่ยนสถานะผู้สมัคร ${selectedIds.length} รายการ เป็น "${status}" หรือไม่?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BATCH_UPDATE',
          applicationIds: selectedIds,
          status,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert(`ปรับปรุงสถานะผู้สมัคร ${selectedIds.length} รายการ เรียบร้อยแล้ว`);
      setSelectedIds([]);
      fetchSelectionData();
    } catch (err: any) {
      alert(err.message || 'ดำเนินการไม่สำเร็จ');
    } finally {
      setActionLoading(false);
    }
  };

  // Publish Results Announcement
  const handlePublishResults = async () => {
    if (!confirm('ยืนยันการประกาศผลการคัดเลือกสู่ระบบหรือไม่? ผู้สมัครจะสามารถตรวจสอบผลและสถานะได้ทันที')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PUBLISH_RESULTS',
          year: '2570',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert('ประกาศผลการคัดเลือกเข้าสู่ระบบเรียบร้อยแล้ว!');
    } catch (err: any) {
      alert(err.message || 'ประกาศผลไม่สำเร็จ');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>ระบบจัดการคัดเลือกผู้สมัครรอบโควตา</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            พิจารณาผลการคัดเลือกและจัดสรรโควตา
          </h1>
          <p className="text-xs text-slate-500">
            กำหนดผลการคัดเลือก (ผ่าน / สำรอง / ไม่ผ่าน) ตามเป้าหมายรับในแต่ละสาขาวิชา
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublishResults}
          disabled={actionLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-2"
        >
          <Megaphone className="w-4 h-4 text-amber-400" />
          <span>ประกาศผลการคัดเลือกเข้าระบบ</span>
        </button>
      </div>

      {/* Department Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {departments.slice(0, 8).map((dept) => (
          <button
            key={dept.id}
            type="button"
            onClick={() => setSelectedDeptId(selectedDeptId === dept.id ? '' : dept.id)}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              selectedDeptId === dept.id
                ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900/20 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {dept.level?.category}
              </span>
              <h4 className="font-semibold text-xs text-slate-900 mt-1 truncate">
                {dept.name}
              </h4>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-baseline text-xs">
              <span className="text-slate-500">สมัคร: {dept._count?.primaryApps || 0} คน</span>
              <span className="font-bold text-blue-900">โควตา: {dept.quotaTarget}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Batch Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            {selectedIds.length === applications.length && applications.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-900" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>เลือกทั้งหมด ({selectedIds.length})</span>
          </button>
          {selectedIds.length > 0 && (
            <span className="text-blue-900 font-semibold">
              เลือกแล้ว {selectedIds.length} รายการ
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={() => handleBatchAction('PASSED')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ผ่านการคัดเลือก (Passed)</span>
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={() => handleBatchAction('RESERVED')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40 flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>สำรอง (Reserved)</span>
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={() => handleBatchAction('REJECTED')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40 flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>ไม่ผ่าน (Rejected)</span>
          </button>
        </div>
      </div>

      {/* Applications Candidate Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">เลือก</th>
                <th className="py-3.5 px-4">เลขที่ใบสมัคร</th>
                <th className="py-3.5 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3.5 px-4">สาขาวิชาที่สมัคร</th>
                <th className="py-3.5 px-4">GPAX 5 ภาคเรียน</th>
                <th className="py-3.5 px-4">โรงเรียนเดิม</th>
                <th className="py-3.5 px-4 text-center">สถานะปัจจุบัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    กำลังโหลดรายชื่อผู้สมัคร...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบรายชื่อผู้สมัครในสาขานี้
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const isSelected = selectedIds.includes(app.id);
                  const meta = APPLICATION_STATUS_MAP[app.status] || {
                    label: app.status,
                    color: 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <tr
                      key={app.id}
                      onClick={() => toggleSelectOne(app.id)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(app.id)}
                          className="h-4 w-4 text-blue-900 rounded border-slate-300"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                        {app.applicationNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {app.applicant.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {app.primaryDept?.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                        {app.education?.gpax?.toFixed(2) || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[200px]">
                        {app.education?.schoolName} ({app.education?.schoolProvince})
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
