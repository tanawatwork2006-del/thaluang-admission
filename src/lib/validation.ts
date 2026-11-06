/**
 * Thai National Citizen ID Validation with official Checksum algorithm
 */
export function validateThaiCitizenId(id: string): boolean {
  if (!id) return false;
  const cleanId = id.replace(/[\s-]/g, '');
  if (cleanId.length !== 13) return false;
  if (!/^\d{13}$/.test(cleanId)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(cleanId.charAt(12), 10);
}

/**
 * Format Citizen ID for display with masking
 * e.g. 1-1002-xxxxx-34-1
 */
export function maskCitizenId(id: string): string {
  if (!id) return '';
  const clean = id.replace(/[\s-]/g, '');
  if (clean.length !== 13) return id;
  return `${clean.substring(0, 1)}-${clean.substring(1, 5)}-xxxxx-${clean.substring(10, 12)}-${clean.substring(12, 13)}`;
}

/**
 * Format Citizen ID standard e.g. 1-1002-01234-56-7
 */
export function formatCitizenId(id: string): string {
  if (!id) return '';
  const clean = id.replace(/[\s-]/g, '');
  if (clean.length !== 13) return id;
  return `${clean.substring(0, 1)}-${clean.substring(1, 5)}-${clean.substring(5, 10)}-${clean.substring(10, 12)}-${clean.substring(12, 13)}`;
}

/**
 * Validate 10-digit Thai Mobile Phone Number
 */
export function validateThaiPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s-]/g, '');
  return /^0[689]\d{8}$/.test(clean);
}

/**
 * Format Phone Number e.g. 081-234-5678
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[\s-]/g, '');
  if (clean.length === 10) {
    return `${clean.substring(0, 3)}-${clean.substring(3, 6)}-${clean.substring(6, 10)}`;
  }
  return phone;
}

/**
 * Validate GPAX (0.00 to 4.00)
 */
export function validateGpax(gpax: number): boolean {
  return typeof gpax === 'number' && !isNaN(gpax) && gpax >= 0 && gpax <= 4.0;
}

/**
 * Thai Months List
 */
export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/**
 * Application Statuses and Labels
 */
export const APPLICATION_STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  SUBMITTED: { label: 'ส่งใบสมัครเรียบร้อยแล้ว', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 2 },
  PENDING_REVIEW: { label: 'รอเจ้าหน้าที่ตรวจสอบ', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 3 },
  DOC_INCOMPLETE: { label: 'เอกสารไม่ครบถ้วน', color: 'bg-rose-100 text-rose-800 border-rose-300', step: 4 },
  DOC_RESUBMIT: { label: 'รอแก้ไขเอกสาร', color: 'bg-orange-100 text-orange-800 border-orange-300', step: 5 },
  DOC_APPROVED: { label: 'เอกสารผ่านการตรวจสอบ', color: 'bg-teal-100 text-teal-800 border-teal-300', step: 6 },
  PASSED: { label: 'ผ่านการคัดเลือก', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 7 },
  REJECTED: { label: 'ไม่ผ่านการคัดเลือก', color: 'bg-gray-100 text-gray-800 border-gray-300', step: 8 },
  RESERVED: { label: 'สำรองการคัดเลือก', color: 'bg-purple-100 text-purple-800 border-purple-300', step: 7 },
  PENDING_ENROLLMENT: { label: 'รอดำเนินการมอบตัว', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 9 },
  ENROLLED: { label: 'มอบตัวเรียบร้อยแล้ว', color: 'bg-green-100 text-green-800 border-green-300', step: 10 },
};
