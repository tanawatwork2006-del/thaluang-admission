import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50,
      include: {
        application: {
          select: {
            applicationNo: true,
            applicant: { select: { fullName: true } },
          },
        },
      },
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { recipient, message } = await request.json();

    const result = await sendNotification({
      recipientName: recipient || 'เจ้าหน้าที่ทดสอบ',
      recipientEmail: recipient?.includes('@') ? recipient : undefined,
      recipientPhone: !recipient?.includes('@') ? recipient : undefined,
      event: 'RESULT_ANNOUNCED',
      customMessage: message || 'ทดสอบระบบแจ้งเตือนอัตโนมัติ วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Notification test error:', error);
    return NextResponse.json({ error: 'ส่งการแจ้งเตือนไม่สำเร็จ' }, { status: 500 });
  }
}
