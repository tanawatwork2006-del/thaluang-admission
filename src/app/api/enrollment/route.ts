import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const data = await request.json();
    const { applicationId, studentId, guardianName, guardianPhone, guardianRelation, witnessName, enrollmentDate, status, remarks } = data;

    if (!applicationId || !guardianName || !guardianPhone) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลผู้ปกครองและเบอร์โทรศัพท์' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { applicationId },
      update: {
        studentId: studentId || null,
        guardianName,
        guardianPhone,
        guardianRelation: guardianRelation || 'ผู้ปกครอง',
        witnessName: witnessName || user.fullName,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        status: status || 'COMPLETED',
        remarks: remarks || null,
      },
      create: {
        applicationId,
        studentId: studentId || null,
        guardianName,
        guardianPhone,
        guardianRelation: guardianRelation || 'ผู้ปกครอง',
        witnessName: witnessName || user.fullName,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        status: status || 'COMPLETED',
        remarks: remarks || null,
      },
    });

    // Update application status to ENROLLED if status is COMPLETED
    if (status === 'COMPLETED' || !status) {
      const app = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: 'ENROLLED',
        },
        include: { applicant: true },
      });

      await sendNotification({
        applicationId,
        recipientName: app.applicant.fullName,
        recipientPhone: app.applicant.phone,
        recipientEmail: app.applicant.email || undefined,
        applicationNo: app.applicationNo,
        event: 'ENROLLMENT_READY',
        customMessage: `บันทึกการมอบตัวเสร็จสมบูรณ์ รหัสนักศึกษา: ${studentId || '-'}`,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'RECORD_ENROLLMENT',
        entity: 'Enrollment',
        entityId: enrollment.id,
        details: `บันทึกข้อมูลการมอบตัว รหัสนักศึกษา ${studentId || '-'} โดย ${user.fullName}`,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: error.message || 'บันทึกการมอบตัวไม่สำเร็จ' }, { status: 500 });
  }
}
