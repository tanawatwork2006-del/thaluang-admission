import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2570';

    const whereYear = { academicYear: { year } };

    const [
      total,
      pvcCount,
      pvsDirectCount,
      pvsTransCount,
      pendingCount,
      docIncompleteCount,
      passedCount,
      enrolledCount,
      departments,
      allApps,
    ] = await Promise.all([
      prisma.application.count({ where: whereYear }),
      prisma.application.count({
        where: { ...whereYear, level: { category: 'ปวช.' } },
      }),
      prisma.application.count({
        where: { ...whereYear, level: { code: 'PVS_DIRECT' } },
      }),
      prisma.application.count({
        where: { ...whereYear, level: { code: 'PVS_TRANS' } },
      }),
      prisma.application.count({
        where: { ...whereYear, status: { in: ['SUBMITTED', 'PENDING_REVIEW'] } },
      }),
      prisma.application.count({
        where: { ...whereYear, status: { in: ['DOC_INCOMPLETE', 'DOC_RESUBMIT'] } },
      }),
      prisma.application.count({
        where: { ...whereYear, status: { in: ['PASSED', 'PENDING_ENROLLMENT', 'ENROLLED'] } },
      }),
      prisma.application.count({
        where: { ...whereYear, status: 'ENROLLED' },
      }),
      prisma.department.findMany({
        include: {
          level: true,
          _count: {
            select: {
              primaryApps: { where: whereYear },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.application.findMany({
        where: whereYear,
        include: {
          education: true,
          applicant: true,
          level: true,
        },
      }),
    ]);

    // Aggregate by province
    const provinceMap: Record<string, number> = {};
    const schoolMap: Record<string, number> = {};

    allApps.forEach((app) => {
      if (app.education?.schoolProvince) {
        provinceMap[app.education.schoolProvince] =
          (provinceMap[app.education.schoolProvince] || 0) + 1;
      }
      if (app.education?.schoolName) {
        schoolMap[app.education.schoolName] =
          (schoolMap[app.education.schoolName] || 0) + 1;
      }
    });

    const byProvince = Object.entries(provinceMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const bySchool = Object.entries(schoolMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const byDepartment = departments.map((d) => ({
      name: d.name,
      code: d.code,
      level: d.level.name,
      category: d.level.category,
      count: d._count.primaryApps,
      quota: d.quotaTarget,
      totalTarget: d.totalTarget,
    }));

    return NextResponse.json({
      stats: {
        total,
        pvcCount,
        pvsCount: pvsDirectCount + pvsTransCount,
        pvsDirectCount,
        pvsTransCount,
        pendingCount,
        docIncompleteCount,
        passedCount,
        enrolledCount,
      },
      charts: {
        byDepartment,
        byProvince,
        bySchool,
        byLevel: [
          { name: 'ปวช.', count: pvcCount },
          { name: 'ปวส. (สายตรง)', count: pvsDirectCount },
          { name: 'ปวส. (ม.6/ต่างสาขา)', count: pvsTransCount },
        ],
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการคำนวณสถิติ' }, { status: 500 });
  }
}
