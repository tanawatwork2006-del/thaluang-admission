import { prisma } from './prisma';

export interface NotificationPayload {
  applicationId?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName: string;
  applicationNo?: string;
  trackingCode?: string;
  event:
    | 'NEW_APPLICATION'
    | 'SUBMISSION_SUCCESS'
    | 'DOC_APPROVED'
    | 'DOC_REJECTED'
    | 'ADMISSION_PASSED'
    | 'RESULT_ANNOUNCED'
    | 'ENROLLMENT_READY';
  customMessage?: string;
}

export async function sendNotification(payload: NotificationPayload) {
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_NOTIFY_TOKEN;
  const smtpHost = process.env.SMTP_HOST;

  let eventTitle = '';
  let eventBody = '';

  switch (payload.event) {
    case 'NEW_APPLICATION':
      eventTitle = '📢 มีการส่งใบสมัครใหม่เข้าระบบ';
      eventBody = `ใบสมัครเลขที่: ${payload.applicationNo || '-'} ผู้สมัคร: ${payload.recipientName}`;
      break;
    case 'SUBMISSION_SUCCESS':
      eventTitle = '✅ ส่งใบสมัครออนไลน์สำเร็จ';
      eventBody = `สวัสดี ${payload.recipientName} วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ได้รับใบสมัครเลขที่ ${payload.applicationNo} (รหัสติดตาม: ${payload.trackingCode}) เรียบร้อยแล้ว ขณะนี้อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบเอกสาร`;
      break;
    case 'DOC_APPROVED':
      eventTitle = '📄 เอกสารการสมัครผ่านการตรวจสอบ';
      eventBody = `สวัสดี ${payload.recipientName} เอกสารใบสมัครเลขที่ ${payload.applicationNo} ผ่านการตรวจสอบความถูกต้องเรียบร้อยแล้ว กรุณารอประกาศผลการคัดเลือก`;
      break;
    case 'DOC_REJECTED':
      eventTitle = '⚠️ เอกสารการสมัครต้องแก้ไขหรือส่งใหม่';
      eventBody = `สวัสดี ${payload.recipientName} เอกสารบางรายการในใบสมัครเลขที่ ${payload.applicationNo} ไม่ผ่านการตรวจสอบ: ${payload.customMessage || 'กรุณาเข้าระบบเพื่อตรวจสอบรายละเอียดและอัปโหลดเอกสารใหม่'}`;
      break;
    case 'ADMISSION_PASSED':
      eventTitle = '🎉 ยินดีด้วย! ท่านผ่านการคัดเลือกเข้าศึกษาต่อ';
      eventBody = `ขอแสดงความยินดีกับ ${payload.recipientName} ท่านผ่านการคัดเลือกเข้าศึกษาต่อ วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา 2570 กรุณาเข้าสู่ระบบเพื่อพิมพ์ใบสมัครและเตรียมตัวมอบตัว`;
      break;
    case 'RESULT_ANNOUNCED':
      eventTitle = '📢 ประกาศผลการคัดเลือกเข้าศึกษาต่อ';
      eventBody = `วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ได้ประกาศผลการคัดเลือกประจำปีการศึกษา 2570 แล้ว ตรวจสอบสถานะของท่านได้ที่หน้าเว็บไซต์`;
      break;
    case 'ENROLLMENT_READY':
      eventTitle = '🏫 แจ้งกำหนดการมอบตัวนักศึกษาใหม่';
      eventBody = `ถึงขั้นตอนการมอบตัวนักศึกษาใหม่ ขอให้ ${payload.recipientName} เข้าสู่ระบบเพื่อพิมพ์เอกสารใบมอบตัวและเตรียมหลักฐานตามกำหนดการ`;
      break;
  }

  // 1. Log notification in database
  const record = await prisma.notification.create({
    data: {
      applicationId: payload.applicationId,
      channel: lineToken ? 'LINE' : smtpHost ? 'EMAIL' : 'SYSTEM',
      recipient: payload.recipientEmail || payload.recipientPhone || payload.recipientName,
      subject: eventTitle,
      message: payload.customMessage ? `${eventBody} (${payload.customMessage})` : eventBody,
      status: lineToken || smtpHost ? 'SENT' : 'LOGGED',
    },
  });

  // 2. Dispatch to external API if configured
  if (lineToken) {
    try {
      // If line notify
      await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${lineToken}`,
        },
        body: new URLSearchParams({
          message: `\n${eventTitle}\n${eventBody}`,
        }),
      });
    } catch (err) {
      console.warn('LINE Notification send skipped/error:', err);
    }
  }

  return record;
}
