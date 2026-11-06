import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        academicYear: true,
        level: true,
        primaryDept: true,
        secondaryDept: true,
        parentInfo: true,
        address: true,
        education: true,
        documents: {
          include: {
            reviews: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        enrollment: true,
        notifications: {
          orderBy: { sentAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลใบสมัคร' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Error fetching application details:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, reviewNotes, selectionNotes, reserveOrder } = body;

    const existing = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลใบสมัคร' }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(reviewNotes !== undefined ? { reviewNotes } : {}),
        ...(selectionNotes !== undefined ? { selectionNotes } : {}),
        ...(reserveOrder !== undefined ? { reserveOrder: reserveOrder ? parseInt(reserveOrder, 10) : null } : {}),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'UPDATE_STATUS',
        entity: 'Application',
        entityId: id,
        details: `เปลี่ยนสถานะเป็น ${status || updated.status} โดย ${user.fullName} (${user.role}) หมายเหตุ: ${reviewNotes || selectionNotes || '-'}`,
      },
    });

    // Send notifications based on status change
    if (status && status !== existing.status) {
      if (status === 'DOC_APPROVED') {
        await sendNotification({
          applicationId: id,
          recipientName: existing.applicant.fullName,
          recipientPhone: existing.applicant.phone,
          recipientEmail: existing.applicant.email || undefined,
          applicationNo: existing.applicationNo,
          event: 'DOC_APPROVED',
        });
      } else if (status === 'DOC_RESUBMIT' || status === 'DOC_INCOMPLETE') {
        await sendNotification({
          applicationId: id,
          recipientName: existing.applicant.fullName,
          recipientPhone: existing.applicant.phone,
          recipientEmail: existing.applicant.email || undefined,
          applicationNo: existing.applicationNo,
          customMessage: reviewNotes,
          event: 'DOC_REJECTED',
        });
      } else if (status === 'PASSED') {
        await sendNotification({
          applicationId: id,
          recipientName: existing.applicant.fullName,
          recipientPhone: existing.applicant.phone,
          recipientEmail: existing.applicant.email || undefined,
          applicationNo: existing.applicationNo,
          event: 'ADMISSION_PASSED',
        });
      } else if (status === 'PENDING_ENROLLMENT') {
        await sendNotification({
          applicationId: id,
          recipientName: existing.applicant.fullName,
          recipientPhone: existing.applicant.phone,
          recipientEmail: existing.applicant.email || undefined,
          applicationNo: existing.applicationNo,
          event: 'ENROLLMENT_READY',
        });
      }
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: error.message || 'ไม่สามารถอัปเดตข้อมูลได้' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const app = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true },
    });

    if (!app) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลใบสมัคร' }, { status: 404 });
    }

    // Update applicant
    const fullName = `${data.prefix}${data.firstName} ${data.lastName}`.trim();
    await prisma.applicant.update({
      where: { id: app.applicantId },
      data: {
        prefix: data.prefix,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        birthDay: parseInt(data.birthDay, 10),
        birthMonth: data.birthMonth,
        birthYear: parseInt(data.birthYear, 10),
        phone: data.phone,
        email: data.email || null,
      },
    });

    // Update parent
    if (data.fatherName || data.motherName) {
      await prisma.parentInfo.update({
        where: { applicationId: id },
        data: {
          fatherName: data.fatherName,
          fatherAge: data.fatherAge ? parseInt(data.fatherAge, 10) : null,
          fatherJob: data.fatherJob,
          motherName: data.motherName,
          motherAge: data.motherAge ? parseInt(data.motherAge, 10) : null,
          motherJob: data.motherJob,
        },
      });
    }

    // Update address
    if (data.houseNo) {
      await prisma.address.update({
        where: { applicationId: id },
        data: {
          houseNo: data.houseNo,
          moo: data.moo,
          soi: data.soi,
          road: data.road,
          subdistrict: data.subdistrict,
          district: data.district,
          province: data.province,
          postalCode: data.postalCode,
          phone: data.phone,
        },
      });
    }

    // Update education
    if (data.schoolName) {
      await prisma.educationHistory.update({
        where: { applicationId: id },
        data: {
          currentLevel: data.currentLevel,
          schoolName: data.schoolName,
          schoolAddressNo: data.schoolAddressNo,
          schoolSubdistrict: data.schoolSubdistrict,
          schoolDistrict: data.schoolDistrict,
          schoolProvince: data.schoolProvince,
          gpax: parseFloat(data.gpax),
          major: data.major,
        },
      });
    }

    // Update application
    await prisma.application.update({
      where: { id },
      data: {
        levelId: data.levelId,
        primaryDeptId: data.primaryDeptId,
        secondaryDeptId: data.secondaryDeptId || null,
        status: data.status || app.status,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'EDIT_APP',
        entity: 'Application',
        entityId: id,
        details: `แก้ไขข้อมูลใบสมัครโดย ${user.fullName}`,
      },
    });

    return NextResponse.json({ success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error editing application:', error);
    return NextResponse.json({ error: error.message || 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 });
  }
}
