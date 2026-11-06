const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  // 1. Create Academic Year
  const year2570 = await prisma.academicYear.upsert({
    where: { year: '2570' },
    update: {},
    create: {
      year: '2570',
      title: 'ประจำปีการศึกษา 2570',
      isActive: true,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-04-30'),
    },
  });

  const year2571 = await prisma.academicYear.upsert({
    where: { year: '2571' },
    update: {},
    create: {
      year: '2571',
      title: 'ประจำปีการศึกษา 2571',
      isActive: false,
    },
  });

  // 2. Create Admission Levels exactly as specified in the original form
  const levelPVS_Direct = await prisma.admissionLevel.upsert({
    where: { code: 'PVS_DIRECT' },
    update: {},
    create: {
      code: 'PVS_DIRECT',
      name: 'ระดับ ปวส. (สายตรง)',
      category: 'ปวส.',
      sortOrder: 1,
      isActive: true,
    },
  });

  const levelPVS_Trans = await prisma.admissionLevel.upsert({
    where: { code: 'PVS_TRANS' },
    update: {},
    create: {
      code: 'PVS_TRANS',
      name: 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)',
      category: 'ปวส.',
      sortOrder: 2,
      isActive: true,
    },
  });

  const levelPVC = await prisma.admissionLevel.upsert({
    where: { code: 'PVC' },
    update: {},
    create: {
      code: 'PVC',
      name: 'ระดับ ปวช.',
      category: 'ปวช.',
      sortOrder: 3,
      isActive: true,
    },
  });

  // 3. Create Real College Departments
  const pvcDepts = [
    { code: 'PVC-AUTO', name: 'สาขาวิชาช่างยนต์', quota: 40, total: 50 },
    { code: 'PVC-MECH', name: 'สาขาวิชาช่างกลโรงงาน', quota: 35, total: 45 },
    { code: 'PVC-WELD', name: 'สาขาวิชาช่างเชื่อมโลหะ', quota: 30, total: 40 },
    { code: 'PVC-ELEC', name: 'สาขาวิชาช่างไฟฟ้ากำลัง', quota: 40, total: 50 },
    { code: 'PVC-ELTR', name: 'สาขาวิชาช่างอิเล็กทรอนิกส์', quota: 30, total: 40 },
    { code: 'PVC-COMP', name: 'สาขาวิชาเทคนิคคอมพิวเตอร์', quota: 35, total: 45 },
    { code: 'PVC-ACCT', name: 'สาขาวิชาการบัญชี', quota: 35, total: 45 },
    { code: 'PVC-DBUS', name: 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล', quota: 35, total: 45 },
    { code: 'PVC-IT', name: 'สาขาวิชาเทคโนโลยีสารสนเทศ', quota: 30, total: 40 },
  ];

  for (let i = 0; i < pvcDepts.length; i++) {
    const d = pvcDepts[i];
    await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: {
        code: d.code,
        name: d.name,
        levelId: levelPVC.id,
        quotaTarget: d.quota,
        totalTarget: d.total,
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }

  const pvsDirectDepts = [
    { code: 'PVSD-AUTO', name: 'สาขาวิชาเทคนิคเครื่องกล (เทคนิคยานยนต์)', quota: 30, total: 35 },
    { code: 'PVSD-MECH', name: 'สาขาวิชาเทคนิคการผลิต (เครื่องมือกล)', quota: 30, total: 35 },
    { code: 'PVSD-MAINT', name: 'สาขาวิชาเทคนิคอุตสาหกรรม (วิศวกรรมซ่อมบำรุง)', quota: 25, total: 30 },
    { code: 'PVSD-WELD', name: 'สาขาวิชาเทคนิคการเชื่อมโลหะ', quota: 25, total: 30 },
    { code: 'PVSD-ELEC', name: 'สาขาวิชาไฟฟ้ากำลัง (ไฟฟ้าควบคุม)', quota: 35, total: 40 },
    { code: 'PVSD-ELTR', name: 'สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์', quota: 25, total: 30 },
    { code: 'PVSD-ACCT', name: 'สาขาวิชาการบัญชี', quota: 30, total: 35 },
    { code: 'PVSD-DBUS', name: 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล', quota: 30, total: 35 },
    { code: 'PVSD-IT', name: 'สาขาวิชาเทคโนโลยีสารสนเทศ', quota: 25, total: 30 },
  ];

  for (let i = 0; i < pvsDirectDepts.length; i++) {
    const d = pvsDirectDepts[i];
    await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: {
        code: d.code,
        name: d.name,
        levelId: levelPVS_Direct.id,
        quotaTarget: d.quota,
        totalTarget: d.total,
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }

  const pvsTransDepts = [
    { code: 'PVST-AUTO', name: 'สาขาวิชาเทคนิคเครื่องกล', quota: 20, total: 25 },
    { code: 'PVST-ELEC', name: 'สาขาวิชาไฟฟ้ากำลัง', quota: 25, total: 30 },
    { code: 'PVST-DBUS', name: 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล', quota: 25, total: 30 },
    { code: 'PVST-ACCT', name: 'สาขาวิชาการบัญชี', quota: 25, total: 30 },
    { code: 'PVST-IT', name: 'สาขาวิชาเทคโนโลยีสารสนเทศ', quota: 20, total: 25 },
  ];

  for (let i = 0; i < pvsTransDepts.length; i++) {
    const d = pvsTransDepts[i];
    await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: {
        code: d.code,
        name: d.name,
        levelId: levelPVS_Trans.id,
        quotaTarget: d.quota,
        totalTarget: d.total,
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }

  // 4. Create Users (Super Admin, Admin, Staff)
  const passwordHash = await bcrypt.hash('admin123456', 10);
  const staffHash = await bcrypt.hash('staff123456', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      fullName: 'ผู้ดูแลระบบสูงสุด (Super Admin)',
      email: 'admin@tl.ac.th',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'admission' },
    update: { passwordHash: staffHash },
    create: {
      username: 'admission',
      fullName: 'เจ้าหน้าที่งานรับสมัคร (Admission Admin)',
      email: 'admission@tl.ac.th',
      passwordHash: staffHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff' },
    update: { passwordHash: staffHash },
    create: {
      username: 'staff',
      fullName: 'เจ้าหน้าที่ตรวจเอกสาร (Document Staff)',
      email: 'staff@tl.ac.th',
      passwordHash: staffHash,
      role: 'STAFF',
      isActive: true,
    },
  });

  // 5. System Settings
  const settings = [
    { key: 'COLLEGE_NAME', value: 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์', description: 'ชื่อสถานศึกษา' },
    { key: 'COLLEGE_ADDRESS', value: 'เลขที่ 1 หมู่ 6 ถนนท่าหลวง-บ้านหมอ ต.บ้านหมอ อ.บ้านหมอ จ.สระบุรี 18130', description: 'ที่อยู่วิทยาลัย' },
    { key: 'COLLEGE_PHONE', value: '036-201655', description: 'โทรศัพท์วิทยาลัย' },
    { key: 'CURRENT_ACADEMIC_YEAR', value: '2570', description: 'ปีการศึกษาปัจจุบัน' },
    { key: 'QUOTA_OPEN', value: 'true', description: 'สถานะเปิดรับสมัครโควตา' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 6. Create realistic sample applications to demonstrate system workflows
  const elecPVC = await prisma.department.findUnique({ where: { code: 'PVC-ELEC' } });
  const compPVC = await prisma.department.findUnique({ where: { code: 'PVC-COMP' } });
  const autoPVC = await prisma.department.findUnique({ where: { code: 'PVC-AUTO' } });
  const pvsDElec = await prisma.department.findUnique({ where: { code: 'PVSD-ELEC' } });

  const sampleApplicants = [
    {
      citizenId: '1100201234567',
      prefix: 'นาย',
      firstName: 'กฤษณะ',
      lastName: 'เจริญสุข',
      birthDay: 14,
      birthMonth: 'พฤษภาคม',
      birthYear: 2554,
      phone: '0812345678',
      email: 'kritsana.j@gmail.com',
      appNo: 'APP-2570-0001',
      trackingCode: 'TL70-8A19',
      levelId: levelPVC.id,
      primaryDeptId: elecPVC.id,
      secondaryDeptId: compPVC.id,
      status: 'DOC_APPROVED',
      father: { name: 'นายสมศักดิ์ เจริญสุข', age: 48, job: 'รับจ้างทั่วไป' },
      mother: { name: 'นางวันดี เจริญสุข', age: 45, job: 'ค้าขาย' },
      address: {
        houseNo: '124/5',
        moo: '3',
        soi: 'ร่วมใจ 2',
        road: 'พหลโยธิน',
        subdistrict: 'บ้านหมอ',
        district: 'บ้านหมอ',
        province: 'สระบุรี',
        postalCode: '18130',
        phone: '0812345678',
      },
      education: {
        currentLevel: 'ม.3',
        schoolName: 'โรงเรียนบ้านหมอ "พัฒนานุกูล"',
        schoolAddressNo: '55',
        schoolSubdistrict: 'บ้านหมอ',
        schoolDistrict: 'บ้านหมอ',
        schoolProvince: 'สระบุรี',
        gpax: 3.65,
        major: 'มัธยมศึกษาตอนต้น (ห้องวิทย์-คณิต)',
      },
    },
    {
      citizenId: '1100409876543',
      prefix: 'นางสาว',
      firstName: 'สุดารัตน์',
      lastName: 'แก้วมณี',
      birthDay: 22,
      birthMonth: 'สิงหาคม',
      birthYear: 2554,
      phone: '0897654321',
      email: 'sudarat.k@gmail.com',
      appNo: 'APP-2570-0002',
      trackingCode: 'TL70-3F4C',
      levelId: levelPVC.id,
      primaryDeptId: compPVC.id,
      secondaryDeptId: autoPVC.id,
      status: 'PASSED',
      father: { name: 'นายประเสริฐ แก้วมณี', age: 50, job: 'พนักงานบริษัท' },
      mother: { name: 'นางดวงใจ แก้วมณี', age: 47, job: 'พนักงานรัฐวิสาหกิจ' },
      address: {
        houseNo: '88/2',
        moo: '1',
        soi: '-',
        road: 'สุวรรณศร',
        subdistrict: 'ปากเพรียว',
        district: 'เมืองสระบุรี',
        province: 'สระบุรี',
        postalCode: '18000',
        phone: '0897654321',
      },
      education: {
        currentLevel: 'ม.3',
        schoolName: 'โรงเรียนสระบุรีวิทยาคม',
        schoolAddressNo: '12',
        schoolSubdistrict: 'ปากเพรียว',
        schoolDistrict: 'เมืองสระบุรี',
        schoolProvince: 'สระบุรี',
        gpax: 3.82,
        major: 'มัธยมศึกษาตอนต้น',
      },
    },
    {
      citizenId: '1100505544332',
      prefix: 'นาย',
      firstName: 'ธนกฤต',
      lastName: 'ศิริรัตนชัย',
      birthDay: 5,
      birthMonth: 'มกราคม',
      birthYear: 2552,
      phone: '0951239874',
      email: 'thanakrit.s@gmail.com',
      appNo: 'APP-2570-0003',
      trackingCode: 'TL70-9K2M',
      levelId: levelPVS_Direct.id,
      primaryDeptId: pvsDElec.id,
      secondaryDeptId: null,
      status: 'ENROLLED',
      father: { name: 'นายเกรียงไกร ศิริรัตนชัย', age: 52, job: 'รับราชการ' },
      mother: { name: 'นางอรทัย ศิริรัตนชัย', age: 49, job: 'รับราชการครู' },
      address: {
        houseNo: '45/9',
        moo: '4',
        soi: 'เทศบาล 5',
        road: 'มิตรภาพ',
        subdistrict: 'แก่งคอย',
        district: 'แก่งคอย',
        province: 'สระบุรี',
        postalCode: '18110',
        phone: '0951239874',
      },
      education: {
        currentLevel: 'ปวช.3',
        schoolName: 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
        schoolAddressNo: '1',
        schoolSubdistrict: 'บ้านหมอ',
        schoolDistrict: 'บ้านหมอ',
        schoolProvince: 'สระบุรี',
        gpax: 3.75,
        major: 'สาขาวิชาช่างไฟฟ้ากำลัง',
      },
      enrollment: {
        studentId: '68301040001',
        guardianName: 'นายเกรียงไกร ศิริรัตนชัย',
        guardianPhone: '0819998877',
        guardianRelation: 'บิดา',
        witnessName: 'นายพิเชษฐ์ วิศวกรรมศาสตร์ (หัวหน้าแผนก)',
        status: 'COMPLETED',
      },
    },
    {
      citizenId: '1100807766554',
      prefix: 'นาย',
      firstName: 'ปฏิภาณ',
      lastName: 'มั่นคง',
      birthDay: 19,
      birthMonth: 'พฤศจิกายน',
      birthYear: 2554,
      phone: '0824445566',
      email: 'patipan.m@gmail.com',
      appNo: 'APP-2570-0004',
      trackingCode: 'TL70-4X1B',
      levelId: levelPVC.id,
      primaryDeptId: autoPVC.id,
      secondaryDeptId: elecPVC.id,
      status: 'DOC_RESUBMIT',
      reviewNotes: 'เอกสารผลการเรียน (GPAX 5 ภาคเรียน) ภาพไม่ชัดเจน มองไม่เห็นตราประทับโรงเรียน กรุณาถ่ายหรือสแกนใหม่ให้ชัดเจน',
      father: { name: 'นายประดิษฐ์ มั่นคง', age: 46, job: 'เกษตรกรรม' },
      mother: { name: 'นางเพ็ญศรี มั่นคง', age: 43, job: 'เกษตรกรรม' },
      address: {
        houseNo: '19',
        moo: '8',
        soi: '-',
        road: '-',
        subdistrict: 'หนองแค',
        district: 'หนองแค',
        province: 'สระบุรี',
        postalCode: '18140',
        phone: '0824445566',
      },
      education: {
        currentLevel: 'ม.3',
        schoolName: 'โรงเรียนหนองแค "สรกิจพิทยา"',
        schoolAddressNo: '108',
        schoolSubdistrict: 'หนองแค',
        schoolDistrict: 'หนองแค',
        schoolProvince: 'สระบุรี',
        gpax: 2.95,
        major: 'มัธยมศึกษาตอนต้น',
      },
    },
  ];

  for (const s of sampleApplicants) {
    // create applicant
    const applicant = await prisma.applicant.upsert({
      where: { citizenId: s.citizenId },
      update: {},
      create: {
        citizenId: s.citizenId,
        prefix: s.prefix,
        firstName: s.firstName,
        lastName: s.lastName,
        fullName: `${s.prefix}${s.firstName} ${s.lastName}`,
        birthDay: s.birthDay,
        birthMonth: s.birthMonth,
        birthYear: s.birthYear,
        phone: s.phone,
        email: s.email,
      },
    });

    const app = await prisma.application.upsert({
      where: { applicationNo: s.appNo },
      update: {},
      create: {
        applicationNo: s.appNo,
        trackingCode: s.trackingCode,
        applicantId: applicant.id,
        academicYearId: year2570.id,
        levelId: s.levelId,
        primaryDeptId: s.primaryDeptId,
        secondaryDeptId: s.secondaryDeptId,
        status: s.status,
        reviewNotes: s.reviewNotes || null,
        signerName: `${s.prefix}${s.firstName} ${s.lastName}`,
        signDateDay: 15,
        signDateMonth: 'พฤศจิกายน',
        signDateYear: 2569,
        photoUrl: '/images/avatar-placeholder.png',
      },
    });

    // Parent
    await prisma.parentInfo.upsert({
      where: { applicationId: app.id },
      update: {},
      create: {
        applicationId: app.id,
        fatherName: s.father.name,
        fatherAge: s.father.age,
        fatherJob: s.father.job,
        motherName: s.mother.name,
        motherAge: s.mother.age,
        motherJob: s.mother.job,
      },
    });

    // Address
    await prisma.address.upsert({
      where: { applicationId: app.id },
      update: {},
      create: {
        applicationId: app.id,
        houseNo: s.address.houseNo,
        moo: s.address.moo,
        soi: s.address.soi,
        road: s.address.road,
        subdistrict: s.address.subdistrict,
        district: s.address.district,
        province: s.address.province,
        postalCode: s.address.postalCode,
        phone: s.address.phone,
      },
    });

    // Education
    await prisma.educationHistory.upsert({
      where: { applicationId: app.id },
      update: {},
      create: {
        applicationId: app.id,
        currentLevel: s.education.currentLevel,
        schoolName: s.education.schoolName,
        schoolAddressNo: s.education.schoolAddressNo,
        schoolSubdistrict: s.education.schoolSubdistrict,
        schoolDistrict: s.education.schoolDistrict,
        schoolProvince: s.education.schoolProvince,
        gpax: s.education.gpax,
        major: s.education.major,
      },
    });

    // Documents
    const docs = [
      {
        docType: 'PHOTO',
        title: 'รูปถ่ายหน้าตรง ขนาด 1 นิ้ว',
        fileName: 'profile_photo.jpg',
        fileUrl: '/images/sample-photo.jpg',
        fileSize: 120540,
        mimeType: 'image/jpeg',
        status: s.status === 'DOC_RESUBMIT' ? 'APPROVED' : 'APPROVED',
      },
      {
        docType: 'TRANSCRIPT',
        title: 'เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน',
        fileName: 'transcript_5semesters.pdf',
        fileUrl: '/documents/sample_transcript.pdf',
        fileSize: 450120,
        mimeType: 'application/pdf',
        status: s.status === 'DOC_RESUBMIT' ? 'RESUBMIT' : 'APPROVED',
        rejectReason: s.status === 'DOC_RESUBMIT' ? 'ภาพเอกสารไม่ชัดเจน กรุณาสแกนใหม่' : null,
      },
      {
        docType: 'ID_HOUSE',
        title: 'สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน',
        fileName: 'id_card_house_reg.pdf',
        fileUrl: '/documents/sample_id_card.pdf',
        fileSize: 320400,
        mimeType: 'application/pdf',
        status: 'APPROVED',
      },
    ];

    for (const doc of docs) {
      await prisma.document.create({
        data: {
          applicationId: app.id,
          docType: doc.docType,
          title: doc.title,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          status: doc.status,
          rejectReason: doc.rejectReason,
        },
      });
    }

    if (s.enrollment) {
      await prisma.enrollment.upsert({
        where: { applicationId: app.id },
        update: {},
        create: {
          applicationId: app.id,
          studentId: s.enrollment.studentId,
          guardianName: s.enrollment.guardianName,
          guardianPhone: s.enrollment.guardianPhone,
          guardianRelation: s.enrollment.guardianRelation,
          witnessName: s.enrollment.witnessName,
          enrollmentDate: new Date(),
          status: s.enrollment.status,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
