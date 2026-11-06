'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  FileCheck,
  AlertCircle,
  Award,
  CheckCircle2,
  TrendingUp,
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [selectedYear, setSelectedYear] = useState('2570');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: any;
    charts: any;
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?year=${selectedYear}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [selectedYear]);

  return (
    <div className="space-y-8">
      {/* Top Header with Academic Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>ภาพรวมการรับสมัครระดับวิทยาลัย</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            แผงควบคุมระบบรับสมัคร (Admin Dashboard)
          </h1>
          <p className="text-xs text-slate-500">
            วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" /> ปีการศึกษา:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900"
          >
            <option value="2570">ปีการศึกษา 2570 (ปัจจุบัน)</option>
            <option value="2571">ปีการศึกษา 2571</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">กำลังประมวลผลสถิติ...</p>
        </div>
      ) : (
        <>
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Total */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">ผู้สมัครทั้งหมด</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {data?.stats.total || 0}
                </span>
                <span className="text-[11px] text-blue-900 font-semibold">คน</span>
              </div>
            </div>

            {/* ปวช */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">ระดับ ปวช.</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-blue-900">
                  {data?.stats.pvcCount || 0}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">คน</span>
              </div>
            </div>

            {/* ปวส */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">ระดับ ปวส.</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-indigo-900">
                  {data?.stats.pvsCount || 0}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">คน</span>
              </div>
            </div>

            {/* รอตรวจสอบ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-amber-700 font-medium">รอตรวจเอกสาร</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-600">
                  {data?.stats.pendingCount || 0}
                </span>
                <span className="text-[11px] text-amber-600 font-semibold">รายการ</span>
              </div>
            </div>

            {/* เอกสารไม่ครบ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-orange-700 font-medium">รอแก้ไขเอกสาร</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  {data?.stats.docIncompleteCount || 0}
                </span>
                <span className="text-[11px] text-orange-600 font-semibold">รายการ</span>
              </div>
            </div>

            {/* ผ่านการคัดเลือก */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-teal-700 font-medium">ผ่านคัดเลือก</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-teal-700">
                  {data?.stats.passedCount || 0}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold">คน</span>
              </div>
            </div>

            {/* มอบตัวแล้ว */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between bg-emerald-50/50">
              <span className="text-xs text-emerald-800 font-medium">มอบตัวแล้ว</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-700">
                  {data?.stats.enrolledCount || 0}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">คน</span>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/applicants?status=SUBMITTED"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">ตรวจเอกสารใบสมัครใหม่</h4>
                  <p className="text-[11px] text-slate-500">
                    มี {data?.stats.pendingCount || 0} รายการรอการตรวจสอบ
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/selection"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">พิจารณาคัดเลือกโควตา</h4>
                  <p className="text-[11px] text-slate-500">จัดสรรโควตารายสาขาวิชา</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/export"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">ส่งออกข้อมูลทะเบียน (Excel)</h4>
                  <p className="text-[11px] text-slate-500">รองรับระบบ ศธ.02 และรายงานราชการ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Department Breakdown Section (สาขาวิชา) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  จำนวนผู้สมัครแยกตามสาขาวิชา (เทียบเป้าหมายโควตา)
                </h3>
                <p className="text-xs text-slate-500">
                  สถิติจำนวนผู้สมัครที่เลือกสาขาวิชานั้นๆ เป็นอันดับ 1
                </p>
              </div>
              <Link
                href="/admin/selection"
                className="text-xs font-semibold text-blue-900 hover:underline"
              >
                ดูรายละเอียดโควตาทั้งหมด →
              </Link>
            </div>

            <div className="space-y-4">
              {data?.charts.byDepartment.map((dept: any) => {
                const percent = Math.min(
                  Math.round((dept.count / (dept.quota || 1)) * 100),
                  100
                );
                return (
                  <div key={dept.code} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                          {dept.category}
                        </span>
                        <span className="font-medium text-slate-800">{dept.name}</span>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {dept.count} / {dept.quota} คน{' '}
                        <span className="text-slate-400 font-normal">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 100
                            ? 'bg-emerald-600'
                            : percent >= 75
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geographic & Previous Schools Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Province */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-900" />
                ผู้สมัครแยกตามจังหวัดภูมิลำเนา / โรงเรียนเดิม
              </h3>
              <div className="space-y-2.5">
                {data?.charts.byProvince?.map((p: any) => (
                  <div
                    key={p.name}
                    className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-700">{p.name}</span>
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {p.count} คน
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Previous School */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                สถานศึกษาเดิมที่มีผู้สมัครมากที่สุด
              </h3>
              <div className="space-y-2.5">
                {data?.charts.bySchool?.map((s: any) => (
                  <div
                    key={s.name}
                    className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-700 truncate max-w-[280px]">
                      {s.name}
                    </span>
                    <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {s.count} คน
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
