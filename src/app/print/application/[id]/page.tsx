import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCitizenId, formatPhone } from '@/lib/validation';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PrintApplicationPage({
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
      secondaryDept: true,
      parentInfo: true,
      address: true,
      education: true,
      documents: true,
    },
  });

  if (!application) {
    notFound();
  }

  const { applicant, parentInfo, address, education, level, primaryDept, secondaryDept } = application;

  return (
    <div className="bg-slate-100 min-h-screen py-6 print:py-0 print:bg-white text-black">
      {/* Action Bar (Hidden when printing) */}
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
          className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold shadow hover:bg-blue-800 transition flex items-center gap-1.5"
          id="print-btn"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>สั่งพิมพ์ใบสมัคร (A4) / บันทึก PDF</span>
        </button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn')?.addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />

      {/* Official A4 Document Page */}
      <div className="max-w-[210mm] mx-auto bg-white p-10 sm:p-12 shadow-md print:shadow-none print:p-0 border border-slate-300 print:border-none font-sans text-[13px] leading-relaxed text-black print-page">
        {/* Document Top Bar with Photo & Application No */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-left space-y-1">
            <span className="inline-block text-[11px] font-semibold text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
              เลขที่ใบสมัคร: <span className="font-mono">{application.applicationNo}</span>
            </span>
            <div className="text-[11px] text-slate-600">
              รหัสติดตาม: <span className="font-mono font-bold">{application.trackingCode}</span>
            </div>
          </div>

          <div className="text-center flex-1 px-4">
            <img
              src="/logo.png"
              alt="ตราวิทยาลัย"
              className="w-16 h-16 mx-auto mb-1.5 object-contain"
            />
            <h1 className="font-bold text-base sm:text-lg tracking-tight">
              ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)
            </h1>
            <h2 className="font-bold text-sm sm:text-base">
              วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
            </h2>
            <h3 className="text-xs font-semibold text-slate-800">
              ประจำปีการศึกษา {application.academicYear.year}
            </h3>
          </div>

          {/* 1-inch Photo Box */}
          <div className="w-24 h-32 border-2 border-dashed border-slate-400 flex items-center justify-center p-1 text-center shrink-0 overflow-hidden bg-slate-50">
            {application.photoUrl ? (
              <img
                src={application.photoUrl}
                alt="รูปถ่ายผู้สมัคร"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-500">
                ติดรูปถ่ายหน้าตรง ขนาด 1 นิ้ว
              </span>
            )}
          </div>
        </div>

        {/* Level Checkboxes (ตามต้นฉบับ) */}
        <div className="border border-black p-2.5 mb-3 bg-slate-50/50">
          <span className="font-bold mr-3">ระดับการศึกษาที่สมัคร:</span>
          <span className="mr-6">
            <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[10px] leading-3 mr-1 align-middle">
              {level.code === 'PVS_DIRECT' ? '✓' : ''}
            </span>
            ระดับ ปวส. (สายตรง)
          </span>
          <span className="mr-6">
            <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[10px] leading-3 mr-1 align-middle">
              {level.code === 'PVS_TRANS' ? '✓' : ''}
            </span>
            ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)
          </span>
          <span>
            <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[10px] leading-3 mr-1 align-middle">
              {level.code === 'PVC' ? '✓' : ''}
            </span>
            ระดับ ปวช.
          </span>
        </div>

        {/* ข้อ 1 ข้อมูลส่วนตัวผู้สมัคร */}
        <div className="border border-black mb-3">
          <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
            ข้อ 1 ข้อมูลส่วนตัวผู้สมัคร
          </div>
          <div className="p-3 space-y-1.5">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <span className="font-semibold">ชื่อ-นามสกุล:</span> {applicant.fullName}
              </div>
              <div className="col-span-4">
                <span className="font-semibold">เกิดวันที่:</span> {applicant.birthDay} {applicant.birthMonth} พ.ศ. {applicant.birthYear}
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <span className="font-semibold">เลขประจำตัวประชาชน:</span>{' '}
                <span className="font-mono font-medium">{formatCitizenId(applicant.citizenId)}</span>
              </div>
              <div className="col-span-5">
                <span className="font-semibold">หมายเลขโทรศัพท์:</span> {formatPhone(applicant.phone)}
              </div>
            </div>
          </div>
        </div>

        {/* ข้อ 2 ข้อมูลบิดา & ข้อ 3 ข้อมูลมารดา */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border border-black">
            <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
              ข้อ 2 ข้อมูลบิดา
            </div>
            <div className="p-2.5 space-y-1 text-xs">
              <p>
                <span className="font-semibold">ชื่อ-สกุลบิดา:</span> {parentInfo?.fatherName || '-'}
              </p>
              <div className="flex justify-between">
                <span>
                  <span className="font-semibold">อายุ:</span> {parentInfo?.fatherAge ? `${parentInfo.fatherAge} ปี` : '-'}
                </span>
                <span>
                  <span className="font-semibold">อาชีพ:</span> {parentInfo?.fatherJob || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-black">
            <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
              ข้อ 3 ข้อมูลมารดา
            </div>
            <div className="p-2.5 space-y-1 text-xs">
              <p>
                <span className="font-semibold">ชื่อ-สกุลมารดา:</span> {parentInfo?.motherName || '-'}
              </p>
              <div className="flex justify-between">
                <span>
                  <span className="font-semibold">อายุ:</span> {parentInfo?.motherAge ? `${parentInfo.motherAge} ปี` : '-'}
                </span>
                <span>
                  <span className="font-semibold">อาชีพ:</span> {parentInfo?.motherJob || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ข้อ 4 ที่อยู่ปัจจุบันที่สามารถติดต่อได้ */}
        <div className="border border-black mb-3">
          <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
            ข้อ 4 ที่อยู่ปัจจุบันที่สามารถติดต่อได้
          </div>
          <div className="p-3 text-xs leading-relaxed">
            <span>บ้านเลขที่ <b>{address?.houseNo || '-'}</b> </span>
            <span>หมู่ที่ <b>{address?.moo || '-'}</b> </span>
            <span>ซอย <b>{address?.soi || '-'}</b> </span>
            <span>ถนน <b>{address?.road || '-'}</b> </span>
            <span>ตำบล/แขวง <b>{address?.subdistrict || '-'}</b> </span>
            <span>อำเภอ/เขต <b>{address?.district || '-'}</b> </span>
            <span>จังหวัด <b>{address?.province || '-'}</b> </span>
            <span>รหัสไปรษณีย์ <b>{address?.postalCode || '-'}</b> </span>
            <span>หมายเลขโทรศัพท์ <b>{address?.phone ? formatPhone(address.phone) : '-'}</b></span>
          </div>
        </div>

        {/* ข้อ 5 ข้อมูลการศึกษาปัจจุบัน */}
        <div className="border border-black mb-3">
          <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
            ข้อ 5 ข้อมูลการศึกษาปัจจุบัน
          </div>
          <div className="p-3 text-xs space-y-1.5">
            <div>
              กำลังศึกษาอยู่ในระดับชั้น <b>{education?.currentLevel}</b> ชื่อโรงเรียนหรือสถานศึกษา <b>{education?.schoolName}</b>
            </div>
            <div>
              ตั้งอยู่เลขที่ <b>{education?.schoolAddressNo || '-'}</b> ตำบล <b>{education?.schoolSubdistrict || '-'}</b> อำเภอ <b>{education?.schoolDistrict || '-'}</b> จังหวัด <b>{education?.schoolProvince}</b>
            </div>
            <div className="flex gap-8 pt-0.5">
              <span>
                ผลการเรียนเฉลี่ยสะสม (GPAX 5 ภาคเรียน): <b className="text-sm font-mono underline">{education?.gpax?.toFixed(2)}</b>
              </span>
              <span>
                สาขาวิชา/แผนการเรียน: <b>{education?.major || '-'}</b>
              </span>
            </div>
          </div>
        </div>

        {/* ข้อ 6 ความประสงค์ในการสมัครเข้าศึกษา */}
        <div className="border border-black mb-3">
          <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
            ข้อ 6 ความประสงค์ในการสมัครเข้าศึกษา
          </div>
          <div className="p-3 text-xs space-y-2">
            {level.category === 'ปวช.' ? (
              <div className="space-y-1.5">
                <p>
                  สาขาวิชาลำดับที่ 1: <b className="text-sm underline">{primaryDept.name}</b>
                </p>
                <p>
                  สาขาวิชาลำดับที่ 2 (สำรอง): <b className="text-sm underline">{secondaryDept?.name || '-'}</b>
                </p>
              </div>
            ) : (
              <p>
                เลือกสาขาวิชาที่ต้องการสมัคร: <b className="text-sm underline">{primaryDept.name}</b>
              </p>
            )}
          </div>
        </div>

        {/* ส่วนหลักฐานประกอบการสมัคร */}
        <div className="border border-black mb-4">
          <div className="bg-slate-200/80 px-3 py-1 font-bold text-xs border-b border-black">
            หลักฐานประกอบการสมัคร (ตามเอกสารต้นฉบับ)
          </div>
          <div className="p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-black text-center text-[10px] leading-3 inline-block">✓</span>
              <span>1. เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน จำนวน 1 ฉบับ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-black text-center text-[10px] leading-3 inline-block">✓</span>
              <span>2. สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน จำนวน 1 ฉบับ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-black text-center text-[10px] leading-3 inline-block">
                {application.documents.some((d) => d.docType === 'CERTIFICATE') ? '✓' : ''}
              </span>
              <span>3. สำเนาเกียรติบัตร / ใบรับรองความสามารถพิเศษ / ใบประกาศ (ถ้ามี)</span>
            </div>
          </div>
        </div>

        {/* ส่วนลงชื่อผู้สมัคร และเจ้าหน้าที่ตรวจสอบ */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* ส่วนลงชื่อผู้สมัคร */}
          <div className="text-center p-3 border border-black flex flex-col justify-between h-44">
            <p className="text-xs font-semibold">ขอรับรองว่าข้อความทั้งหมดเป็นความจริงทุกประการ</p>
            <div className="my-auto flex flex-col items-center">
              {application.signatureData ? (
                <img
                  src={application.signatureData}
                  alt="ลายเซ็นผู้สมัคร"
                  className="h-12 max-w-[180px] object-contain"
                />
              ) : (
                <div className="h-10 border-b border-dotted border-black w-48 mb-1" />
              )}
              <p className="text-xs">
                ลงชื่อ .............................................................. ผู้สมัคร
              </p>
              <p className="text-xs mt-1">
                ({application.signerName || applicant.fullName})
              </p>
            </div>
            <p className="text-xs text-slate-700">
              วันที่ {application.signDateDay || '.....'} เดือน {application.signDateMonth || '.............'} พ.ศ. {application.signDateYear || '2569'}
            </p>
          </div>

          {/* ส่วนเจ้าหน้าที่ตรวจสอบ */}
          <div className="text-center p-3 border border-black flex flex-col justify-between h-44 bg-slate-50/40">
            <p className="text-xs font-semibold">สำหรับเจ้าหน้าที่งานรับสมัครตรวจสอบ</p>
            <div className="text-left text-xs px-2 space-y-1">
              <p>สถานะ: <b>{application.status}</b></p>
              <p>ผลการตรวจสอบ: [ ✓ ] เอกสารครบถ้วนสมบูรณ์</p>
            </div>
            <div className="my-auto">
              <p className="text-xs">
                ลงชื่อ .............................................................. เจ้าหน้าที่
              </p>
              <p className="text-xs mt-1">(..............................................................)</p>
            </div>
            <p className="text-xs text-slate-700">
              วันที่ ............/............/............
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
