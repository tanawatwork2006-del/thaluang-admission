import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    const [academicYears, levels, departments, settings] = await Promise.all([
      prisma.academicYear.findMany({
        orderBy: { year: 'desc' },
      }),
      prisma.admissionLevel.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.department.findMany({
        orderBy: [{ levelId: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.systemSetting.findMany(),
    ]);

    const activeYear = year
      ? academicYears.find((y) => y.year === year) || academicYears.find((y) => y.isActive)
      : academicYears.find((y) => y.isActive) || academicYears[0];

    return NextResponse.json({
      activeYear,
      academicYears,
      levels,
      departments,
      settings: settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
    });
  } catch (error: any) {
    console.error('Error fetching master data:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลหลักได้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 'STAFF') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ในการจัดการข้อมูลหลัก' }, { status: 403 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (type === 'DEPARTMENT') {
      if (data.id) {
        const updated = await prisma.department.update({
          where: { id: data.id },
          data: {
            name: data.name,
            code: data.code,
            levelId: data.levelId,
            quotaTarget: parseInt(data.quotaTarget, 10),
            totalTarget: parseInt(data.totalTarget, 10),
            isActive: Boolean(data.isActive),
          },
        });
        return NextResponse.json({ success: true, item: updated });
      } else {
        const created = await prisma.department.create({
          data: {
            name: data.name,
            code: data.code,
            levelId: data.levelId,
            quotaTarget: parseInt(data.quotaTarget, 10),
            totalTarget: parseInt(data.totalTarget, 10),
            isActive: Boolean(data.isActive),
          },
        });
        return NextResponse.json({ success: true, item: created });
      }
    }

    if (type === 'ACADEMIC_YEAR') {
      if (data.id) {
        if (data.isActive) {
          await prisma.academicYear.updateMany({ data: { isActive: false } });
        }
        const updated = await prisma.academicYear.update({
          where: { id: data.id },
          data: {
            year: data.year,
            title: data.title,
            isActive: Boolean(data.isActive),
          },
        });
        return NextResponse.json({ success: true, item: updated });
      } else {
        if (data.isActive) {
          await prisma.academicYear.updateMany({ data: { isActive: false } });
        }
        const created = await prisma.academicYear.create({
          data: {
            year: data.year,
            title: data.title,
            isActive: Boolean(data.isActive),
          },
        });
        return NextResponse.json({ success: true, item: created });
      }
    }

    return NextResponse.json({ error: 'ประเภทข้อมูลไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    console.error('Master data update error:', error);
    return NextResponse.json({ error: error.message || 'บันทึกข้อมูลหลักไม่สำเร็จ' }, { status: 500 });
  }
}
