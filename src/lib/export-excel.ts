import * as XLSX from 'xlsx';
import { APPLICATION_STATUS_MAP, formatCitizenId, formatPhone } from './validation';

export interface ApplicantExportItem {
  applicationNo: string;
  trackingCode: string;
  fullName: string;
  citizenId: string;
  levelName: string;
  primaryDept: string;
  secondaryDept: string;
  gpax: number;
  schoolName: string;
  schoolProvince: string;
  phone: string;
  status: string;
  submittedAt: string;
  studentId?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
}

export function generateExcelBuffer(data: ApplicantExportItem[]): Buffer {
  const rows = data.map((item, index) => ({
    'ลำดับที่': index + 1,
    'เลขที่ใบสมัคร': item.applicationNo,
    'รหัสติดตาม': item.trackingCode,
    'ชื่อ-นามสกุล': item.fullName,
    'เลขประจำตัวประชาชน': formatCitizenId(item.citizenId),
    'ระดับการศึกษาที่สมัคร': item.levelName,
    'สาขาวิชาที่สมัคร (อันดับ 1)': item.primaryDept,
    'สาขาวิชาสำรอง (อันดับ 2)': item.secondaryDept || '-',
    'เกรดเฉลี่ย (GPAX)': item.gpax.toFixed(2),
    'สถานศึกษาเดิม': item.schoolName,
    'จังหวัดสถานศึกษา': item.schoolProvince,
    'เบอร์โทรศัพท์': formatPhone(item.phone),
    'สถานะการสมัคร': APPLICATION_STATUS_MAP[item.status]?.label || item.status,
    'รหัสนักศึกษา (หลังมอบตัว)': item.studentId || '-',
    'ชื่อบิดา': item.fatherName || '-',
    'ชื่อมารดา': item.motherName || '-',
    'วันที่ยื่นใบสมัคร': item.submittedAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ลำดับ
    { wch: 16 }, // เลขที่ใบสมัคร
    { wch: 12 }, // รหัสติดตาม
    { wch: 24 }, // ชื่อ-นามสกุล
    { wch: 20 }, // บัตรประชาชน
    { wch: 22 }, // ระดับการศึกษา
    { wch: 32 }, // สาขา 1
    { wch: 30 }, // สาขา 2
    { wch: 10 }, // เกรด
    { wch: 28 }, // โรงเรียน
    { wch: 16 }, // จังหวัด
    { wch: 14 }, // เบอร์โทร
    { wch: 22 }, // สถานะ
    { wch: 18 }, // รหัสนักศึกษา
    { wch: 22 }, // บิดา
    { wch: 22 }, // มารดา
    { wch: 20 }, // วันที่สมัคร
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อผู้สมัคร');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function generateCsvString(data: ApplicantExportItem[]): string {
  const headers = [
    'ลำดับที่',
    'เลขที่ใบสมัคร',
    'รหัสติดตาม',
    'ชื่อ-นามสกุล',
    'เลขประจำตัวประชาชน',
    'ระดับการศึกษาที่สมัคร',
    'สาขาวิชาที่สมัคร (อันดับ 1)',
    'สาขาวิชาสำรอง (อันดับ 2)',
    'เกรดเฉลี่ย (GPAX)',
    'สถานศึกษาเดิม',
    'จังหวัดสถานศึกษา',
    'เบอร์โทรศัพท์',
    'สถานะการสมัคร',
    'รหัสนักศึกษา',
    'ชื่อบิดา',
    'ชื่อมารดา',
    'วันที่ยื่นใบสมัคร',
  ];

  const lines = [headers.join(',')];

  data.forEach((item, index) => {
    const row = [
      index + 1,
      `"${item.applicationNo}"`,
      `"${item.trackingCode}"`,
      `"${item.fullName}"`,
      `"${formatCitizenId(item.citizenId)}"`,
      `"${item.levelName}"`,
      `"${item.primaryDept}"`,
      `"${item.secondaryDept || '-'}"`,
      item.gpax.toFixed(2),
      `"${item.schoolName}"`,
      `"${item.schoolProvince}"`,
      `"${formatPhone(item.phone)}"`,
      `"${APPLICATION_STATUS_MAP[item.status]?.label || item.status}"`,
      `"${item.studentId || '-'}"`,
      `"${item.fatherName || '-'}"`,
      `"${item.motherName || '-'}"`,
      `"${item.submittedAt}"`,
    ];
    lines.push(row.join(','));
  });

  // Prepend UTF-8 BOM so Excel opens Thai CSV correctly without corrupted characters
  return '\uFEFF' + lines.join('\n');
}
