import { prisma } from '../client';
import { ProcedureCategory, ProcedureStatus, UserRole, Language } from '../generated/client';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gov.lk' },
    update: {},
    create: {
      email: 'admin@gov.lk',
      name: 'System Administrator',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  console.log('👤 Admin user created:', admin.email);

  // Create government offices
  const offices = await Promise.all([
    prisma.office.create({
      data: {
        name: 'Registrar General\'s Department',
        nameSi: 'ලේඛකාධිකාරී ජනරාල් දෙපාර්තමේන්තුව',
        nameTa: 'பதிவாளர் ஜெனரல் திணைக்களம்',
        address: 'No. 7, Independence Avenue, Colombo 07',
        district: 'Colombo',
        province: 'Western',
        contactNumbers: ['+94112691185', '+94112688211'],
        email: 'info@rgd.gov.lk',
        website: 'http://www.rgd.gov.lk',
        workingHours: 'Monday to Friday: 8:30 AM - 4:15 PM',
        latitude: 6.9147,
        longitude: 79.8774,
      },
    }),
    prisma.office.create({
      data: {
        name: 'Department of Immigration and Emigration',
        nameSi: 'ආගමන හා විගමන දෙපාර්තමේන්තුව',
        nameTa: 'குடியேற்ற மற்றும் குடியகற்றல் திணைக்களம்',
        address: 'No. 41, Ananda Rajakaruna Mawatha, Colombo 10',
        district: 'Colombo',
        province: 'Western',
        contactNumbers: ['+94112329300', '+94112329400'],
        email: 'info@immigration.gov.lk',
        website: 'http://www.immigration.gov.lk',
        workingHours: 'Monday to Friday: 8:30 AM - 4:15 PM',
        latitude: 6.9355,
        longitude: 79.8510,
      },
    }),
  ]);

  console.log('🏢 Government offices created');

  // Create sample procedures
  const procedures = [
    {
      title: 'Apply for New National Identity Card',
      titleSi: 'නව ජාතික හැඳුනුම්පත සඳහා අයදුම් කිරීම',
      titleTa: 'புதிய தேசிய அடையாள அட்டைக்கு விண்ணப்பிக்கவும்',
      slug: 'apply-new-national-identity-card',
      category: ProcedureCategory.IDENTITY_DOCUMENTS,
      status: ProcedureStatus.ACTIVE,
      keywords: ['NIC', 'national identity card', 'ID card', 'identity'],
      searchTags: ['nic', 'identity', 'card', 'national'],
      steps: [
        {
          order: 1,
          instruction: 'Visit the nearest Divisional Secretariat office',
          instructionSi: 'ආසන්නතම ප්‍රාදේශීය ලේකම් කාර්යාලයට පිවිසෙන්න',
          instructionTa: 'அருகிலுள்ள பிரதேச செயலர் அலுவலகத்திற்கு செல்லவும்',
          estimatedTime: '30 minutes',
          requiredDocs: ['Birth Certificate', 'Proof of Address'],
          tips: ['Visit early morning to avoid queues', 'Bring photocopies of documents'],
        },
        {
          order: 2,
          instruction: 'Fill the application form (Form 1)',
          instructionSi: 'අයදුම්පත (ආකෘති පත්‍ර 1) පුරවන්න',
          instructionTa: 'விண்ணப்ப படிவத்தை நிரப்பவும் (படிவம் 1)',
          estimatedTime: '15 minutes',
          tips: ['Use black ink pen', 'Write clearly and legibly'],
        },
      ],
      requirements: [
        {
          name: 'Original Birth Certificate',
          nameSi: 'මුල් උප්පැන්න සහතිකය',
          nameTa: 'அசல் பிறப்பு சான்றிதழ்',
          description: 'Certified copy issued by Registrar General',
          isRequired: true,
          order: 1,
        },
        {
          name: 'Proof of Current Address',
          nameSi: 'වර්තමාන ලිපිනයේ සාක්ෂිය',
          nameTa: 'தற்போதைய முகவரி ஆதாரம்',
          description: 'Utility bill or bank statement within 3 months',
          isRequired: true,
          order: 2,
        },
      ],
      fees: [
        {
          description: 'Application Fee',
          amount: 100,
          currency: 'LKR',
          isOptional: false,
        },
      ],
    },
    {
      title: 'Apply for Sri Lankan Passport',
      titleSi: 'ශ්‍රී ලංකන් ගමන් බලපත්‍රය සඳහා අයදුම් කිරීම',
      titleTa: 'இலங்கை கடவுச்சீட்டிற்கு விண்ණப்பிக்கவும்',
      slug: 'apply-sri-lankan-passport',
      category: ProcedureCategory.PASSPORTS,
      status: ProcedureStatus.ACTIVE,
      keywords: ['passport', 'travel document', 'visa', 'travel'],
      searchTags: ['passport', 'travel', 'document', 'visa'],
      steps: [
        {
          order: 1,
          instruction: 'Online application submission via epassport.gov.lk',
          instructionSi: 'epassport.gov.lk හරහා මාර්ගගත අයදුම්පත ඉදිරිපත් කිරීම',
          instructionTa: 'epassport.gov.lk மூலம் ஆன்லைன் விண்ணப்பம்',
          estimatedTime: '20 minutes',
          tips: ['Have all documents scanned and ready', 'Use good internet connection'],
        },
        {
          order: 2,
          instruction: 'Pay application fee online',
          instructionSi: 'අයදුම් ගාස්තුව මාර්ගගතව ගෙවන්න',
          instructionTa: 'ஆன்லைனில் விண்ணப்ப கட்டணம் செலுத்தவும்',
          estimatedTime: '5 minutes',
          tips: ['Keep payment receipt', 'Use secure payment methods'],
        },
      ],
      requirements: [
        {
          name: 'National Identity Card',
          nameSi: 'ජාතික හැඳුනුම්පත',
          nameTa: 'தேசிய அடையாள அட்டை',
          description: 'Valid NIC (original and photocopy)',
          isRequired: true,
          order: 1,
        },
        {
          name: 'Birth Certificate',
          nameSi: 'උප්පැන්න සහතිකය',
          nameTa: 'பிறப்பு சான்றிதழ்',
          description: 'Original birth certificate',
          isRequired: true,
          order: 2,
        },
      ],
      fees: [
        {
          description: 'Normal Processing (45 days)',
          amount: 3500,
          currency: 'LKR',
          isOptional: false,
        },
        {
          description: 'Fast Track (7 days)',
          amount: 7000,
          currency: 'LKR',
          isOptional: true,
        },
      ],
    },
  ];

  for (const procedureData of procedures) {
    const { steps, requirements, fees, ...procedure } = procedureData;
    
    const createdProcedure = await prisma.procedure.create({
      data: procedure,
    });

    // Create steps
    await Promise.all(
      steps.map(step =>
        prisma.procedureStep.create({
          data: {
            ...step,
            procedureId: createdProcedure.id,
          },
        })
      )
    );

    // Create requirements
    await Promise.all(
      requirements.map(req =>
        prisma.requirement.create({
          data: {
            ...req,
            procedureId: createdProcedure.id,
          },
        })
      )
    );

    // Create fees
    await Promise.all(
      fees.map(fee =>
        prisma.fee.create({
          data: {
            ...fee,
            procedureId: createdProcedure.id,
          },
        })
      )
    );

    // Link with offices
    await prisma.procedureOffice.create({
      data: {
        procedureId: createdProcedure.id,
        officeId: offices[0].id, // Link to first office
        isMain: true,
      },
    });

    console.log(`📄 Procedure created: ${procedure.title}`);
  }

  // Create system configuration
  await prisma.systemConfig.upsert({
    where: { key: 'ai_config' },
    update: {},
    create: {
      key: 'ai_config',
      value: {
        maxTokens: 150,
        temperature: 0.7,
        confidenceThreshold: 0.6,
        supportedLanguages: ['en', 'si', 'ta'],
      },
    },
  });

  console.log('⚙️ System configuration created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });