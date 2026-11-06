import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { fileUrl, fileName, fileSize, mimeType } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'ไม่พบไฟล์เอกสารใหม่' }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        application: {
          include: { applicant: true },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลเอกสาร' }, { status: 404 });
    }

    // Update document with new file and set status back to PENDING
    const updated = await prisma.document.update({
      where: { id },
      data: {
        fileUrl,
        fileName: fileName || doc.fileName,
        fileSize: fileSize || doc.fileSize,
        mimeType: mimeType || doc.mimeType,
        status: 'PENDING',
        rejectReason: null,
      },
    });

    // Update application to PENDING_REVIEW
    await prisma.application.update({
      where: { id: doc.applicationId },
      data: {
        status: 'PENDING_REVIEW',
        reviewNotes: 'ผู้สมัครได้ส่งเอกสารแก้ไขเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบอีกครั้ง',
      },
    });

    // Notify staff
    await sendNotification({
      applicationId: doc.applicationId,
      recipientName: doc.application.applicant.fullName,
      applicationNo: doc.application.applicationNo,
      event: 'NEW_APPLICATION',
      customMessage: `ผู้สมัครได้อัปโหลดเอกสารแก้ไข: ${doc.title}`,
    });

    return NextResponse.json({
      success: true,
      message: 'อัปโหลดเอกสารใหม่เรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบอีกครั้ง',
      document: updated,
    });
  } catch (error: any) {
    console.error('Error resubmitting document:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดเอกสารใหม่' }, { status: 500 });
  }
}
