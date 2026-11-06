import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  GraduationCap,
  FileCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [academicYear, levels, departments, countApps] = await Promise.all([
    prisma.academicYear.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' },
    }),
    prisma.admissionLevel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      include: { level: true },
      orderBy: [{ levelId: 'asc' }, { sortOrder: 'asc' }],
    }),
    prisma.application.count(),
  ]);

  const yearDisplay = academicYear ? academicYear.year : '2570';

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 border-b border-blue-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center mb-1">
              <img
                src="/logo.png"
                alt="ตราวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl hover:scale-105 transition-transform"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>เปิดระบบรับสมัครนักเรียน นักศึกษาใหม่ รอบโควตา ประจำปีการศึกษา {yearDisplay}</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-5xl tracking-tight text-white leading-tight">
              วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
              ระบบรับสมัครนักเรียน นักศึกษาออนไลน์ รอบโควตากรณีพิเศษ
              ระดับประกาศนียบัตรวิชาชีพ (ปวช.) และระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)
              เปิดโอกาสสู่อนาคตวิชาชีพและวิศวกรรมเทคโนโลยีชั้นนำ
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/apply"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-base"
              >
                <GraduationCap className="w-5 h-5" />
                <span>สมัครเรียนออนไลน์ (โควตา {yearDisplay})</span>
              </Link>

              <Link
                href="/status"
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl border border-white/20 backdrop-blur transition-all flex items-center justify-center gap-2 text-base"
              >
                <FileCheck className="w-5 h-5 text-blue-300" />
                <span>ตรวจสอบสถานะการสมัคร</span>
              </Link>
            </div>

            {/* Live Counter Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ไม่ต้องเดินทางมายื่นเอกสารที่วิทยาลัย</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>รู้ผลการตรวจเอกสารผ่านระบบออนไลน์</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ดาวน์โหลดใบสมัครและใบมอบตัว PDF ได้ทันที</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Fast Tracks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">1. กรอกข้อมูลใบสมัคร</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              กรอกข้อมูลส่วนตัว ประวัติครอบครัว ประวัติการศึกษา และเลือกสาขาวิชาที่ต้องการศึกษาต่อได้สะดวกทั้งบนมือถือและคอมพิวเตอร์
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">2. แนบเอกสารหลักฐาน</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              แนบรูปถ่าย 1 นิ้ว, ใบ ปพ.1 หรือผลการเรียน 5 ภาคเรียน, สำเนาบัตรประชาชน/ทะเบียนบ้าน ผ่านระบบ รองรับไฟล์ภาพและ PDF
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">3. ติดตามผล & พิมพ์เอกสาร</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              ตรวจสอบสถานะการอนุมัติเอกสาร ผลการคัดเลือก พร้อมพิมพ์ใบสมัครทางการและใบมอบตัว PDF ได้โดยตรงจากระบบ
            </p>
          </div>
        </div>
      </section>

      {/* Levels & Available Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-blue-900 text-xs font-bold tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            หลักสูตรที่เปิดรับสมัคร
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-3">
            ระดับการศึกษาและสาขาวิชาที่เปิดรับ ประจำปี {yearDisplay}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            เลือกศึกษาต่อในสาขาช่างอุตสาหกรรม เทคโนโลยีสารสนเทศ และบริหารธุรกิจ กับมาตรฐานวิชาชีพชั้นนำ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {levels.map((lvl) => {
            const deptsForLevel = departments.filter((d) => d.levelId === lvl.id);
            return (
              <div
                key={lvl.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-400 transition"
              >
                <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {lvl.category}
                    </span>
                    <span className="text-xs text-blue-200">{deptsForLevel.length} สาขาวิชา</span>
                  </div>
                  <h3 className="font-display font-bold text-xl mt-3 text-white">{lvl.name}</h3>
                  <p className="text-xs text-blue-200 mt-1">
                    {lvl.code === 'PVC'
                      ? 'สำหรับผู้สำเร็จการศึกษาชั้น ม.3 หรือเทียบเท่า'
                      : lvl.code === 'PVS_DIRECT'
                      ? 'สำหรับผู้สำเร็จการศึกษาระดับ ปวช. ตรงสาขาวิชา'
                      : 'สำหรับผู้สำเร็จการศึกษา ม.6 หรือ ปวช. ต่างสาขา'}
                  </p>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      สาขาวิชาที่เปิดรับ:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {deptsForLevel.map((dept) => (
                        <li key={dept.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                          <span className="font-medium text-slate-800">{dept.name}</span>
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            รับ {dept.quotaTarget} คน
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/apply?level=${lvl.code}`}
                    className="mt-4 w-full py-2.5 bg-blue-50 hover:bg-blue-900 text-blue-900 hover:text-white font-medium text-xs rounded-xl border border-blue-200 hover:border-transparent transition flex items-center justify-center gap-1.5"
                  >
                    <span>สมัครระดับนี้</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Admission Timeline & Documents Checklist */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Timeline */}
            <div className="space-y-6">
              <span className="text-blue-900 text-xs font-bold tracking-wider uppercase bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                กำหนดการรับสมัคร
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                ขั้นตอนและกำหนดการสำคัญ รอบโควตา {yearDisplay}
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">ยื่นใบสมัครออนไลน์ผ่านเว็บไซต์</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      กรอกข้อมูลตามแบบฟอร์มต้นฉบับ อัปโหลดรูปถ่าย และหลักฐานให้ครบถ้วน
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">เจ้าหน้าที่ตรวจสอบความถูกต้องของเอกสาร</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      เจ้าหน้าที่งานรับสมัครตรวจสอบคุณสมบัติและเอกสาร หากเอกสารไม่ชัดเจน สามารถแก้ไขได้ผ่านหน้าตรวจสอบสถานะ
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">ประกาศรายชื่อผู้ผ่านการคัดเลือก</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ประกาศผลผ่านระบบออนไลน์ ผู้สมัครสามารถตรวจสอบสถานะและพิมพ์ใบสมัครฉบับสมบูรณ์
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">รายงานตัวและมอบตัวเข้าเป็นนักศึกษา</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      พิมพ์เอกสารใบมอบตัวจากระบบพร้อมเตรียมหลักฐานตัวจริงมารายงานตัวตามกำหนดการของวิทยาลัย
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Documents Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-900" />
                หลักฐานที่ต้องเตรียมก่อนกรอกใบสมัคร
              </h3>
              <p className="text-xs text-slate-500">
                เอกสารที่ต้องแนบในระบบตามที่ระบุในแบบฟอร์มใบสมัครต้นฉบับของวิทยาลัย:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-medium text-xs text-slate-900">รูปถ่ายหน้าตรง ขนาด 1 นิ้ว</h5>
                    <p className="text-[11px] text-slate-500">ชุดนักเรียน/นักศึกษา หน้าตรง ไม่สวมหมวก ไม่สวมแว่นตาดำ</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-medium text-xs text-slate-900">เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน (ปพ.1)</h5>
                    <p className="text-[11px] text-slate-500">จำนวน 1 ฉบับ (แสดงตราประทับโรงเรียนชัดเจน)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-medium text-xs text-slate-900">สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน</h5>
                    <p className="text-[11px] text-slate-500">จำนวน 1 ฉบับ พร้อมลงชื่อรับรองสำเนาถูกต้อง</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <div>
                    <h5 className="font-medium text-xs text-slate-900">เกียรติบัตร / ใบรับรองความสามารถพิเศษ (ถ้ามี)</h5>
                    <p className="text-[11px] text-slate-500">เอกสารเพิ่มเติมเพื่อประกอบการพิจารณาโควตาพิเศษ</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/apply"
                  className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-xl text-center block text-sm transition shadow-sm"
                >
                  เริ่มกรอกใบสมัครออนไลน์ทันที
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College Info & Security */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>ความปลอดภัยและความเป็นส่วนตัวของข้อมูล (PDPA)</span>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              มั่นใจในระบบรับสมัครที่โปร่งใสและปลอดภัย
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              ข้อมูลส่วนบุคคลและเอกสารหลักฐานของท่านจะถูกจัดเก็บและใช้เพื่อการคัดเลือกเข้าศึกษาต่อเท่านั้น
              มีระบบปกปิดเลขประจำตัวประชาชน และระบบเข้าถึงข้อมูลเฉพาะเจ้าหน้าที่ที่ได้รับมอบหมาย
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/apply"
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition text-center"
            >
              ยื่นใบสมัครออนไลน์
            </Link>
            <Link
              href="/status"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition text-center border border-white/20"
            >
              ตรวจสอบสถานะ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
