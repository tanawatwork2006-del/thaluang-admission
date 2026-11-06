'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Upload,
  RefreshCw,
  FileText,
  User,
  School,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { APPLICATION_STATUS_MAP, formatCitizenId, formatPhone } from '@/lib/validation';

function StatusContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [citizenId, setCitizenId] = useState('');
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [verifyPhoneLast4, setVerifyPhoneLast4] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<any>(null);

  // In-place document re-upload state
  const [resubmittingDocId, setResubmittingDocId] = useState<string | null>(null);
  const [resubmitLoading, setResubmitLoading] = useState(false);

  // Auto-search if tracking code is in URL
  useEffect(() => {
    if (initialCode) {
      handleSearch(undefined, initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    setError('');

    const searchCode = codeOverride || trackingCode;

    if (!citizenId.trim() && !searchCode.trim()) {
      setError('กรุณากรอกเลขประจำตัวประชาชน หรือ รหัสติดตามใบสมัคร');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/applications/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: citizenId.trim() || undefined,
          trackingCode: searchCode.trim() || undefined,
          verifyPhoneLast4: verifyPhoneLast4.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่พบข้อมูลใบสมัคร');
      }

      setApplication(data.application);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  // Re-upload handler for rejected documents
  const handleResubmit = async (docId: string, file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 8 MB');
      return;
    }

    setResubmitLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch(`/api/documents/${docId}/resubmit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: base64,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        alert('อัปโหลดเอกสารใหม่เรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบอีกครั้ง');
        // Refresh application data
        handleSearch(undefined, application?.trackingCode);
      } catch (err: any) {
        alert(err.message || 'อัปโหลดเอกสารไม่สำเร็จ');
      } finally {
        setResubmitLoading(false);
        setResubmittingDocId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const statusMeta = application
    ? APPLICATION_STATUS_MAP[application.status] || {
        label: application.status,
        color: 'bg-slate-100 text-slate-800',
        step: 2,
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200">
          <FileCheck className="w-4 h-4 text-amber-600" />
          <span>ระบบติดตามและตรวจสอบสถานะการสมัคร</span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          ตรวจสอบสถานะใบสมัครออนไลน์
        </h1>
        <p className="text-sm text-slate-500">
          วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา 2570
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวประชาชน (13 หลัก)
              </label>
              <input
                type="text"
                maxLength={13}
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                placeholder="เลขบัตรประชาชน 13 หลัก"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หรือ รหัสติดตาม / เลขที่ใบสมัคร
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="เช่น TL70-8A19 หรือ APP-2570-0001"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทร 4 ตัวท้าย (ยืนยันสิทธิ์)
              </label>
              <input
                type="text"
                maxLength={4}
                value={verifyPhoneLast4}
                onChange={(e) => setVerifyPhoneLast4(e.target.value)}
                placeholder="4 ตัวท้ายเบอร์โทร"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono text-center"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังค้นหา...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>ค้นหาข้อมูลใบสมัคร</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Section */}
      {application && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs text-slate-500 font-medium">สถานะปัจจุบัน:</span>
                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusMeta?.color}`}
                  >
                    {statusMeta?.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    ยื่นเมื่อ:{' '}
                    {new Date(application.submittedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Print PDF */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/print/application/${application.id}`}
                  target="_blank"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-blue-900" />
                  <span>พิมพ์ใบสมัคร (PDF)</span>
                </Link>

                {(application.status === 'PASSED' ||
                  application.status === 'PENDING_ENROLLMENT' ||
                  application.status === 'ENROLLED') && (
                  <Link
                    href={`/print/enrollment/${application.id}`}
                    target="_blank"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                  >
                    <GraduationCap className="w-4 h-4 text-amber-300" />
                    <span>พิมพ์ใบมอบตัว (PDF)</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stepper Visualization */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ขั้นตอนการดำเนินการ
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div
                  className={`p-3 rounded-xl border ${
                    statusMeta && statusMeta.step >= 2
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  1. ส่งใบสมัครแล้ว
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    statusMeta && statusMeta.step >= 6
                      ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                      : application.status === 'DOC_RESUBMIT'
                      ? 'bg-orange-50 border-orange-300 text-orange-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  2. ตรวจสอบเอกสาร
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    statusMeta && statusMeta.step >= 7 && application.status !== 'REJECTED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                      : application.status === 'REJECTED'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  3. ประกาศผลคัดเลือก
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    application.status === 'ENROLLED'
                      ? 'bg-green-50 border-green-200 text-green-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  4. มอบตัวนักศึกษา
                </div>
              </div>
            </div>

            {/* Review Remarks / Notes if any */}
            {application.reviewNotes && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <h5 className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> ข้อความแจ้งเตือนจากเจ้าหน้าที่:
                </h5>
                <p className="leading-relaxed pl-5">{application.reviewNotes}</p>
              </div>
            )}

            {/* Applicant Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <p>
                  <b>เลขที่ใบสมัคร:</b> {application.applicationNo}
                </p>
                <p>
                  <b>รหัสติดตาม:</b>{' '}
                  <span className="font-mono font-bold text-blue-900">
                    {application.trackingCode}
                  </span>
                </p>
                <p>
                  <b>ชื่อ-นามสกุล:</b> {application.applicant.fullName}
                </p>
                <p>
                  <b>เลขบัตรประชาชน:</b> {formatCitizenId(application.applicant.citizenId)}
                </p>
              </div>

              <div className="space-y-1.5">
                <p>
                  <b>ระดับการศึกษา:</b> {application.level.name}
                </p>
                <p>
                  <b>สาขาวิชาลำดับ 1:</b> {application.primaryDept.name}
                </p>
                {application.secondaryDept && (
                  <p>
                    <b>สาขาวิชาลำดับ 2:</b> {application.secondaryDept.name}
                  </p>
                )}
                <p>
                  <b>สถานศึกษาเดิม:</b> {application.education?.schoolName} (GPAX:{' '}
                  {application.education?.gpax?.toFixed(2)})
                </p>
              </div>
            </div>
          </div>

          {/* Attached Documents Status & In-place Re-upload */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" />
              สถานะการตรวจสอบเอกสารแนบ
            </h3>

            <div className="space-y-3">
              {application.documents?.map((doc: any) => {
                const isRejectedOrResubmit =
                  doc.status === 'REJECTED' || doc.status === 'RESUBMIT';

                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isRejectedOrResubmit
                        ? 'border-orange-300 bg-orange-50/50'
                        : doc.status === 'APPROVED'
                        ? 'border-teal-200 bg-teal-50/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{doc.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            doc.status === 'APPROVED'
                              ? 'bg-teal-100 text-teal-800'
                              : isRejectedOrResubmit
                              ? 'bg-orange-200 text-orange-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {doc.status === 'APPROVED'
                            ? 'ผ่านการตรวจสอบ'
                            : isRejectedOrResubmit
                            ? 'ต้องแก้ไข/ส่งใหม่'
                            : 'รอเจ้าหน้าที่ตรวจ'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        ไฟล์: {doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                      </p>

                      {/* Display rejection reason if any */}
                      {doc.rejectReason && (
                        <p className="text-xs text-rose-600 font-medium pt-1">
                          ⚠️ เหตุผลที่ต้องแก้ไข: {doc.rejectReason}
                        </p>
                      )}
                    </div>

                    {/* In-place Re-upload button if document is rejected or marked resubmit */}
                    {isRejectedOrResubmit && (
                      <div className="shrink-0">
                        <label className="cursor-pointer px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>อัปโหลดเอกสารใหม่</span>
                          <input
                            type="file"
                            accept=".pdf, image/jpeg, image/png, image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleResubmit(doc.id, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">กำลังโหลดระบบตรวจสอบสถานะ...</p>
        </div>
      }
    >
      <StatusContent />
    </Suspense>
  );
}
