import type { Metadata } from 'next';
import { Sarabun, Prompt } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, FileCheck, Phone, MapPin, School, LogIn } from 'lucide-react';

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
});

const prompt = Prompt({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ระบบรับสมัครนักเรียน นักศึกษาออนไลน์ | วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
  description:
    'ระบบรับสมัครนักเรียน นักศึกษาออนไลน์ ระดับ ปวช. และ ปวส. วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา 2570',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable} ${prompt.variable}`}>
      <body className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50 antialiased">
        {/* Top Announcement Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 no-print border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="bg-amber-500 text-slate-950 font-semibold px-2 py-0.5 rounded text-[11px]">
                ปีการศึกษา 2570
              </span>
              <span>ระบบรับสมัครเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา) เปิดรับสมัครแล้ว</span>
            </div>
            <div className="flex items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> งานทะเบียน 036-201655
              </span>
              <span className="text-slate-600">|</span>
              <Link
                href="/admin/login"
                className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium"
              >
                <LogIn className="w-3.5 h-3.5" /> สำหรับเจ้าหน้าที่
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header / Navbar */}
        <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3.5 group">
              <img
                src="/logo.png"
                alt="ตราวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์"
                className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight group-hover:text-blue-900 transition-colors">
                  วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Thaluang Cement Thai Anusorn Technical College • สำนักงานคณะกรรมการการอาชีวศึกษา
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-3">
              <Link
                href="/"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition"
              >
                หน้าแรก
              </Link>
              <Link
                href="/status"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-blue-600" /> ตรวจสอบสถานะการสมัคร
              </Link>
              <Link
                href="/apply"
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm hover:shadow transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" /> สมัครเรียนออนไลน์
              </Link>
            </nav>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-sm mt-16 border-t border-slate-800 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="ตราวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h2 className="font-display font-semibold text-white text-base">
                      วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
                    </h2>
                    <p className="text-xs text-slate-400">ระบบบริหารจัดการการรับสมัครนักเรียน นักศึกษาออนไลน์</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  มุ่งมั่นจัดการศึกษาด้านวิชาชีพ พัฒนาทักษะฝีมือแรงงาน สอดคล้องกับความต้องการของภาคอุตสาหกรรม
                  เปิดสอนทั้งระดับประกาศนียบัตรวิชาชีพ (ปวช.) และประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ระบบได้รับความคุ้มครองตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">ติดต่อวิทยาลัย</h3>
                <ul className="space-y-2 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>เลขที่ 1 หมู่ 6 ถนนท่าหลวง-บ้านหมอ ต.บ้านหมอ อ.บ้านหมอ จ.สระบุรี 18130</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>โทรศัพท์: 036-201655</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">บริการด่วน</h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/apply" className="hover:text-white transition">
                      • กรอกใบสมัครเรียนออนไลน์ (โควตา 2570)
                    </Link>
                  </li>
                  <li>
                    <Link href="/status" className="hover:text-white transition">
                      • ตรวจสอบสถานะและแก้ไขเอกสาร
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/login" className="hover:text-white transition">
                      • เข้าสู่ระบบเจ้าหน้าที่ (Admin Portal)
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p>© 2570 วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์. สงวนลิขสิทธิ์ทุกประการ.</p>
              <p>Online Admission Management System v2.0</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
