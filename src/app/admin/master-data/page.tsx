'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Calendar,
  Layers,
  Plus,
  Edit,
  CheckCircle2,
  XCircle,
  Building,
  Save,
  X,
} from 'lucide-react';

export default function AdminMasterDataPage() {
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Department modal state
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [deptForm, setDeptForm] = useState({
    id: '',
    name: '',
    code: '',
    levelId: '',
    quotaTarget: 30,
    totalTarget: 40,
    isActive: true,
  });

  // Academic year modal state
  const [editingYear, setEditingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [newYearTitle, setNewYearTitle] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/master-data');
      const data = await res.json();
      if (res.ok) {
        setAcademicYears(data.academicYears || []);
        setLevels(data.levels || []);
        setDepartments(data.departments || []);
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error('Failed to load master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDeptModal = (dept?: any) => {
    if (dept) {
      setEditingDept(dept);
      setDeptForm({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        levelId: dept.levelId,
        quotaTarget: dept.quotaTarget,
        totalTarget: dept.totalTarget,
        isActive: dept.isActive,
      });
    } else {
      setEditingDept('NEW');
      setDeptForm({
        id: '',
        name: '',
        code: '',
        levelId: levels[0]?.id || '',
        quotaTarget: 30,
        totalTarget: 40,
        isActive: true,
      });
    }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DEPARTMENT',
          data: deptForm,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert('บันทึกข้อมูลสาขาวิชาเรียบร้อยแล้ว');
      setEditingDept(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'บันทึกข้อมูลสาขาวิชาไม่สำเร็จ');
    }
  };

  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ACADEMIC_YEAR',
          data: {
            year: newYearInput,
            title: newYearTitle || `ประจำปีการศึกษา ${newYearInput}`,
            isActive: true,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert('เพิ่มปีการศึกษาใหม่เรียบร้อยแล้ว');
      setEditingYear(false);
      setNewYearInput('');
      setNewYearTitle('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'บันทึกปีการศึกษาไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200 mb-1">
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span>ระบบจัดการข้อมูลหลักของสถานศึกษา (Master Data)</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900">
          จัดการข้อมูลหลักและโครงสร้างหลักสูตร
        </h1>
        <p className="text-xs text-slate-500">
          กำหนดปีการศึกษา สาขาวิชา จำนวนรับโควตา และสถานะการเปิดรับสมัคร
        </p>
      </div>

      {/* 1. Academic Years */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-900" />
              กำหนดปีการศึกษาที่เปิดรับสมัคร
            </h3>
            <p className="text-xs text-slate-500">ปีการศึกษาที่เปิดใช้งานปัจจุบันจะถูกนำไปใช้ในหน้าเว็บไซต์และใบสมัคร</p>
          </div>

          <button
            type="button"
            onClick={() => setEditingYear(true)}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มปีการศึกษาใหม่</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {academicYears.map((y) => (
            <div
              key={y.id}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                y.isActive
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div>
                <span className="font-display font-bold text-lg text-slate-900">ปี {y.year}</span>
                <p className="text-xs text-slate-500">{y.title}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  y.isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {y.isActive ? 'กำลังเปิดรับ' : 'ปิดแล้ว'}
              </span>
            </div>
          ))}
        </div>

        {/* Add Year Form Modal */}
        {editingYear && (
          <form onSubmit={handleSaveYear} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">เพิ่มปีการศึกษาใหม่</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">เลขปี พ.ศ. (เช่น 2571)</label>
                <input
                  type="text"
                  required
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ชื่อเรียก</label>
                <input
                  type="text"
                  value={newYearTitle}
                  onChange={(e) => setNewYearTitle(e.target.value)}
                  placeholder="ประจำปีการศึกษา 2571"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingYear(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg"
              >
                บันทึกปีการศึกษา
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Departments Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-900" />
              สาขาวิชาและเป้าหมายรับโควตา ({departments.length} สาขาวิชา)
            </h3>
            <p className="text-xs text-slate-500">
              วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ (ระดับ ปวช. และ ปวส.)
            </p>
          </div>

          <button
            type="button"
            onClick={() => openDeptModal()}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสาขาวิชา</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">รหัสสาขา</th>
                <th className="py-3 px-4">ชื่อสาขาวิชา</th>
                <th className="py-3 px-4">ระดับ</th>
                <th className="py-3 px-4 text-center">เป้าหมายโควตา</th>
                <th className="py-3 px-4 text-center">เป้าหมายรวม</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">แก้ไข</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{dept.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{dept.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-semibold text-slate-700">
                      {levels.find((l) => l.id === dept.levelId)?.category || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-900">{dept.quotaTarget} คน</td>
                  <td className="py-3 px-4 text-center text-slate-600">{dept.totalTarget} คน</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dept.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dept.isActive ? 'เปิดรับ' : 'ปิดรับ'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openDeptModal(dept)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-base">
                {editingDept === 'NEW' ? 'เพิ่มสาขาวิชาใหม่' : 'แก้ไขข้อมูลสาขาวิชา'}
              </h3>
              <button onClick={() => setEditingDept(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสสาขาวิชา</label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="เช่น PVC-AUTO หรือ PVSD-ELEC"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อสาขาวิชา</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="เช่น สาขาวิชาช่างยนต์"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ระดับการศึกษา</label>
                <select
                  value={deptForm.levelId}
                  onChange={(e) => setDeptForm({ ...deptForm, levelId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เป้าหมายโควตา (คน)</label>
                  <input
                    type="number"
                    value={deptForm.quotaTarget}
                    onChange={(e) => setDeptForm({ ...deptForm, quotaTarget: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เป้าหมายรวม (คน)</label>
                  <input
                    type="number"
                    value={deptForm.totalTarget}
                    onChange={(e) => setDeptForm({ ...deptForm, totalTarget: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={deptForm.isActive}
                    onChange={(e) => setDeptForm({ ...deptForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-900 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">เปิดรับสมัครในรอบนี้</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
