import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deptId = searchParams.get('deptId');
    const levelId = searchParams.get('levelId');
    const year = searchParams.get('year') || '2570';

    const where: any = {
      academicYear: { year },
    };

    if (levelId) where.levelId = levelId;
    if (deptId) {
      where.OR = [{ primaryDeptId: deptId }, { secondaryDeptId: deptId }];
    }

    const [departments, applications] = await Promise.all([
      prisma.department.findMany({
        where: levelId ? { levelId } : {},
        include: {
          level: true,
          _count: {
            select: {
              primaryApps: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.application.findMany({
        where,
        include: {
          applicant: true,
          level: true,
          primaryDept: true,
          secondaryDept: true,
          education: true,
        },
        orderBy: [{ education: { gpax: 'desc' } }, { submittedAt: 'asc' }],
      }),
    ]);

    return NextResponse.json({ departments, applications });
  } catch (error: any) {
    console.error('Error fetching selection data:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลการคัดเลือกได้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 'STAFF') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ในการจัดการการคัดเลือก' }, { status: 403 });
    }

    const body = await request.json();
    const { action, applicationIds, status, selectionNotes, reserveOrder, isPublished } = body;

    if (action === 'BATCH_UPDATE') {
      if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
        return NextResponse.json({ error: 'กรุณาเลือกผู้สมัครที่ต้องการดำเนินการ' }, { status: 400 });
      }

      await prisma.application.updateMany({
        where: { id: { in: applicationIds } },
        data: {
          status,
          selectionNotes: selectionNotes || undefined,
        },
      });

      // If status changed to PASSED, send notification to applicants
      if (status === 'PASSED') {
        const apps = await prisma.application.findMany({
          where: { id: { in: applicationIds } },
          include: { applicant: true },
        });

        for (const app of apps) {
          await sendNotification({
            applicationId: app.id,
            recipientName: app.applicant.fullName,
            recipientPhone: app.applicant.phone,
            recipientEmail: app.applicant.email || undefined,
            applicationNo: app.applicationNo,
            event: 'ADMISSION_PASSED',
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'SELECTION_BATCH_UPDATE',
          entity: 'Application',
          details: `ปรับสถานะผู้สมัคร ${applicationIds.length} รายการเป็น ${status} โดย ${user.fullName}`,
        },
      });

      return NextResponse.json({ success: true, count: applicationIds.length });
    }

    if (action === 'UPDATE_SINGLE') {
      const { applicationId } = body;
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status,
          selectionNotes,
          reserveOrder: reserveOrder ? parseInt(reserveOrder, 10) : null,
        },
      });

      return NextResponse.json({ success: true, application: updated });
    }

    if (action === 'PUBLISH_RESULTS') {
      const { year } = body;
      await prisma.application.updateMany({
        where: {
          academicYear: { year: year || '2570' },
          status: { in: ['PASSED', 'RESERVED', 'REJECTED'] },
        },
        data: {
          isPublished: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'PUBLISH_ADMISSION_RESULTS',
          entity: 'Application',
          details: `ประกาศผลการคัดเลือกประจำปีการศึกษา ${year || '2570'} โดย ${user.fullName}`,
        },
      });

      return NextResponse.json({ success: true, message: 'ประกาศผลการคัดเลือกเข้าสู่ระบบเรียบร้อยแล้ว' });
    }

    return NextResponse.json({ error: 'ไม่พบคำสั่งที่ต้องการดำเนินการ' }, { status: 400 });
  } catch (error: any) {
    console.error('Selection action error:', error);
    return NextResponse.json({ error: error.message || 'ดำเนินการไม่สำเร็จ' }, { status: 500 });
  }
}
