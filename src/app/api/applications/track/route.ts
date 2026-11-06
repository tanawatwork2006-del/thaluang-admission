import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { citizenId, trackingCode, verifyPhoneLast4 } = await request.json();

    if (!citizenId && !trackingCode) {
      return NextResponse.json(
        { error: 'กรุณากรอกเลขประจำตัวประชาชน หรือ รหัสติดตามใบสมัคร' },
        { status: 400 }
      );
    }

    const cleanCitizenId = citizenId ? citizenId.replace(/[\s-]/g, '') : undefined;
    const cleanTracking = trackingCode ? trackingCode.trim().toUpperCase() : undefined;

    const where: any = {};
    if (cleanCitizenId && cleanTracking) {
      where.applicant = { citizenId: cleanCitizenId };
      where.OR = [
        { trackingCode: cleanTracking },
        { applicationNo: cleanTracking },
      ];
    } else if (cleanCitizenId) {
      where.applicant = { citizenId: cleanCitizenId };
    } else if (cleanTracking) {
      where.OR = [
        { trackingCode: cleanTracking },
        { applicationNo: cleanTracking },
      ];
    }

    const application = await prisma.application.findFirst({
      where,
      include: {
        applicant: true,
        academicYear: true,
        level: true,
        primaryDept: true,
        secondaryDept: true,
        education: true,
        address: true,
        parentInfo: true,
        documents: {
          include: {
            reviews: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        enrollment: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลใบสมัครที่ตรงกับเงื่อนไขการค้นหา' },
        { status: 404 }
      );
    }

    // Additional security verification: check last 4 digits of phone
    if (verifyPhoneLast4) {
      const applicantPhone = application.applicant.phone.replace(/[\s-]/g, '');
      const last4 = applicantPhone.slice(-4);
      if (last4 !== verifyPhoneLast4.trim()) {
        return NextResponse.json(
          { error: 'หมายเลขโทรศัพท์ 4 หลักสุดท้ายไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Error tracking application:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ' }, { status: 500 });
  }
}
