import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCitizenId, formatPhone } from '@/lib/validation';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PrintEnrollmentPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      applicant: true,
      academicYear: true,
      level: true,
      primaryDept: true,
      address: true,
      enrollment: true,
    },
  });

  if (!application) {
    notFound();
  }

  const { applicant, level, primaryDept, address, enrollment } = application;

  return (
    <div className="bg-slate-100 min-h-screen py-6 print:py-0 print:bg-white text-black">
      {/* Top Action Bar */}
      <div className="max-w-[210mm] mx-auto mb-4 px-4 flex justify-between items-center no-print">
        <Link
          href={`/status?code=${application.trackingCode}`}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
        </Link>
        <button
          onClick={() => {}}
          // @ts-ignore
          className="px-5 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow hover:bg-emerald-700 transition flex items-center gap-1.5"
          id="print-enrollment-btn"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>สั่งพิมพ์ใบมอบตัว (A4) / บันทึก PDF</span>
        </button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-enrollment-btn')?.addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />

      {/* Official A4 Document Page */}
      <div className="max-w-[210mm] mx-auto bg-white p-12 shadow-md print:shadow-none print:p-0 border border-slate-300 print:border-none font-sans text-[13px] leading-relaxed text-black print-page space-y-5">
        <div className="text-center space-y-1 border-b border-black pb-4">
          <img
            src="/logo.png"
            alt="ตราวิทยาลัย"
            className="w-16 h-16 mx-auto mb-1.5 object-contain"
          />
          <h1 className="font-bold text-lg">วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์</h1>
          <h2 className="font-bold text-base">
            เอกสารการรายงานตัวและมอบตัวเข้าเป็นนักเรียน นักศึกษาใหม่
          </h2>
          <p className="text-xs font-semibold">
            ประจำปีการศึกษา {application.academicYear.year} (รอบโควตา)
          </p>
        </div>

        {/* Student ID Banner */}
        <div className="flex justify-between items-center p-3 bg-slate-50 border border-black">
          <div>
            <span className="text-xs text-slate-600 block">เลขที่ใบสมัคร: {application.applicationNo}</span>
            <span className="text-xs text-slate-600 block">รหัสติดตาม: {application.trackingCode}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-600 block font-semibold">รหัสประจำตัวนักศึกษาใหม่:</span>
            <span className="text-base font-mono font-bold text-blue-900">
              {enrollment?.studentId || '6830104XXXX'}
            </span>
          </div>
        </div>

        {/* 1. Student Details */}
        <div className="border border-black">
          <div className="bg-slate-100 px-3 py-1 font-bold text-xs border-b border-black">
            1. ข้อมูลนักศึกษา
          </div>
          <div className="p-3 space-y-1.5 text-xs">
            <p>
              ชื่อ-นามสกุล: <b>{applicant.fullName}</b> | เลขประจำตัวประชาชน:{' '}
              <b className="font-mono">{formatCitizenId(applicant.citizenId)}</b>
            </p>
            <p>
              ระดับการศึกษา: <b>{level.name}</b> | สาขาวิชา:{' '}
              <b>{primaryDept.name}</b>
            </p>
            <p>
              ที่อยู่ปัจจุบัน: บ้านเลขที่ {address?.houseNo} หมู่ {address?.moo || '-'} ต.{address?.subdistrict} อ.{address?.district} จ.{address?.province} {address?.postalCode}
            </p>
            <p>หมายเลขโทรศัพท์: {formatPhone(applicant.phone)}</p>
          </div>
        </div>

        {/* 2. Guardian & Witness Details */}
        <div className="border border-black">
          <div className="bg-slate-100 px-3 py-1 font-bold text-xs border-b border-black">
            2. ข้อมูลผู้ปกครองและพยานการมอบตัว
          </div>
          <div className="p-3 space-y-1.5 text-xs">
            <p>
              ชื่อ-นามสกุลผู้ปกครอง: <b>{enrollment?.guardianName || applicant.fullName}</b>
            </p>
            <div className="flex justify-between">
              <span>ความสัมพันธ์: <b>{enrollment?.guardianRelation || 'ผู้ปกครอง'}</b></span>
              <span>หมายเลขโทรศัพท์: <b>{formatPhone(enrollment?.guardianPhone || applicant.phone)}</b></span>
            </div>
            <p>
              พยานการมอบตัว: <b>{enrollment?.witnessName || 'อาจารย์ที่ปรึกษา / หัวหน้าแผนกวิชา'}</b>
            </p>
          </div>
        </div>

        {/* 3. Commitment Statement */}
        <div className="p-3 border border-black text-xs leading-relaxed bg-slate-50/50">
          <p className="font-bold mb-1">คำปฏิญาณและข้อตกลงการศึกษา:</p>
          <p>
            ข้าพเจ้าขอสัญญาว่าจะปฏิบัติตามกฎระเบียบ ข้อบังคับ และวินัยของวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ อย่างเคร่งครัด
            ตั้งใจศึกษาเล่าเรียน และรักษาเกียรติยศชื่อเสียงของสถานศึกษา โดยมีผู้ปกครองให้การรับรอง
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 pt-4 text-center text-xs">
          <div className="p-3 border border-black space-y-8">
            <p className="font-semibold">ลงชื่อนักศึกษา</p>
            <div className="pt-6">
              <p>ลงชื่อ ..............................................................</p>
              <p className="mt-1">({applicant.fullName})</p>
            </div>
          </div>

          <div className="p-3 border border-black space-y-8">
            <p className="font-semibold">ลงชื่อผู้ปกครอง</p>
            <div className="pt-6">
              <p>ลงชื่อ ..............................................................</p>
              <p className="mt-1">({enrollment?.guardianName || 'ผู้ปกครอง'})</p>
            </div>
          </div>

          <div className="p-3 border border-black space-y-8">
            <p className="font-semibold">ลงชื่อพยาน</p>
            <div className="pt-6">
              <p>ลงชื่อ ..............................................................</p>
              <p className="mt-1">({enrollment?.witnessName || 'พยาน'})</p>
            </div>
          </div>

          <div className="p-3 border border-black space-y-8">
            <p className="font-semibold">ลงชื่อนายทะเบียน / เจ้าหน้าที่รับมอบตัว</p>
            <div className="pt-6">
              <p>ลงชื่อ ..............................................................</p>
              <p className="mt-1">(..............................................................)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
