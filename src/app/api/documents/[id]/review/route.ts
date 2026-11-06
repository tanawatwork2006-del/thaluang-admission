import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { id } = params;
    const { status, rejectReason, remarks } = await request.json();

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'ไม่พบเอกสาร' }, { status: 404 });
    }

    // Update document
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        status,
        rejectReason: status === 'APPROVED' ? null : rejectReason || remarks,
      },
    });

    // Record review log
    await prisma.documentReview.create({
      data: {
        documentId: id,
        reviewedBy: user.fullName,
        status,
        remarks: rejectReason || remarks || null,
      },
    });

    // If document is marked RESUBMIT or REJECTED, update application status if appropriate
    if (status === 'RESUBMIT' || status === 'REJECTED') {
      await prisma.application.update({
        where: { id: doc.applicationId },
        data: {
          status: 'DOC_RESUBMIT',
          reviewNotes: `เอกสาร ${doc.title} มีปัญหา: ${rejectReason || remarks || 'โปรดส่งใหม่'}`,
        },
      });
    }

    return NextResponse.json({ success: true, document: updatedDoc });
  } catch (error: any) {
    console.error('Error reviewing document:', error);
    return NextResponse.json({ error: 'บันทึกผลการตรวจเอกสารไม่สำเร็จ' }, { status: 500 });
  }
}
