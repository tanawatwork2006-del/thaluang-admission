'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  Users,
  Home,
  BookOpen,
  FileText,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Trash2,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  validateThaiCitizenId,
  validateThaiPhone,
  validateGpax,
  THAI_MONTHS,
  formatCitizenId,
} from '@/lib/validation';
import { THAI_PROVINCES, SARABURI_DISTRICTS } from '@/lib/thai-provinces';

interface Department {
  id: string;
  code: string;
  name: string;
  levelId: string;
  quotaTarget: number;
}

interface AdmissionLevel {
  id: string;
  code: string;
  name: string;
  category: string;
}

export default function ApplyPage() {
  const router = useRouter();

  // Loading master data
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [academicYear, setAcademicYear] = useState('2570');
  const [levels, setLevels] = useState<AdmissionLevel[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form Step (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form Data State
  const [formData, setFormData] = useState({
    // Level
    levelId: '',
    levelCode: '',

    // 1. Personal Info
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    citizenId: '',
    birthDay: '1',
    birthMonth: 'มกราคม',
    birthYear: '2554',
    phone: '',
    email: '',
    photoUrl: '', // 1 inch photo

    // 2. Father
    fatherName: '',
    fatherAge: '',
    fatherJob: '',

    // 3. Mother
    motherName: '',
    motherAge: '',
    motherJob: '',

    // 4. Address
    houseNo: '',
    moo: '',
    soi: '',
    road: '',
    subdistrict: '',
    district: '',
    province: 'สระบุรี',
    postalCode: '18130',

    // 5. Current Education
    currentLevel: 'ม.3',
    schoolName: '',
    schoolAddressNo: '',
    schoolSubdistrict: '',
    schoolDistrict: '',
    schoolProvince: 'สระบุรี',
    gpax: '',
    major: '',

    // 6. Department Preferences
    primaryDeptId: '',
    secondaryDeptId: '',

    // 7. Signature & Consent
    signerName: '',
    signDateDay: new Date().getDate().toString(),
    signDateMonth: THAI_MONTHS[new Date().getMonth()],
    signDateYear: '2569',
    signatureData: '',
    consentPdpa: false,
  });

  // Uploaded documents state
  const [docs, setDocs] = useState<{
    PHOTO: { fileUrl: string; fileName: string; fileSize: number; mimeType: string } | null;
    TRANSCRIPT: { fileUrl: string; fileName: string; fileSize: number; mimeType: string } | null;
    ID_HOUSE: { fileUrl: string; fileName: string; fileSize: number; mimeType: string } | null;
    CERTIFICATE: { fileUrl: string; fileName: string; fileSize: number; mimeType: string } | null;
  }>({
    PHOTO: null,
    TRANSCRIPT: null,
    ID_HOUSE: null,
    CERTIFICATE: null,
  });

  // UI / Error / Submission states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    applicationNo: string;
    trackingCode: string;
    applicationId: string;
  } | null>(null);

  // Canvas signature ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load master data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/master-data');
        const data = await res.json();
        if (data.levels) setLevels(data.levels);
        if (data.departments) setDepartments(data.departments);
        if (data.activeYear?.year) setAcademicYear(data.activeYear.year);

        // Pre-select first level
        if (data.levels?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            levelId: data.levels[0].id,
            levelCode: data.levels[0].code,
          }));
        }
      } catch (err) {
        console.error('Failed to load master data:', err);
      } finally {
        setLoadingMaster(false);
      }
    }
    loadData();
  }, []);

  // Filter departments for selected level
  const filteredDepartments = departments.filter((d) => d.levelId === formData.levelId);

  // Handle generic input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear specific field error
    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  // Handle Level Selection
  const handleSelectLevel = (lvl: AdmissionLevel) => {
    setFormData((prev) => ({
      ...prev,
      levelId: lvl.id,
      levelCode: lvl.code,
      primaryDeptId: '',
      secondaryDeptId: '',
      currentLevel: lvl.code === 'PVC' ? 'ม.3' : lvl.code === 'PVS_DIRECT' ? 'ปวช.3' : 'ม.6',
    }));
  };

  // File Upload Handler (convert to base64 for persistent preview & storage)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'PHOTO' | 'TRANSCRIPT' | 'ID_HOUSE' | 'CERTIFICATE'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 8 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setDocs((prev) => ({
        ...prev,
        [type]: {
          fileUrl: base64,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      }));

      if (type === 'PHOTO') {
        setFormData((prev) => ({ ...prev, photoUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (type: 'PHOTO' | 'TRANSCRIPT' | 'ID_HOUSE' | 'CERTIFICATE') => {
    setDocs((prev) => ({ ...prev, [type]: null }));
    if (type === 'PHOTO') {
      setFormData((prev) => ({ ...prev, photoUrl: '' }));
    }
  };

  // Canvas Signature Pad Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F2B5C';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData((prev) => ({ ...prev, signatureData: canvas.toDataURL() }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData((prev) => ({ ...prev, signatureData: '' }));
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Level & Personal
      if (!formData.levelId) newErrors.levelId = 'กรุณาเลือกระดับการศึกษาที่สมัคร';
      if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อจริง';
      if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล';
      if (!validateThaiCitizenId(formData.citizenId)) {
        newErrors.citizenId = 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้อง (ไม่ผ่านการตรวจสอบ Checksum)';
      }
      if (!validateThaiPhone(formData.phone)) {
        newErrors.phone = 'หมายเลขโทรศัพท์ 10 หลักไม่ถูกต้อง (เช่น 0812345678)';
      }
      if (!docs.PHOTO) {
        newErrors.photo = 'กรุณาอัปโหลดรูปถ่ายหน้าตรงขนาด 1 นิ้ว';
      }
    } else if (step === 2) {
      // Parents
      if (!formData.fatherName.trim()) newErrors.fatherName = 'กรุณากรอกชื่อ-สกุลบิดา';
      if (!formData.fatherAge) newErrors.fatherAge = 'กรุณากรอกอายุบิดา';
      if (!formData.fatherJob.trim()) newErrors.fatherJob = 'กรุณากรอกอาชีพบิดา';

      if (!formData.motherName.trim()) newErrors.motherName = 'กรุณากรอกชื่อ-สกุลมารดา';
      if (!formData.motherAge) newErrors.motherAge = 'กรุณากรอกอายุมารดา';
      if (!formData.motherJob.trim()) newErrors.motherJob = 'กรุณากรอกอาชีพมารดา';
    } else if (step === 3) {
      // Address
      if (!formData.houseNo.trim()) newErrors.houseNo = 'กรุณากรอกบ้านเลขที่';
      if (!formData.subdistrict.trim()) newErrors.subdistrict = 'กรุณากรอกตำบล/แขวง';
      if (!formData.district.trim()) newErrors.district = 'กรุณากรอกอำเภอ/เขต';
      if (!formData.province.trim()) newErrors.province = 'กรุณาเลือกจังหวัด';
      if (!formData.postalCode.trim() || formData.postalCode.length !== 5) {
        newErrors.postalCode = 'กรุณากรอกรหัสไปรษณีย์ 5 หลัก';
      }
    } else if (step === 4) {
      // Education
      if (!formData.currentLevel.trim()) newErrors.currentLevel = 'กรุณากรอกระดับชั้นที่กำลังศึกษา';
      if (!formData.schoolName.trim()) newErrors.schoolName = 'กรุณากรอกชื่อโรงเรียน/สถานศึกษา';
      if (!formData.schoolProvince.trim()) newErrors.schoolProvince = 'กรุณากรอกจังหวัดที่สถานศึกษาตั้งอยู่';
      const gpaxNum = parseFloat(formData.gpax);
      if (!validateGpax(gpaxNum)) {
        newErrors.gpax = 'เกรดเฉลี่ยสะสม (GPAX) ต้องเป็นตัวเลขระหว่าง 0.00 ถึง 4.00';
      }
    } else if (step === 5) {
      // Departments
      if (!formData.primaryDeptId) {
        newErrors.primaryDeptId = 'กรุณาเลือกสาขาวิชาที่ต้องการสมัคร';
      }
      if (formData.levelCode === 'PVC' && !formData.secondaryDeptId) {
        newErrors.secondaryDeptId = 'ระดับ ปวช. กรุณาเลือกสาขาวิชาลำดับที่ 2 (สำรอง)';
      }
      if (
        formData.levelCode === 'PVC' &&
        formData.primaryDeptId &&
        formData.primaryDeptId === formData.secondaryDeptId
      ) {
        newErrors.secondaryDeptId = 'สาขาวิชาลำดับที่ 2 ต้องไม่ซ้ำกับลำดับที่ 1';
      }
    } else if (step === 6) {
      // Documents
      if (!docs.TRANSCRIPT) {
        newErrors.transcript = 'กรุณาแนบเอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน';
      }
      if (!docs.ID_HOUSE) {
        newErrors.idHouse = 'กรุณาแนบสำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน';
      }
    } else if (step === 7) {
      // Signature & Consent
      if (!formData.consentPdpa) {
        newErrors.consentPdpa = 'กรุณายินยอมให้จัดเก็บและประมวลผลข้อมูลส่วนบุคคลตามนโยบาย PDPA';
      }
      if (!formData.signerName.trim()) {
        newErrors.signerName = 'กรุณาพิมพ์ชื่อ-นามสกุลผู้สมัครเพื่อลงนามรับรอง';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Final Form
  const handleSubmit = async () => {
    if (!validateStep(7)) return;

    setSubmitting(true);
    try {
      const documentsPayload = [
        ...(docs.PHOTO
          ? [{ docType: 'PHOTO', title: 'รูปถ่ายหน้าตรง ขนาด 1 นิ้ว', ...docs.PHOTO }]
          : []),
        ...(docs.TRANSCRIPT
          ? [
              {
                docType: 'TRANSCRIPT',
                title: 'เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน',
                ...docs.TRANSCRIPT,
              },
            ]
          : []),
        ...(docs.ID_HOUSE
          ? [
              {
                docType: 'ID_HOUSE',
                title: 'สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน',
                ...docs.ID_HOUSE,
              },
            ]
          : []),
        ...(docs.CERTIFICATE
          ? [
              {
                docType: 'CERTIFICATE',
                title: 'สำเนาเกียรติบัตร / ใบรับรองความสามารถพิเศษ',
                ...docs.CERTIFICATE,
              },
            ]
          : []),
      ];

      const payload = {
        ...formData,
        documents: documentsPayload,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการบันทึกใบสมัคร');
      }

      setSubmitSuccess({
        applicationNo: result.applicationNo,
        trackingCode: result.trackingCode,
        applicationId: result.applicationId,
      });
    } catch (err: any) {
      alert(err.message || 'ส่งใบสมัครไม่สำเร็จ โปรดตรวจสอบข้อมูลอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMaster) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">กำลังโหลดระบบแบบฟอร์มรับสมัคร...</p>
      </div>
    );
  }

  // Submission Success Screen
  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
              บันทึกข้อมูลและส่งใบสมัครสำเร็จ
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
            </h2>
            <p className="text-slate-600 text-sm">
              ได้รับข้อมูลการสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา) ประจำปีการศึกษา{' '}
              {academicYear} เรียบร้อยแล้ว
            </p>
          </div>

          {/* Key Reference Codes Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-xs text-slate-500 font-medium">เลขที่ใบสมัคร (Application No)</span>
              <span className="font-mono font-bold text-blue-900 text-lg">
                {submitSuccess.applicationNo}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-xs text-slate-500 font-medium">รหัสติดตามใบสมัคร (Tracking Code)</span>
              <span className="font-mono font-bold text-amber-600 text-lg tracking-wider">
                {submitSuccess.trackingCode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">ชื่อผู้สมัคร</span>
              <span className="font-medium text-slate-900 text-sm">
                {formData.prefix}
                {formData.firstName} {formData.lastName}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 text-left max-w-lg mx-auto leading-relaxed">
            <p className="font-semibold mb-1">คำแนะนำสำคัญ:</p>
            <p>
              1. โปรดบันทึกภาพหน้าจอนี้ หรือจดจำ <b>เลขที่ใบสมัคร</b> และ <b>รหัสติดตาม</b>{' '}
              เพื่อใช้ในการตรวจสอบสถานะ
            </p>
            <p>
              2. ท่านสามารถกดปุ่ม <b>"พิมพ์ใบสมัคร PDF"</b> เพื่อพิมพ์เอกสารใบสมัครตามแบบฟอร์มต้นฉบับ
            </p>
            <p>
              3. เจ้าหน้าที่จะดำเนินการตรวจสอบเอกสารของท่านภายใน 1-2 วันทำการ
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/print/application/${submitSuccess.applicationId}`}
              target="_blank"
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>พิมพ์ใบสมัครทางการ (PDF)</span>
            </Link>

            <Link
              href={`/status?code=${submitSuccess.trackingCode}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-blue-700" />
              <span>ไปที่หน้าตรวจสอบสถานะ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Official Header matching original form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200">
          <GraduationCap className="w-4 h-4 text-amber-600" />
          <span>แบบฟอร์มดิจิทัลตามเอกสารต้นฉบับทางการ</span>
        </div>
        <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
          ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)
        </h1>
        <p className="font-medium text-slate-800 text-base">
          วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
        </p>
        <p className="text-sm text-slate-500 font-medium">
          ประจำปีการศึกษา {academicYear}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-3">
        <div className="flex justify-between items-center text-xs font-medium text-slate-500">
          <span>ขั้นตอนที่ {currentStep} จาก {totalSteps}</span>
          <span className="text-blue-900 font-semibold">
            {currentStep === 1 && '1. ข้อมูลส่วนตัว & รูปถ่าย'}
            {currentStep === 2 && '2. ข้อมูลครอบครัว (บิดา-มารดา)'}
            {currentStep === 3 && '3. ที่อยู่ปัจจุบัน'}
            {currentStep === 4 && '4. ประวัติการศึกษา'}
            {currentStep === 5 && '5. ความประสงค์เลือกสาขาวิชา'}
            {currentStep === 6 && '6. อัปโหลดเอกสารหลักฐาน'}
            {currentStep === 7 && '7. ลงนาม & ยืนยันใบสมัคร'}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-900 to-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        {/* STEP 1: Level & Personal Info & 1-inch Photo */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Level selection */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                  ★
                </span>
                ระดับการศึกษาที่สมัคร
              </h3>
              <p className="text-xs text-slate-500">
                ให้ผู้สมัครเลือกได้ 1 รายการตามคุณวุฒิการศึกษาเดิม:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleSelectLevel(lvl)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      formData.levelId === lvl.id
                        ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {lvl.category}
                        </span>
                        <input
                          type="radio"
                          name="levelId"
                          checked={formData.levelId === lvl.id}
                          onChange={() => handleSelectLevel(lvl)}
                          className="h-4 w-4 text-blue-900 border-slate-300 focus:ring-blue-900"
                        />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{lvl.name}</h4>
                    </div>
                  </button>
                ))}
              </div>
              {errors.levelId && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.levelId}
                </p>
              )}
            </div>

            {/* 1-inch Photo upload with preview */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-display font-semibold text-slate-900 text-base">
                รูปถ่ายหน้าตรง ขนาด 1 นิ้ว (สำหรับติดใบสมัคร)
              </h4>
              <p className="text-xs text-slate-500">
                สวมเครื่องแบบนักเรียน/นักศึกษา หรือชุดสุภาพ หน้าตรง ไม่สวมหมวก ไม่สวมแว่นตาดำ
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-28 h-36 bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0 relative group">
                  {docs.PHOTO?.fileUrl ? (
                    <img
                      src={docs.PHOTO.fileUrl}
                      alt="1-inch Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <User className="w-10 h-10 mx-auto mb-1 text-slate-400" />
                      <span className="text-[11px] block">รูปถ่าย 1 นิ้ว</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-medium transition shadow-sm">
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>เลือกไฟล์รูปถ่าย</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => handleFileUpload(e, 'PHOTO')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB (แสดงตัวอย่างก่อนบันทึก)
                  </p>
                  {docs.PHOTO && (
                    <button
                      type="button"
                      onClick={() => removeDoc('PHOTO')}
                      className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> ลบรูปภาพนี้
                    </button>
                  )}
                  {errors.photo && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.photo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ข้อ 1 ข้อมูลส่วนตัวผู้สมัคร */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                  1
                </span>
                ข้อ 1 ข้อมูลส่วนตัวผู้สมัคร
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    คำนำหน้าชื่อ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อจริง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="เช่น สมศักดิ์"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="เช่น มั่นคง"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>
                  )}
                </div>

                {/* Citizen ID */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    เลขประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="citizenId"
                    maxLength={13}
                    value={formData.citizenId}
                    onChange={handleChange}
                    placeholder="เลขบัตรประชาชน 13 หลัก"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono tracking-wider"
                  />
                  {formData.citizenId.length === 13 && (
                    <p
                      className={`text-[11px] mt-1 ${
                        validateThaiCitizenId(formData.citizenId)
                          ? 'text-emerald-600 font-medium'
                          : 'text-rose-600 font-medium'
                      }`}
                    >
                      {validateThaiCitizenId(formData.citizenId)
                        ? '✓ รูปแบบเลขบัตรประชาชนถูกต้องตาม Checksum'
                        : '✗ เลขบัตรประชาชนไม่ถูกต้องตามหลักการคำนวณ Checksum'}
                    </p>
                  )}
                  {errors.citizenId && (
                    <p className="text-xs text-rose-600 mt-1">{errors.citizenId}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    หมายเลขโทรศัพท์ (10 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="เช่น 0812345678"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono"
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Birthday - Separated Day, Month, Year */}
                <div className="sm:col-span-12">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    วัน เดือน ปีเกิด (พ.ศ.) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <select
                        name="birthDay"
                        value={formData.birthDay}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            วันที่ {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        name="birthMonth"
                        value={formData.birthMonth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      >
                        {THAI_MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        name="birthYear"
                        value={formData.birthYear}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      >
                        {Array.from({ length: 30 }, (_, i) => 2560 - i).map((y) => (
                          <option key={y} value={y}>
                            พ.ศ. {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="sm:col-span-12">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    อีเมล (Email) (ถ้ามี)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="เช่น applicant@email.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Parents Information */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* ข้อ 2 ข้อมูลบิดา */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                  2
                </span>
                ข้อ 2 ข้อมูลบิดา
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อ-สกุลบิดา <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="เช่น นายประดิษฐ์ เจริญสุข"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.fatherName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.fatherName}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    อายุ (ปี) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="fatherAge"
                    min={20}
                    max={100}
                    value={formData.fatherAge}
                    onChange={handleChange}
                    placeholder="เช่น 48"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.fatherAge && (
                    <p className="text-xs text-rose-600 mt-1">{errors.fatherAge}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    อาชีพ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherJob"
                    value={formData.fatherJob}
                    onChange={handleChange}
                    placeholder="เช่น พนักงานบริษัท / รับจ้าง"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.fatherJob && (
                    <p className="text-xs text-rose-600 mt-1">{errors.fatherJob}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ข้อ 3 ข้อมูลมารดา */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                  3
                </span>
                ข้อ 3 ข้อมูลมารดา
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อ-สกุลมารดา <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="เช่น นางวันดี เจริญสุข"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.motherName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.motherName}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    อายุ (ปี) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="motherAge"
                    min={20}
                    max={100}
                    value={formData.motherAge}
                    onChange={handleChange}
                    placeholder="เช่น 45"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.motherAge && (
                    <p className="text-xs text-rose-600 mt-1">{errors.motherAge}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    อาชีพ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="motherJob"
                    value={formData.motherJob}
                    onChange={handleChange}
                    placeholder="เช่น ค้าขาย / ข้าราชการ"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                  {errors.motherJob && (
                    <p className="text-xs text-rose-600 mt-1">{errors.motherJob}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Address */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                4
              </span>
              ข้อ 4 ที่อยู่ปัจจุบันที่สามารถติดต่อได้ (ครบทุกช่องตามแบบฟอร์มต้นฉบับ)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  บ้านเลขที่ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  placeholder="เช่น 124/5"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
                {errors.houseNo && (
                  <p className="text-xs text-rose-600 mt-1">{errors.houseNo}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">หมู่ที่</label>
                <input
                  type="text"
                  name="moo"
                  value={formData.moo}
                  onChange={handleChange}
                  placeholder="เช่น 3"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">ซอย</label>
                <input
                  type="text"
                  name="soi"
                  value={formData.soi}
                  onChange={handleChange}
                  placeholder="เช่น ร่วมใจ 2 หรือ -"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">ถนน</label>
                <input
                  type="text"
                  name="road"
                  value={formData.road}
                  onChange={handleChange}
                  placeholder="เช่น พหลโยธิน หรือ -"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ตำบล / แขวง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subdistrict"
                  value={formData.subdistrict}
                  onChange={handleChange}
                  placeholder="เช่น บ้านหมอ"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
                {errors.subdistrict && (
                  <p className="text-xs text-rose-600 mt-1">{errors.subdistrict}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  อำเภอ / เขต <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="เช่น บ้านหมอ"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
                {errors.district && (
                  <p className="text-xs text-rose-600 mt-1">{errors.district}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  จังหวัด <span className="text-rose-500">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                >
                  {THAI_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="text-xs text-rose-600 mt-1">{errors.province}</p>
                )}
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รหัสไปรษณีย์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  maxLength={5}
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="เช่น 18130"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono"
                />
                {errors.postalCode && (
                  <p className="text-xs text-rose-600 mt-1">{errors.postalCode}</p>
                )}
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  หมายเลขโทรศัพท์ที่ติดต่อได้ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="เช่น 0812345678"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Current Education */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                5
              </span>
              ข้อ 5 ข้อมูลการศึกษาปัจจุบัน (รองรับทั้ง ปวช. และ ปวส.)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  กำลังศึกษาอยู่ในระดับชั้น <span className="text-rose-500">*</span>
                </label>
                <select
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                >
                  <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                  <option value="ปวช.3">ประกาศนียบัตรวิชาชีพ ปี 3 (ปวช.3)</option>
                  <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                  <option value="กศน./เทียบเท่า">กศน. หรือคุณวุฒิเทียบเท่า</option>
                </select>
                {errors.currentLevel && (
                  <p className="text-xs text-rose-600 mt-1">{errors.currentLevel}</p>
                )}
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อโรงเรียนหรือสถานศึกษา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="เช่น โรงเรียนบ้านหมอ 'พัฒนานุกูล'"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
                {errors.schoolName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.schoolName}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">ตั้งอยู่เลขที่</label>
                <input
                  type="text"
                  name="schoolAddressNo"
                  value={formData.schoolAddressNo}
                  onChange={handleChange}
                  placeholder="เช่น 55 หรือ -"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">ตำบล</label>
                <input
                  type="text"
                  name="schoolSubdistrict"
                  value={formData.schoolSubdistrict}
                  onChange={handleChange}
                  placeholder="เช่น บ้านหมอ"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">อำเภอ</label>
                <input
                  type="text"
                  name="schoolDistrict"
                  value={formData.schoolDistrict}
                  onChange={handleChange}
                  placeholder="เช่น บ้านหมอ"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  จังหวัด <span className="text-rose-500">*</span>
                </label>
                <select
                  name="schoolProvince"
                  value={formData.schoolProvince}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                >
                  {THAI_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {errors.schoolProvince && (
                  <p className="text-xs text-rose-600 mt-1">{errors.schoolProvince}</p>
                )}
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ผลการเรียนเฉลี่ยสะสม (GPAX 5 ภาคเรียน) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  name="gpax"
                  value={formData.gpax}
                  onChange={handleChange}
                  placeholder="เช่น 3.50"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono"
                />
                {errors.gpax && (
                  <p className="text-xs text-rose-600 mt-1">{errors.gpax}</p>
                )}
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  สาขาวิชาเดิม หรือ แผนการเรียน
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="เช่น วิทย์-คณิต หรือ ช่างไฟฟ้ากำลัง"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Department Preferences */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                6
              </span>
              ข้อ 6 ความประสงค์ในการสมัครเข้าศึกษา
            </h3>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
              <p className="font-semibold mb-1">
                ระดับที่สมัครปัจจุบัน: {levels.find((l) => l.id === formData.levelId)?.name}
              </p>
              {formData.levelCode === 'PVC' ? (
                <p>
                  ระดับ ปวช. กำหนดให้เลือกสาขาวิชาที่ประสงค์เข้าศึกษา <b>ลำดับที่ 1</b> และ{' '}
                  <b>ลำดับที่ 2 (สำรอง)</b>
                </p>
              ) : (
                <p>
                  ระดับ ปวส. กำหนดให้เลือก <b>1 สาขาวิชา</b> ที่ต้องการศึกษาต่อ
                </p>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  {formData.levelCode === 'PVC'
                    ? 'สาขาวิชาที่ต้องการสมัคร (ลำดับที่ 1)'
                    : 'สาขาวิชาที่ต้องการสมัคร'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  name="primaryDeptId"
                  value={formData.primaryDeptId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                >
                  <option value="">-- กรุณาเลือกสาขาวิชา --</option>
                  {filteredDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} (เป้าหมายรับโควตา: {dept.quotaTarget} คน)
                    </option>
                  ))}
                </select>
                {errors.primaryDeptId && (
                  <p className="text-xs text-rose-600 mt-1">{errors.primaryDeptId}</p>
                )}
              </div>

              {formData.levelCode === 'PVC' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    สาขาวิชาที่ต้องการสมัคร (ลำดับที่ 2 - สำรอง){' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="secondaryDeptId"
                    value={formData.secondaryDeptId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                  >
                    <option value="">-- กรุณาเลือกสาขาวิชาสำรองลำดับที่ 2 --</option>
                    {filteredDepartments.map((dept) => (
                      <option
                        key={dept.id}
                        value={dept.id}
                        disabled={dept.id === formData.primaryDeptId}
                      >
                        {dept.name} {dept.id === formData.primaryDeptId ? '(เลือกในลำดับ 1 แล้ว)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.secondaryDeptId && (
                    <p className="text-xs text-rose-600 mt-1">{errors.secondaryDeptId}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Required Documents */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                📄
              </span>
              ส่วนหลักฐานประกอบการสมัคร (ตามแบบฟอร์มต้นฉบับ)
            </h3>
            <p className="text-xs text-slate-500">
              แนบไฟล์เอกสารหลักฐาน รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 8MB ต่อไฟล์
            </p>

            <div className="space-y-4">
              {/* Doc 1: Transcript 5 Semesters */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <h5 className="font-semibold text-slate-900 text-sm">
                      เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน (ปพ.1){' '}
                      <span className="text-rose-500">*</span>
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">จำนวน 1 ฉบับ (แสดงตราประทับชัดเจน)</p>
                  {docs.TRANSCRIPT && (
                    <p className="text-xs text-emerald-600 font-medium pl-7 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> แนบไฟล์แล้ว: {docs.TRANSCRIPT.fileName} (
                      {(docs.TRANSCRIPT.fileSize / 1024).toFixed(0)} KB)
                    </p>
                  )}
                  {errors.transcript && (
                    <p className="text-xs text-rose-600 pl-7">{errors.transcript}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-medium transition shadow-sm flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-900" />
                    <span>{docs.TRANSCRIPT ? 'เปลี่ยนไฟล์' : 'อัปโหลดไฟล์'}</span>
                    <input
                      type="file"
                      accept=".pdf, image/jpeg, image/png, image/jpg"
                      onChange={(e) => handleFileUpload(e, 'TRANSCRIPT')}
                      className="hidden"
                    />
                  </label>
                  {docs.TRANSCRIPT && (
                    <button
                      type="button"
                      onClick={() => removeDoc('TRANSCRIPT')}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Doc 2: ID Card / House Registration */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <h5 className="font-semibold text-slate-900 text-sm">
                      สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน{' '}
                      <span className="text-rose-500">*</span>
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    จำนวน 1 ฉบับ (พร้อมลงชื่อรับรองสำเนาถูกต้อง)
                  </p>
                  {docs.ID_HOUSE && (
                    <p className="text-xs text-emerald-600 font-medium pl-7 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> แนบไฟล์แล้ว: {docs.ID_HOUSE.fileName} (
                      {(docs.ID_HOUSE.fileSize / 1024).toFixed(0)} KB)
                    </p>
                  )}
                  {errors.idHouse && (
                    <p className="text-xs text-rose-600 pl-7">{errors.idHouse}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-medium transition shadow-sm flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-900" />
                    <span>{docs.ID_HOUSE ? 'เปลี่ยนไฟล์' : 'อัปโหลดไฟล์'}</span>
                    <input
                      type="file"
                      accept=".pdf, image/jpeg, image/png, image/jpg"
                      onChange={(e) => handleFileUpload(e, 'ID_HOUSE')}
                      className="hidden"
                    />
                  </label>
                  {docs.ID_HOUSE && (
                    <button
                      type="button"
                      onClick={() => removeDoc('ID_HOUSE')}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Doc 3: Certificate / Special ability (Optional) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <h5 className="font-semibold text-slate-900 text-sm">
                      สำเนาเกียรติบัตร / ใบรับรองความสามารถพิเศษ / ใบประกาศ{' '}
                      <span className="text-slate-400 font-normal">(ถ้ามี)</span>
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">เอกสารเพิ่มเติม ไม่บังคับ</p>
                  {docs.CERTIFICATE && (
                    <p className="text-xs text-emerald-600 font-medium pl-7 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> แนบไฟล์แล้ว: {docs.CERTIFICATE.fileName} (
                      {(docs.CERTIFICATE.fileSize / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-medium transition shadow-sm flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-900" />
                    <span>{docs.CERTIFICATE ? 'เปลี่ยนไฟล์' : 'อัปโหลดไฟล์'}</span>
                    <input
                      type="file"
                      accept=".pdf, image/jpeg, image/png, image/jpg"
                      onChange={(e) => handleFileUpload(e, 'CERTIFICATE')}
                      className="hidden"
                    />
                  </label>
                  {docs.CERTIFICATE && (
                    <button
                      type="button"
                      onClick={() => removeDoc('CERTIFICATE')}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Signature, Review & Submission */}
        {currentStep === 7 && (
          <div className="space-y-8">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">
                ✍
              </span>
              ส่วนลงชื่อผู้สมัคร & ยืนยันความถูกต้อง
            </h3>

            {/* Applicant Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-xs text-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm mb-2">สรุปข้อมูลการสมัคร:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <b>ชื่อ-นามสกุล:</b> {formData.prefix}
                  {formData.firstName} {formData.lastName}
                </p>
                <p>
                  <b>เลขประจำตัวประชาชน:</b> {formatCitizenId(formData.citizenId)}
                </p>
                <p>
                  <b>ระดับการศึกษา:</b> {levels.find((l) => l.id === formData.levelId)?.name}
                </p>
                <p>
                  <b>สาขาวิชาลำดับที่ 1:</b>{' '}
                  {departments.find((d) => d.id === formData.primaryDeptId)?.name}
                </p>
                {formData.secondaryDeptId && (
                  <p>
                    <b>สาขาวิชาลำดับที่ 2:</b>{' '}
                    {departments.find((d) => d.id === formData.secondaryDeptId)?.name}
                  </p>
                )}
                <p>
                  <b>ผลการเรียนเฉลี่ย (GPAX):</b> {parseFloat(formData.gpax).toFixed(2)}
                </p>
                <p>
                  <b>สถานศึกษาเดิม:</b> {formData.schoolName} ({formData.schoolProvince})
                </p>
                <p>
                  <b>เบอร์โทรศัพท์:</b> {formData.phone}
                </p>
              </div>
            </div>

            {/* Electronic Signature Canvas Pad */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-800">
                  ลายเซ็นอิเล็กทรอนิกส์ผู้สมัคร (Digital Signature)
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ล้างลายเซ็น
                </button>
              </div>

              <div className="border-2 border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner flex items-center justify-center p-2">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="touch-none w-full max-w-full h-36 bg-slate-50/50 cursor-crosshair rounded-xl border border-slate-200"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                ใช้เมาส์หรือนิ้ววาดลายเซ็นบนพื้นที่ด้านบน (จะนำไปแสดงในใบสมัครทางการ PDF)
              </p>
            </div>

            {/* Signer name in parentheses & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ-สกุลผู้สมัคร (ในวงเล็บ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="signerName"
                  value={formData.signerName || `${formData.prefix}${formData.firstName} ${formData.lastName}`}
                  onChange={handleChange}
                  placeholder="เช่น นายกฤษณะ เจริญสุข"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
                {errors.signerName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.signerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  วันที่ลงนาม (วัน เดือน พ.ศ.)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="signDateDay"
                    value={formData.signDateDay}
                    onChange={handleChange}
                    className="w-full px-2 py-2 text-sm rounded-xl border border-slate-300 text-center"
                  />
                  <input
                    type="text"
                    name="signDateMonth"
                    value={formData.signDateMonth}
                    onChange={handleChange}
                    className="w-full px-2 py-2 text-sm rounded-xl border border-slate-300 text-center"
                  />
                  <input
                    type="text"
                    name="signDateYear"
                    value={formData.signDateYear}
                    onChange={handleChange}
                    className="w-full px-2 py-2 text-sm rounded-xl border border-slate-300 text-center"
                  />
                </div>
              </div>
            </div>

            {/* PDPA Consent Checkbox */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="checkbox"
                  name="consentPdpa"
                  checked={formData.consentPdpa}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900 mt-0.5"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  ข้าพเจ้าขอรับรองว่าข้อความและหลักฐานทั้งหมดที่ระบุในใบสมัครนี้เป็นความจริงทุกประการ
                  และยินยอมให้วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
                  จัดเก็บและประมวลผลข้อมูลส่วนบุคคลเพื่อประโยชน์ในการคัดเลือกเข้าศึกษาต่อตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                  (PDPA)
                </span>
              </label>
              {errors.consentPdpa && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.consentPdpa}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังส่งใบสมัคร...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>ยืนยันและส่งใบสมัคร</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
