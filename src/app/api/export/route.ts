import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateExcelBuffer, generateCsvString, ApplicantExportItem } from '@/lib/export-excel';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx'; // 'xlsx' or 'csv'
    const year = searchParams.get('year') || '';
    const levelId = searchParams.get('levelId') || '';
    const deptId = searchParams.get('deptId') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (year) where.academicYear = { year };
    if (levelId) where.levelId = levelId;
    if (deptId) {
      where.OR = [{ primaryDeptId: deptId }, { secondaryDeptId: deptId }];
    }
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: true,
        level: true,
        primaryDept: true,
        secondaryDept: true,
        education: true,
        parentInfo: true,
        enrollment: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    const exportItems: ApplicantExportItem[] = applications.map((app) => ({
      applicationNo: app.applicationNo,
      trackingCode: app.trackingCode,
      fullName: app.applicant.fullName,
      citizenId: app.applicant.citizenId,
      levelName: app.level.name,
      primaryDept: app.primaryDept.name,
      secondaryDept: app.secondaryDept?.name || '',
      gpax: app.education?.gpax || 0,
      schoolName: app.education?.schoolName || '',
      schoolProvince: app.education?.schoolProvince || '',
      phone: app.applicant.phone,
      status: app.status,
      submittedAt: new Date(app.submittedAt).toLocaleDateString('th-TH'),
      studentId: app.enrollment?.studentId || undefined,
      fatherName: app.parentInfo?.fatherName || undefined,
      motherName: app.parentInfo?.motherName || undefined,
    }));

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'EXPORT',
        entity: 'Application',
        details: `ส่งออกข้อมูล ${exportItems.length} รายการ รูปแบบ ${format.toUpperCase()} โดย ${user.fullName}`,
      },
    });

    const filename = `admission_${year || 'all'}_${Date.now()}`;

    if (format === 'csv') {
      const csvData = generateCsvString(exportItems);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      const excelBuffer = generateExcelBuffer(exportItems);
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการส่งออกข้อมูล' }, { status: 500 });
  }
}
