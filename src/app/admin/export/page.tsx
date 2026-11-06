'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  FileCheck,
} from 'lucide-react';
import { APPLICATION_STATUS_MAP } from '@/lib/validation';

export default function AdminExportPage() {
  const [format, setFormat] = useState('xlsx'); // 'xlsx' or 'csv'
  const [selectedYear, setSelectedYear] = useState('2570');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [levels, setLevels] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadMaster() {
      try {
        const res = await fetch('/api/master-data');
        const data = await res.json();
        if (data.levels) setLevels(data.levels);
        if (data.departments) setDepartments(data.departments);
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    }
    loadMaster();
  }, []);

  const handleExport = () => {
    setDownloading(true);
    const query = new URLSearchParams({
      format,
      year: selectedYear,
      levelId: selectedLevelId,
      deptId: selectedDeptId,
      status: selectedStatus,
    });

    // Trigger browser file download
    window.location.href = `/api/export?${query.toString()}`;
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200 mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>ระบบส่งออกข้อมูลผู้สมัคร (Export Module)</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900">
          ส่งออกข้อมูลผู้สมัครสู่โปรแกรมทะเบียน (Excel & CSV)
        </h1>
        <p className="text-xs text-slate-500">
          รองรับการส่งออกข้อมูลที่จัดเรียงคอลัมน์มาตรฐานสำหรับนำเข้าสู่ระบบงานทะเบียนของวิทยาลัย (ศธ.02)
        </p>
      </div>

      {/* Export Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-5 h-5 text-blue-900" />
          กำหนดเงื่อนไขการส่งออกข้อมูล
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Format selection */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block font-semibold text-slate-800">รูปแบบไฟล์ที่ต้องการ:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={format === 'xlsx'}
                  onChange={() => setFormat('xlsx')}
                  className="h-4 w-4 text-blue-900"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Excel Spreadsheet (.xlsx)</span>
                  <span className="text-[11px] text-slate-500">
                    จัดรูปแบบตาราง พร้อมความกว้างคอลัมน์อัตโนมัติ (แนะนำ)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="h-4 w-4 text-blue-900"
                />
                <div>
                  <span className="font-bold text-slate-900 block">CSV File (.csv)</span>
                  <span className="text-[11px] text-slate-500">
                    มี UTF-8 BOM รองรับภาษาไทยใน Excel ไม่เป็นตัวอักษรต่างดาว
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษา</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="2570">ประจำปีการศึกษา 2570</option>
              <option value="2571">ประจำปีการศึกษา 2571</option>
              <option value="">ทุกปีการศึกษา</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ระดับการศึกษา</label>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-- ทุกระดับการศึกษา --</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">สาขาวิชา</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-- ทุกสาขาวิชา --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">สถานะการสมัคร</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-- ทุกสถานะ --</option>
              {Object.entries(APPLICATION_STATUS_MAP).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Standard Columns Preview */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> โครงสร้างข้อมูลที่ส่งออก (ศธ.02 Compatibility):
          </h4>
          <p className="text-slate-600 leading-relaxed">
            ลำดับที่, เลขที่ใบสมัคร, รหัสติดตาม, ชื่อ-นามสกุล, เลขประจำตัวประชาชน 13 หลัก, ระดับการศึกษา,
            สาขาวิชาอันดับ 1, สาขาวิชาอันดับ 2, ผลการเรียนสะสม (GPAX), สถานศึกษาเดิม, จังหวัดสถานศึกษา,
            หมายเลขโทรศัพท์, สถานะการสมัคร, รหัสนักศึกษาใหม่, ชื่อบิดา, ชื่อมารดา, วันที่ยื่นใบสมัคร
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={downloading}
            onClick={handleExport}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>{downloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลดไฟล์ข้อมูล'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
