'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Eye,
  Printer,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Calendar,
  Phone,
  School,
  ExternalLink,
} from 'lucide-react';
import {
  APPLICATION_STATUS_MAP,
  maskCitizenId,
  formatCitizenId,
  formatPhone,
} from '@/lib/validation';

export default function AdminApplicantsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [levelId, setLevelId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [status, setStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('2570');

  // Master data
  const [levels, setLevels] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Selected Application for Detail Modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Review states inside modal
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Document review state
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);
  const [docRejectReason, setDocRejectReason] = useState('');

  // Load master data
  useEffect(() => {
    async function loadMaster() {
      try {
        const res = await fetch('/api/master-data');
        const data = await res.json();
        if (data.levels) setLevels(data.levels);
        if (data.departments) setDepartments(data.departments);
      } catch (err) {
        console.error('Failed to load master:', err);
      }
    }
    loadMaster();
  }, []);

  // Fetch applications list
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search: search.trim(),
        levelId,
        deptId,
        status,
        year: selectedYear,
      });

      const res = await fetch(`/api/applications?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, levelId, deptId, status, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  // Open Dossier Detail
  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setSelectedApp(null);
    try {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      if (res.ok && data.application) {
        setSelectedApp(data.application);
        setNewStatus(data.application.status);
        setReviewNotes(data.application.reviewNotes || '');
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Change Application Status
  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert('อัปเดตสถานะใบสมัครเรียบร้อยแล้ว');
      openDetail(selectedApp.id);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Review Single Document (ผ่าน / ไม่ผ่าน / ต้องส่งใหม่)
  const handleReviewDocument = async (docId: string, docStatus: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: docStatus,
          rejectReason: docStatus !== 'APPROVED' ? docRejectReason : null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert(`บันทึกผลการตรวจสอบเอกสารเรียบร้อยแล้ว (${docStatus})`);
      setReviewingDocId(null);
      setDocRejectReason('');
      openDetail(selectedApp.id);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'บันทึกการตรวจเอกสารไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            ระบบจัดการข้อมูลผู้สมัคร
          </h1>
          <p className="text-xs text-slate-500">
            ตรวจสอบข้อมูล ตรวจสอบเอกสารหลักฐาน และปรับปรุงสถานะใบสมัคร (รวม {total} รายการ)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/export"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก Excel</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, เลขใบสมัคร, เลขบัตร, รหัสติดตาม..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <select
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900"
            >
              <option value="">-- ทุกระดับการศึกษา --</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={deptId}
              onChange={(e) => {
                setDeptId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900"
            >
              <option value="">-- ทุกสาขาวิชา --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900"
            >
              <option value="">-- ทุกสถานะ --</option>
              {Object.entries(APPLICATION_STATUS_MAP).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              ค้นหา
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3.5 px-4">เลขที่ใบสมัคร</th>
                <th className="py-3.5 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3.5 px-4">เลขบัตร ปชช.</th>
                <th className="py-3.5 px-4">ระดับ</th>
                <th className="py-3.5 px-4">สาขาวิชา</th>
                <th className="py-3.5 px-4">โรงเรียนเดิม / GPAX</th>
                <th className="py-3.5 px-4">วันที่สมัคร</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    กำลังโหลดข้อมูลผู้สมัคร...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลผู้สมัครที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                applications.map((app, index) => {
                  const meta = APPLICATION_STATUS_MAP[app.status] || {
                    label: app.status,
                    color: 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-blue-50/40 transition group cursor-pointer"
                      onClick={() => openDetail(app.id)}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {(page - 1) * 15 + index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                        {app.applicationNo}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {app.trackingCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {app.applicant.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {maskCitizenId(app.applicant.citizenId)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {app.level.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {app.primaryDept.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                        <span>{app.education?.schoolName || '-'}</span>
                        <span className="block text-[11px] font-mono font-semibold text-slate-800">
                          GPAX: {app.education?.gpax?.toFixed(2) || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(app.submittedAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetail(app.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-900 transition"
                            title="ดูรายละเอียดและตรวจเอกสาร"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/print/application/${app.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                            title="พิมพ์ใบสมัคร PDF"
                          >
                            <Printer className="w-4 h-4" />
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            แสดงหน้า {page} จาก {totalPages} หน้า (ทั้งหมด {total} รายการ)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dossier Detail Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start sticky top-0 z-10">
              <div>
                <span className="text-[11px] text-amber-400 font-semibold block">
                  เลขที่ใบสมัคร: {selectedApp.applicationNo} (รหัส: {selectedApp.trackingCode})
                </span>
                <h2 className="font-display font-bold text-xl text-white mt-1">
                  {selectedApp.applicant.fullName}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  เลขประจำตัวประชาชน: {formatCitizenId(selectedApp.applicant.citizenId)}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-6 flex-1 text-xs text-slate-700">
              {/* Status Update Block */}
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-900" />
                  ปรับปรุงสถานะการสมัคร
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      สถานะใบสมัคร
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      {Object.entries(APPLICATION_STATUS_MAP).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      หมายเหตุการตรวจสอบ (แจ้งผู้สมัคร)
                    </label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="เช่น เอกสารไม่ชัดเจน / ผ่านการตรวจสอบแล้ว"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {updatingStatus ? 'กำลังบันทึก...' : 'บันทึกสถานะใหม่'}
                  </button>
                </div>
              </div>

              {/* Document Review System (Section 3.4) */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>เอกสารหลักฐานประกอบการสมัคร ({selectedApp.documents?.length || 0} รายการ)</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    คลิกเพื่อดูและตรวจผลเอกสารแต่ละรายการ
                  </span>
                </h4>

                <div className="space-y-3">
                  {selectedApp.documents?.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-slate-900">{doc.title}</h5>
                          <p className="text-[11px] text-slate-500">
                            ชื่อไฟล์: {doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            doc.status === 'APPROVED'
                              ? 'bg-teal-100 text-teal-800'
                              : doc.status === 'REJECTED' || doc.status === 'RESUBMIT'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {doc.status === 'APPROVED'
                            ? 'ผ่าน'
                            : doc.status === 'RESUBMIT'
                            ? 'ให้ส่งใหม่'
                            : doc.status === 'REJECTED'
                            ? 'ไม่ผ่าน'
                            : 'รอตรวจสอบ'}
                        </span>
                      </div>

                      {/* File preview / open link */}
                      {doc.fileUrl && (
                        <div className="pt-1">
                          {doc.mimeType?.startsWith('image/') ? (
                            <img
                              src={doc.fileUrl}
                              alt={doc.title}
                              className="max-h-40 rounded-xl border border-slate-300 object-contain"
                            />
                          ) : (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-900 font-medium text-xs hover:bg-slate-100 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>เปิดดูเอกสาร PDF แนบ</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Review Buttons */}
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReviewDocument(doc.id, 'APPROVED')}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            ✓ ผ่าน
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewingDocId(doc.id);
                              setDocRejectReason(doc.rejectReason || '');
                            }}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            ⚠️ ต้องแก้ไข/ส่งใหม่
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewDocument(doc.id, 'REJECTED')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            ✗ ไม่ผ่าน
                          </button>
                        </div>
                      </div>

                      {/* Rejection input box if opened */}
                      {reviewingDocId === doc.id && (
                        <div className="pt-2 space-y-2 bg-orange-50 p-3 rounded-xl border border-orange-200">
                          <label className="block text-[11px] font-semibold text-orange-900">
                            ระบุเหตุผลที่ต้องส่งใหม่:
                          </label>
                          <input
                            type="text"
                            value={docRejectReason}
                            onChange={(e) => setDocRejectReason(e.target.value)}
                            placeholder="เช่น ภาพมืดมองไม่ชัด, ขาดตราประทับโรงเรียน"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReviewingDocId(null)}
                              className="px-3 py-1 text-slate-500 text-[11px]"
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewDocument(doc.id, 'RESUBMIT')}
                              className="px-3 py-1 bg-orange-600 text-white rounded-lg text-[11px] font-semibold"
                            >
                              ยืนยันแจ้งแก้ไข
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Choices */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h5 className="font-bold text-slate-900">ข้อมูลการศึกษาและความประสงค์</h5>
                <p><b>ระดับที่สมัคร:</b> {selectedApp.level?.name}</p>
                <p><b>สาขาวิชาลำดับ 1:</b> {selectedApp.primaryDept?.name}</p>
                {selectedApp.secondaryDept && (
                  <p><b>สาขาวิชาลำดับ 2 (สำรอง):</b> {selectedApp.secondaryDept.name}</p>
                )}
                <p><b>สถานศึกษาเดิม:</b> {selectedApp.education?.schoolName} ({selectedApp.education?.schoolProvince})</p>
                <p><b>ระดับชั้น:</b> {selectedApp.education?.currentLevel} | <b>GPAX:</b> {selectedApp.education?.gpax?.toFixed(2)}</p>
              </div>

              {/* Contact & Parent Info */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h5 className="font-bold text-slate-900">ข้อมูลติดต่อและครอบครัว</h5>
                <p><b>เบอร์โทรผู้สมัคร:</b> {formatPhone(selectedApp.applicant.phone)}</p>
                <p><b>ที่อยู่:</b> บ้านเลขที่ {selectedApp.address?.houseNo} หมู่ {selectedApp.address?.moo || '-'} ต.{selectedApp.address?.subdistrict} อ.{selectedApp.address?.district} จ.{selectedApp.address?.province} {selectedApp.address?.postalCode}</p>
                <p><b>บิดา:</b> {selectedApp.parentInfo?.fatherName || '-'} (อายุ {selectedApp.parentInfo?.fatherAge || '-'} ปี, อาชีพ {selectedApp.parentInfo?.fatherJob || '-'})</p>
                <p><b>มารดา:</b> {selectedApp.parentInfo?.motherName || '-'} (อายุ {selectedApp.parentInfo?.motherAge || '-'} ปี, อาชีพ {selectedApp.parentInfo?.motherJob || '-'})</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center sticky bottom-0">
              <Link
                href={`/print/application/${selectedApp.id}`}
                target="_blank"
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์ใบสมัครทางการ (PDF)</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
