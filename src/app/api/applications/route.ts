import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateThaiCitizenId, validateThaiPhone, validateGpax } from '@/lib/validation';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// Helper to generate a unique tracking code
function generateTrackingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'TL70-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const levelId = searchParams.get('levelId') || '';
    const deptId = searchParams.get('deptId') || '';
    const year = searchParams.get('year') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const where: any = {};

    if (year) {
      where.academicYear = { year };
    }

    if (levelId) {
      where.levelId = levelId;
    }

    if (deptId) {
      where.OR = [{ primaryDeptId: deptId }, { secondaryDeptId: deptId }];
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { applicationNo: { contains: search } },
            { trackingCode: { contains: search } },
            { applicant: { fullName: { contains: search } } },
            { applicant: { citizenId: { contains: search } } },
            { education: { schoolName: { contains: search } } },
          ],
        },
      ];
    }

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        include: {
          applicant: true,
          level: true,
          primaryDept: true,
          secondaryDept: true,
          education: true,
          documents: true,
          enrollment: true,
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      applications,
    });
  } catch (error: any) {
    console.error('Error listing applications:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลผู้สมัครได้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Data Validations
    const citizenId = (data.citizenId || '').replace(/[\s-]/g, '');
    if (!validateThaiCitizenId(citizenId)) {
      return NextResponse.json(
        { error: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบ (Checksum)' },
        { status: 400 }
      );
    }

    const phone = (data.phone || '').replace(/[\s-]/g, '');
    if (!validateThaiPhone(phone)) {
      return NextResponse.json(
        { error: 'หมายเลขโทรศัพท์ไม่ถูกต้อง (ต้องเป็นหมายเลข 10 หลัก)' },
        { status: 400 }
      );
    }

    const gpax = parseFloat(data.gpax);
    if (!validateGpax(gpax)) {
      return NextResponse.json(
        { error: 'ผลการเรียนเฉลี่ยสะสม (GPAX) ต้องอยู่ระหว่าง 0.00 ถึง 4.00' },
        { status: 400 }
      );
    }

    if (!data.levelId) {
      return NextResponse.json({ error: 'กรุณาเลือกระดับการศึกษาที่สมัคร' }, { status: 400 });
    }

    if (!data.primaryDeptId) {
      return NextResponse.json({ error: 'กรุณาเลือกสาขาวิชาที่ต้องการสมัคร' }, { status: 400 });
    }

    // 2. Resolve Active Academic Year
    const currentYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });
    if (!currentYear) {
      return NextResponse.json(
        { error: 'ขณะนี้ระบบยังไม่ได้เปิดปีการศึกษาสำหรับการรับสมัคร' },
        { status: 400 }
      );
    }

    // 3. Check for Duplicate Application in the same Academic Year
    const existingApplicant = await prisma.applicant.findUnique({
      where: { citizenId },
      include: {
        applications: {
          where: { academicYearId: currentYear.id },
        },
      },
    });

    if (existingApplicant && existingApplicant.applications.length > 0) {
      return NextResponse.json(
        {
          error: `เลขประจำตัวประชาชนนี้ได้ทำการยื่นใบสมัครประจำปีการศึกษา ${currentYear.year} ไว้แล้ว (เลขที่: ${existingApplicant.applications[0].applicationNo}) ไม่อนุญาตให้สมัครซ้ำ`,
        },
        { status: 409 }
      );
    }

    // 4. Generate Application No and Tracking Code
    const countThisYear = await prisma.application.count({
      where: { academicYearId: currentYear.id },
    });
    const appSeq = String(countThisYear + 1).padStart(4, '0');
    const applicationNo = `APP-${currentYear.year}-${appSeq}`;
    const trackingCode = generateTrackingCode();

    // 5. Create Applicant (or update existing)
    const fullName = `${data.prefix}${data.firstName} ${data.lastName}`.trim();
    const applicant = await prisma.applicant.upsert({
      where: { citizenId },
      update: {
        prefix: data.prefix,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        birthDay: parseInt(data.birthDay, 10),
        birthMonth: data.birthMonth,
        birthYear: parseInt(data.birthYear, 10),
        phone,
        email: data.email || null,
      },
      create: {
        citizenId,
        prefix: data.prefix,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        birthDay: parseInt(data.birthDay, 10),
        birthMonth: data.birthMonth,
        birthYear: parseInt(data.birthYear, 10),
        phone,
        email: data.email || null,
      },
    });

    // 6. Create Application
    const newApp = await prisma.application.create({
      data: {
        applicationNo,
        trackingCode,
        applicantId: applicant.id,
        academicYearId: currentYear.id,
        levelId: data.levelId,
        primaryDeptId: data.primaryDeptId,
        secondaryDeptId: data.secondaryDeptId || null,
        status: 'SUBMITTED',
        photoUrl: data.photoUrl || null,
        signatureData: data.signatureData || null,
        signerName: data.signerName || fullName,
        signDateDay: data.signDateDay ? parseInt(data.signDateDay, 10) : new Date().getDate(),
        signDateMonth: data.signDateMonth || 'พฤศจิกายน',
        signDateYear: data.signDateYear ? parseInt(data.signDateYear, 10) : 2569,
      },
    });

    // 7. Create Parent Info
    await prisma.parentInfo.create({
      data: {
        applicationId: newApp.id,
        fatherName: data.fatherName,
        fatherAge: data.fatherAge ? parseInt(data.fatherAge, 10) : null,
        fatherJob: data.fatherJob || '',
        motherName: data.motherName,
        motherAge: data.motherAge ? parseInt(data.motherAge, 10) : null,
        motherJob: data.motherJob || '',
      },
    });

    // 8. Create Address
    await prisma.address.create({
      data: {
        applicationId: newApp.id,
        houseNo: data.houseNo,
        moo: data.moo || '',
        soi: data.soi || '',
        road: data.road || '',
        subdistrict: data.subdistrict,
        district: data.district,
        province: data.province,
        postalCode: data.postalCode,
        phone,
      },
    });

    // 9. Create Education History
    await prisma.educationHistory.create({
      data: {
        applicationId: newApp.id,
        currentLevel: data.currentLevel,
        schoolName: data.schoolName,
        schoolAddressNo: data.schoolAddressNo || '',
        schoolSubdistrict: data.schoolSubdistrict || '',
        schoolDistrict: data.schoolDistrict || '',
        schoolProvince: data.schoolProvince,
        gpax,
        major: data.major || '',
      },
    });

    // 10. Create Attached Documents
    if (data.documents && Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        if (doc.fileUrl) {
          await prisma.document.create({
            data: {
              applicationId: newApp.id,
              docType: doc.docType,
              title: doc.title,
              fileName: doc.fileName || `${doc.docType}.pdf`,
              fileUrl: doc.fileUrl,
              fileSize: doc.fileSize || 0,
              mimeType: doc.mimeType || 'application/octet-stream',
              status: 'PENDING',
            },
          });
        }
      }
    }

    // 11. Send Notifications
    await sendNotification({
      applicationId: newApp.id,
      recipientName: fullName,
      recipientPhone: phone,
      recipientEmail: data.email,
      applicationNo,
      trackingCode,
      event: 'SUBMISSION_SUCCESS',
    });

    await sendNotification({
      applicationId: newApp.id,
      recipientName: fullName,
      applicationNo,
      event: 'NEW_APPLICATION',
    });

    return NextResponse.json({
      success: true,
      applicationNo,
      trackingCode,
      applicationId: newApp.id,
      message: 'ส่งใบสมัครเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการบันทึกใบสมัคร' },
      { status: 500 }
    );
  }
}
