import {
  PrismaClient,
  ProcedureCategory,
  ProcedureStatus,
  UserRole,
} from '../generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
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
          name: "Registrar General's Department",
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
          longitude: 79.851,
        },
      }),
      prisma.office.create({
        data: {
          name: 'Ministry of Public Services, Provincial Councils and Local Government',
          nameSi: 'රාජ්‍ය සේවා, පළාත් සභා සහ පළාත් පාලන අමාත්‍යංශය',
          nameTa: 'பொது சேவைகள், மாகாண சபைகள் மற்றும் உள்ளூர் அரசாங்க அமைச்சு',
          address: 'Independence Square, Colombo 07',
          district: 'Colombo',
          province: 'Western',
          contactNumbers: ['+94112694031', '+94112694032'],
          email: 'info@pubad.gov.lk',
          website: 'http://www.pubad.gov.lk',
          workingHours: 'Monday to Friday: 8:30 AM - 4:15 PM',
          latitude: 6.9147,
          longitude: 79.8774,
        },
      }),
    ]);

    console.log('🏢 Government offices created');

    // Create sample procedures with comprehensive data
    const procedures = [
      {
        title: 'Apply for New National Identity Card',
        titleSi: 'නව ජාතික හැඳුනුම්පත සඳහා අයදුම් කිරීම',
        titleTa: 'புதிய தேசிய அடையாள அட்டைக்கு விண்ணப்பிக்கவும்',
        slug: 'apply-new-national-identity-card',
        category: ProcedureCategory.IDENTITY_DOCUMENTS,
        status: ProcedureStatus.ACTIVE,
        keywords: [
          'NIC',
          'national identity card',
          'ID card',
          'identity',
          'birth certificate',
        ],
        searchTags: ['nic', 'identity', 'card', 'national', 'id'],
        estimatedDuration: '7-14 days',
        difficulty: 'EASY',
        steps: [
          {
            order: 1,
            instruction:
              'Visit the nearest Divisional Secretariat office with required documents',
            instructionSi:
              'අවශ්‍ය ලියකියවිලි සමග ආසන්නතම ප්‍රාදේශීය ලේකම් කාර්යාලයට පිවිසෙන්න',
            instructionTa:
              'தேவையான ஆவணங்களுடன் அருகிலுள்ள பிரதேச செயலர் அலுவலகத்திற்கு செல்லவும்',
            estimatedTime: '30-45 minutes',
            requiredDocs: [
              'Birth Certificate',
              'Proof of Address',
              'Parent NIC copies',
            ],
            tips: [
              'Visit early morning to avoid queues',
              'Bring photocopies of all documents',
              'Carry exact change for fees',
            ],
          },
          {
            order: 2,
            instruction:
              'Fill the application form (Form 1) completely and accurately',
            instructionSi:
              'අයදුම්පත (ආකෘති පත්‍ර 1) සම්පූර්ණයෙන් සහ නිවැරදිව පුරවන්න',
            instructionTa:
              'விண்ணப்ப படிவத்தை (படிவம் 1) முழுமையாக மற்றும் துல்லியமாக நிரப்பவும்',
            estimatedTime: '15-20 minutes',
            tips: [
              'Use black ink pen only',
              'Write clearly and legibly',
              'Double-check all information',
            ],
          },
          {
            order: 3,
            instruction:
              'Submit application with documents and pay the required fee',
            instructionSi:
              'ලියකියවිලි සමග අයදුම්පත ඉදිරිපත් කර අවශ්‍ය ගාස්තුව ගෙවන්න',
            instructionTa:
              'ஆவணங்களுடன் விண்ணப்பத்தை சமர்ப்பித்து தேவையான கட்டணம் செலுத்தவும்',
            estimatedTime: '15 minutes',
            tips: [
              'Get receipt for payment',
              'Note down reference number',
              'Ask for expected completion date',
            ],
          },
          {
            order: 4,
            instruction: 'Collect your new NIC after the processing period',
            instructionSi: 'සැකසුම් කාලයෙන් පසු ඔබේ නව ජා.හැ.කා එකතු කරගන්න',
            instructionTa:
              'செயலாக்க காலத்திற்குப் பிறகு உங்கள் புதிய NIC ஐ சேகரிக்கவும்',
            estimatedTime: '10 minutes',
            tips: [
              'Bring receipt and old ID if available',
              'Verify all details on new NIC',
            ],
          },
        ],
        requirements: [
          {
            name: 'Original Birth Certificate',
            nameSi: 'මුල් උප්පැන්න සහතිකය',
            nameTa: 'அசல் பிறப்பு சான்றிதழ்',
            description:
              'Certified copy issued by Registrar General or authorized officer',
            isRequired: true,
            order: 1,
          },
          {
            name: 'Proof of Current Address',
            nameSi: 'වර්තමාන ලිපිනයේ සාක්ෂිය',
            nameTa: 'தற்போதைய முகவரி ஆதாரம்',
            description:
              'Utility bill, bank statement, or Grama Niladhari certificate within 3 months',
            isRequired: true,
            order: 2,
          },
          {
            name: 'Parent/Guardian NIC Copies',
            nameSi: 'මාපිය/භාරකරුගේ ජා.හැ.කා පිටපත්',
            nameTa: 'பெற்றோர்/பாதுகாவலர் NIC நகல்கள்',
            description: "Photocopies of both parents' NICs (if applicable)",
            isRequired: false,
            order: 3,
          },
          {
            name: 'Passport Size Photographs',
            nameSi: 'ගමන් බලපත්‍ර ප්‍රමාණයේ ඡායාරූප',
            nameTa: 'பாஸ்போர்ட் அளவு புகைப்படங்கள்',
            description: '2 recent passport-size color photographs',
            isRequired: true,
            order: 4,
          },
        ],
        fees: [
          {
            description: 'Application Processing Fee',
            amount: 100,
            currency: 'LKR',
            isOptional: false,
          },
        ],
      },
      {
        title: 'Apply for Sri Lankan Passport',
        titleSi: 'ශ්‍රී ලංකන් ගමන් බලපත්‍රය සඳහා අයදුම් කිරීම',
        titleTa: 'இலங்கை கடவுச்சீட்டிற்கு விண்ணப்பிக்கவும்',
        slug: 'apply-sri-lankan-passport',
        category: ProcedureCategory.PASSPORTS,
        status: ProcedureStatus.ACTIVE,
        keywords: [
          'passport',
          'travel document',
          'visa',
          'travel',
          'immigration',
        ],
        searchTags: ['passport', 'travel', 'document', 'visa', 'immigration'],
        estimatedDuration: '3-45 days',
        difficulty: 'MEDIUM',
        steps: [
          {
            order: 1,
            instruction: 'Submit online application via epassport.gov.lk',
            instructionSi:
              'epassport.gov.lk හරහා මාර්ගගත අයදුම්පත ඉදිරිපත් කිරීම',
            instructionTa:
              'epassport.gov.lk மூலம் ஆன்லைன் விண்ணப்பம் சமர்ப்பிக்கவும்',
            estimatedTime: '20-30 minutes',
            tips: [
              'Have all documents scanned and ready',
              'Use good internet connection',
              'Create account first',
            ],
          },
          {
            order: 2,
            instruction: 'Pay application fee online and print receipt',
            instructionSi:
              'අයදුම් ගාස්තුව මාර්ගගතව ගෙවා රිසිට්පත මුද්‍රණය කරන්න',
            instructionTa:
              'ஆன்லைனில் விண்ணப்ப கட்டணம் செலுத்தி ரசீதை அச்சிடவும்',
            estimatedTime: '5-10 minutes',
            tips: [
              'Keep payment receipt safe',
              'Use secure payment methods',
              'Check bank charges',
            ],
          },
          {
            order: 3,
            instruction: 'Visit passport office for biometric data collection',
            instructionSi:
              'ජීවමිතික දත්ත එකතු කිරීම සඳහා ගමන් බලපත්‍ර කාර්යාලයට පිවිසෙන්න',
            instructionTa:
              'உயிரியல் தரவு சேகரிப்பிற்காக கடவுச்சீட்டு அலுவலகத்திற்கு செல்லவும්',
            estimatedTime: '45-60 minutes',
            requiredDocs: [
              'All original documents',
              'Online application print',
              'Payment receipt',
            ],
            tips: [
              'Book appointment online',
              'Arrive 15 minutes early',
              'Dress formally',
            ],
          },
          {
            order: 4,
            instruction: 'Collect passport after processing completion',
            instructionSi:
              'සැකසුම් සම්පූර්ණ කිරීමෙන් පසු ගමන් බලපත්‍රය එකතු කරගන්න',
            instructionTa: 'செயலாக்கம் முடிந்ததும் கடவுச்சீட்டை சேகரிக்கவும்',
            estimatedTime: '10-15 minutes',
            tips: [
              'Check SMS updates',
              'Verify all details',
              'Sign passport immediately',
            ],
          },
        ],
        requirements: [
          {
            name: 'National Identity Card',
            nameSi: 'ජාතික හැඳුනුම්පත',
            nameTa: 'தேசிய அடையாள அட்டை',
            description:
              'Valid Sri Lankan NIC (original and certified photocopy)',
            isRequired: true,
            order: 1,
          },
          {
            name: 'Birth Certificate',
            nameSi: 'උප්පැන්න සහතිකය',
            nameTa: 'பிறப்பு சான்றிதழ்',
            description:
              'Original birth certificate issued by Registrar General',
            isRequired: true,
            order: 2,
          },
          {
            name: 'Marriage Certificate',
            nameSi: 'විවාහ සහතිකය',
            nameTa: 'திருமண சான்றிதழ்',
            description: 'Required if married and name change is applicable',
            isRequired: false,
            order: 3,
          },
          {
            name: 'Previous Passport',
            nameSi: 'පෙර ගමන් බලපත්‍රය',
            nameTa: 'முந்தைய கடவுச்சீட்டு',
            description: 'If renewing existing passport',
            isRequired: false,
            order: 4,
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
          {
            description: 'Express Service (3 days)',
            amount: 10000,
            currency: 'LKR',
            isOptional: true,
          },
        ],
      },
      {
        title: 'Business Registration Certificate',
        titleSi: 'ව්‍යාපාර ලියාපදිංචි සහතිකය',
        titleTa: 'வணிக பதிவு சான்றிதழ்',
        slug: 'business-registration-certificate',
        category: ProcedureCategory.BUSINESS,
        status: ProcedureStatus.ACTIVE,
        keywords: [
          'business registration',
          'company',
          'enterprise',
          'license',
          'trade',
        ],
        searchTags: ['business', 'registration', 'company', 'license', 'trade'],
        estimatedDuration: '3-7 days',
        difficulty: 'MEDIUM',
        steps: [
          {
            order: 1,
            instruction: 'Reserve business name through ROC online system',
            instructionSi:
              'ROC මාර්ගගත පද්ධතිය හරහා ව්‍යාපාරික නාමය රක්ෂිත කරන්න',
            instructionTa:
              'ROC ஆன்லைன் அமைப்பு மூலம் வணிக பெயரை முன்பதிவு செய்யவும்',
            estimatedTime: '15-30 minutes',
            tips: [
              'Check name availability first',
              'Have 3 alternative names ready',
            ],
          },
          {
            order: 2,
            instruction: 'Prepare and submit required documents',
            instructionSi: 'අවශ්‍ය ලියකියවිලි සකසා ඉදිරිපත් කරන්න',
            instructionTa: 'தேவையான ஆவணங்களை தயாரித்து சமர்ப்பிக்கவும்',
            estimatedTime: '60-90 minutes',
            requiredDocs: ['Application form', 'NIC copies', 'Address proof'],
          },
        ],
        requirements: [
          {
            name: 'Completed Application Form',
            nameSi: 'සම්පුර්ණ අයදුම්පත',
            nameTa: 'நிரப்பப்பட்ட விண்ணப்ப படிவம்',
            description: 'Form ROC 1 duly filled and signed',
            isRequired: true,
            order: 1,
          },
          {
            name: 'National Identity Card',
            nameSi: 'ජාතික හැඳුනුම්පත',
            nameTa: 'தேசிய அடையாள அட்டை',
            description: 'NIC of proprietor/partners (certified copies)',
            isRequired: true,
            order: 2,
          },
        ],
        fees: [
          {
            description: 'Registration Fee',
            amount: 2500,
            currency: 'LKR',
            isOptional: false,
          },
          {
            description: 'Name Reservation Fee',
            amount: 500,
            currency: 'LKR',
            isOptional: false,
          },
        ],
      },
    ];

    // Create procedures with all related data
    for (const procedureData of procedures) {
      const { steps, requirements, fees, ...procedure } = procedureData;

      const createdProcedure = await prisma.procedure.create({
        data: procedure,
      });

      // Create steps
      await Promise.all(
        steps.map((step) =>
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
        requirements.map((req) =>
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
        fees.map((fee) =>
          prisma.fee.create({
            data: {
              ...fee,
              procedureId: createdProcedure.id,
            },
          })
        )
      );

      // Link with appropriate offices
      const officeIndex =
        procedure.category === ProcedureCategory.PASSPORTS
          ? 1
          : procedure.category === ProcedureCategory.BUSINESS
            ? 2
            : 0;

      await prisma.procedureOffice.create({
        data: {
          procedureId: createdProcedure.id,
          officeId: offices[officeIndex].id,
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
          maxTokens: 200,
          temperature: 0.7,
          confidenceThreshold: 0.6,
          supportedLanguages: ['en', 'si', 'ta'],
          fallbackResponses: {
            en: "I'm sorry, I don't have enough information about that procedure. Please contact the relevant government office for assistance.",
            si: 'සමාවෙන්න, මට එම ක්‍රියාමාර්ගය පිළිබඳ ප්‍රමාණවත් තොරතුරු නැත. කරුණාකර සහාය සඳහා අදාළ රජයේ කාර්යාලයට සම්බන්ධ වන්න.',
            ta: 'மன்னிக்கவும், அந்த நடைமுறை பற்றிய போதுமான தகவல் என்னிடம் இல்லை. உதவிக்காக தொடர்புடைய அரசு அலுவலகத்தை தொடர்பு கொள்ளவும்.',
          },
        },
      },
    });

    // Create FAQ entries
    const faqs = [
      {
        question: 'How long does it take to get a new NIC?',
        questionSi: 'නව ජා.හැ.කා ලබා ගැනීමට කොපමණ කාලයක් ගත වේද?',
        questionTa: 'புதிய NIC பெற எவ்வளவு நேரம் ஆகும்?',
        answer:
          'Typically 7-14 working days from the date of application submission.',
        answerSi:
          'සාමාන්‍යයෙන් අයදුම්පත ඉදිරිපත් කළ දිනයේ සිට වැඩ කරන දින 7-14කි.',
        answerTa:
          'பொதுவாக விண்ணப்பம் சமர்ப்பித்த நாளிலிருந்து 7-14 வேலை நாட்கள்.',
        category: 'IDENTITY_DOCUMENTS',
        isActive: true,
      },
      {
        question: 'What is the cost of a Sri Lankan passport?',
        questionSi: 'ශ්‍රී ලංකන් ගමන් බලපත්‍රයක පිරිවැය කීයද?',
        questionTa: 'இலங்கை கடவுச்சீட்டின் விலை என்ன?',
        answer:
          'Normal processing (45 days): Rs. 3,500. Fast track (7 days): Rs. 7,000. Express (3 days): Rs. 10,000.',
        answerSi:
          'සාමාන්‍ය සැකසුම් (දින 45): රු. 3,500. වේගවත් (දින 7): රු. 7,000. ප්‍රකාශිත (දින 3): රු. 10,000.',
        answerTa:
          'சாதாரண செயலாக்கம் (45 நாட்கள்): ரூ. 3,500. வேகமான (7 நாட்கள்): ரூ. 7,000. விரைவு (3 நாட்கள்): ரூ. 10,000.',
        category: 'PASSPORTS',
        isActive: true,
      },
    ];

    for (const faq of faqs) {
      await prisma.fAQ.create({ data: faq });
    }

    console.log('❓ FAQ entries created');
    console.log('⚙️ System configuration created');
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
