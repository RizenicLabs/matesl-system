import {
  PrismaClient,
  Procedure,
  ProcedureCategory,
  ProcedureStatus,
  ProcedureDifficulty,
  UserRole,
  Language,
} from '../generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Type definitions for seed data
interface SeedProcedureStep {
  order: number;
  instruction: string;
  instructionSi: string;
  instructionTa: string;
  estimatedTime?: string;
  tips: string[];
  requiredDocs: string[];
}

interface SeedRequirement {
  name: string;
  nameSi: string;
  nameTa: string;
  description?: string;
  isRequired: boolean;
  order: number;
}

interface SeedFee {
  description: string;
  amount: number;
  currency: string;
  isOptional: boolean;
}

interface SeedProcedure {
  title: string;
  titleSi: string;
  titleTa: string;
  slug: string;
  category: ProcedureCategory;
  status: ProcedureStatus;
  keywords: string[];
  searchTags: string[];
  estimatedDuration?: string;
  difficulty: ProcedureDifficulty;
  description?: string;
  steps: SeedProcedureStep[];
  requirements: SeedRequirement[];
  fees: SeedFee[];
}

interface SeedFAQ {
  question: string;
  questionSi: string;
  questionTa: string;
  answer: string;
  answerSi: string;
  answerTa: string;
  category: ProcedureCategory;
  keywords: string[];
  searchTags: string[];
  isActive: boolean;
}

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

    // Create content manager user
    const contentManagerPassword = await bcrypt.hash('content123', 10);
    const contentManager = await prisma.user.upsert({
      where: { email: 'content@gov.lk' },
      update: {},
      create: {
        email: 'content@gov.lk',
        name: 'Content Manager',
        password: contentManagerPassword,
        role: UserRole.CONTENT_MANAGER,
        emailVerified: true,
      },
    });

    console.log('👤 Content manager created:', contentManager.email);

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
      prisma.office.create({
        data: {
          name: 'District Secretariat - Kandy',
          nameSi: 'දිස්ත්‍රික් ලේකම් කාර්යාලය - මහනුවර',
          nameTa: 'மாவட்ட செயலகம் - கண்டி',
          address: 'District Secretariat, Kandy',
          district: 'Kandy',
          province: 'Central',
          contactNumbers: ['+94812222771', '+94812222772'],
          email: 'info@kandy.dist.gov.lk',
          website: 'http://www.kandy.dist.gov.lk',
          workingHours: 'Monday to Friday: 8:30 AM - 4:15 PM',
          latitude: 7.2906,
          longitude: 80.6337,
        },
      }),
      prisma.office.create({
        data: {
          name: 'Registrar of Companies',
          nameSi: 'සමාගම් ලේඛකාධිකාරී',
          nameTa: 'நிறுவனங்களின் பதிவாளர்',
          address: 'No. 5, Baladaksha Mawatha, Colombo 03',
          district: 'Colombo',
          province: 'Western',
          contactNumbers: ['+94112136873', '+94112136874'],
          email: 'info@roc.gov.lk',
          website: 'http://www.roc.gov.lk',
          workingHours: 'Monday to Friday: 8:30 AM - 4:15 PM',
          latitude: 6.927,
          longitude: 79.8612,
        },
      }),
    ]);

    console.log('🏢 Government offices created');

    // Create sample procedures with comprehensive data
    const procedures: SeedProcedure[] = [
      {
        title: 'Apply for New National Identity Card',
        titleSi: 'නව ජාතික හැඳුනුම්පත සඳහා අයදුම් කිරීම',
        titleTa: 'புதிய தேசிய அடையாள அட்டைக்கு விண்ணப்பிக்கவும்',
        slug: 'apply-new-national-identity-card',
        description:
          'Complete guide to apply for a new National Identity Card for Sri Lankan citizens',
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
        difficulty: ProcedureDifficulty.EASY,
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
            requiredDocs: [],
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
            requiredDocs: [],
          },
          {
            order: 4,
            instruction: 'Collect your new NIC after the processing period',
            instructionSi: 'සැකසුම් කාලයෙන් පසු ඔබේ නව ජා.හැ.කා එකතු කරගන්න',
            instructionTa:
              'செயலாக்க காலத்திற்குப் பிறகு உங்கள் புதிய NIC ஐ சேकரிக்கவும்',
            estimatedTime: '10 minutes',
            tips: [
              'Bring receipt and old ID if available',
              'Verify all details on new NIC',
            ],
            requiredDocs: [],
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
        description:
          'Complete guide to apply for a Sri Lankan passport for travel abroad',
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
        difficulty: ProcedureDifficulty.MEDIUM,
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
            requiredDocs: [],
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
            requiredDocs: [],
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
            requiredDocs: [],
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
        description:
          'Step-by-step guide to register a new business in Sri Lanka',
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
        difficulty: ProcedureDifficulty.MEDIUM,
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
            requiredDocs: [],
          },
          {
            order: 2,
            instruction: 'Prepare and submit required documents',
            instructionSi: 'අවශ්‍ය ලියකියවිලි සකසා ඉදිරිපත් කරන්න',
            instructionTa: 'தேவையான ஆவணங்களை தயாரித்து சமர்ப்பிக்கவும்',
            estimatedTime: '60-90 minutes',
            requiredDocs: ['Application form', 'NIC copies', 'Address proof'],
            tips: [
              'Ensure all documents are properly certified',
              'Keep copies for your records',
            ],
          },
          {
            order: 3,
            instruction:
              'Visit ROC office for document submission and verification',
            instructionSi:
              'ලියකියවිලි ඉදිරිපත් කිරීම සහ සත්‍යාපනය සඳහා ROC කාර්යාලයට පිවිසෙන්න',
            instructionTa:
              'ஆவண சமர்ப்பிப்பு மற்றும் சரிபார்ப்பிற்காக ROC அலுவலகத்திற்கு செல்லவும்',
            estimatedTime: '45-60 minutes',
            requiredDocs: [],
            tips: [
              'Arrive early to avoid queues',
              'Bring all original documents',
            ],
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
          {
            name: 'Proof of Business Address',
            nameSi: 'ව්‍යාපාරික ලිපිනයේ සාක්ෂිය',
            nameTa: 'வணிக முகவரி ஆதாரம்',
            description: 'Lease agreement or property ownership documents',
            isRequired: true,
            order: 3,
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
      {
        title: 'Obtain Birth Certificate',
        titleSi: 'උප්පැන්න සහතිකය ලබා ගැනීම',
        titleTa: 'பிறப்பு சான்றிதழ் பெறுதல்',
        slug: 'obtain-birth-certificate',
        description:
          'Guide to obtain a certified copy of birth certificate from Registrar General',
        category: ProcedureCategory.BIRTH_CERTIFICATES,
        status: ProcedureStatus.ACTIVE,
        keywords: [
          'birth certificate',
          'certified copy',
          'registrar general',
          'vital records',
        ],
        searchTags: ['birth', 'certificate', 'copy', 'registrar', 'vital'],
        estimatedDuration: '3-7 days',
        difficulty: ProcedureDifficulty.EASY,
        steps: [
          {
            order: 1,
            instruction:
              'Visit Registrar General Department or authorized office',
            instructionSi:
              'ලේඛකාධිකාරී ජනරාල් දෙපාර්තමේන්තුව හෝ බලයලත් කාර්යාලයට පිවිසෙන්න',
            instructionTa:
              'பதிவாளர் ஜெனரல் திணைக்களம் அல்லது அங்கீகரிக்கப்பட்ட அலுவலகத்திற்கு செல்லவும்',
            estimatedTime: '30 minutes',
            requiredDocs: [
              'Application form',
              'ID proof',
              'Relationship proof',
            ],
            tips: [
              'Call ahead to confirm office hours',
              'Bring exact change for fees',
            ],
          },
          {
            order: 2,
            instruction: 'Fill application form with accurate details',
            instructionSi: 'නිවැරදි විස්තර සහිත අයදුම්පත පුරවන්න',
            instructionTa: 'சரியான விவரங்களுடன் விண்ணப்ப படிவத்தை நிரப்பவும்',
            estimatedTime: '10-15 minutes',
            requiredDocs: [],
            tips: [
              'Provide accurate birth details',
              'Include parent names correctly',
            ],
          },
          {
            order: 3,
            instruction: 'Submit application and collect receipt',
            instructionSi: 'අයදුම්පත ඉදිරිපත් කර රිසිට්පත එකතු කරගන්න',
            instructionTa: 'விண்ணப்பத்தை சமர்ப்பித்து ரசீதை சேகரிக்கவும்',
            estimatedTime: '10 minutes',
            requiredDocs: [],
            tips: ['Keep receipt safely', 'Note collection date'],
          },
        ],
        requirements: [
          {
            name: 'Application Form',
            nameSi: 'අයදුම්පත',
            nameTa: 'விண்ணப்ப படிவம்',
            description: 'Completed application form for birth certificate',
            isRequired: true,
            order: 1,
          },
          {
            name: 'Applicant ID Proof',
            nameSi: 'අයදුම්කරුගේ හැඳුනුම්පත',
            nameTa: 'விண்ணப்பதாரர் அடையாள ஆதாரம்',
            description: 'Valid NIC or passport of applicant',
            isRequired: true,
            order: 2,
          },
          {
            name: 'Relationship Proof',
            nameSi: 'නෑකම් සාක්ෂිය',
            nameTa: 'உறவு ஆதாரம்',
            description:
              'Document proving relationship to the person (if not self)',
            isRequired: false,
            order: 3,
          },
        ],
        fees: [
          {
            description: 'Certified Copy Fee',
            amount: 50,
            currency: 'LKR',
            isOptional: false,
          },
        ],
      },
    ];

    // Create procedures with all related data
    for (const procedureData of procedures) {
      const { steps, requirements, fees, ...procedureBase } = procedureData;

      const createdProcedure = await prisma.procedure.create({
        data: {
          ...procedureBase,
          version: 1,
        },
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
      let officeIndex = 0;
      switch (procedureData.category) {
        case ProcedureCategory.PASSPORTS:
          officeIndex = 1; // Immigration Department
          break;
        case ProcedureCategory.BUSINESS:
          officeIndex = 4; // Registrar of Companies
          break;
        case ProcedureCategory.BIRTH_CERTIFICATES:
          officeIndex = 0; // Registrar General's Department
          break;
        case ProcedureCategory.IDENTITY_DOCUMENTS:
        default:
          officeIndex = 0; // Registrar General's Department
          break;
      }

      await prisma.procedureOffice.create({
        data: {
          procedureId: createdProcedure.id,
          officeId: offices[officeIndex].id,
          isMain: true,
        },
      });

      console.log(`📄 Procedure created: ${procedureData.title}`);
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
          supportedLanguages: ['EN', 'SI', 'TA'],
          fallbackResponses: {
            EN: "I'm sorry, I don't have enough information about that procedure. Please contact the relevant government office for assistance.",
            SI: 'සමාවෙන්න, මට එම ක්‍රියාමාර්ගය පිළිබඳ ප්‍රමාණවත් තොරතුරු නැත. කරුණාකර සහාය සඳහා අදාළ රජයේ කාර්යාලයට සම්බන්ධ වන්න.',
            TA: 'மன்னிக்கவும், அந்த நடைமுறை பற்றிய போதுமான தகவல் என்னிடம் இல்லை. உதவிக்காக தொடர்புடைய அரசு அலுவலகத்தை தொடர்பு கொள்ளவும்.',
          },
        },
      },
    });

    // Create additional system configurations
    await prisma.systemConfig.upsert({
      where: { key: 'maintenance_mode' },
      update: {},
      create: {
        key: 'maintenance_mode',
        value: {
          enabled: false,
          message: {
            EN: 'System is under maintenance. Please try again later.',
            SI: 'පද්ධතිය නඩත්තු කිරීම යටතේ. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
            TA: 'கணினி பராமரிப்பில் உள்ளது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.',
          },
          startTime: null,
          endTime: null,
        },
      },
    });

    await prisma.systemConfig.upsert({
      where: { key: 'featured_procedures' },
      update: {},
      create: {
        key: 'featured_procedures',
        value: {
          procedures: [
            'apply-new-national-identity-card',
            'apply-sri-lankan-passport',
            'business-registration-certificate',
            'obtain-birth-certificate',
          ],
          maxCount: 6,
        },
      },
    });

    // Create FAQ entries
    const faqs: SeedFAQ[] = [
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
        category: ProcedureCategory.IDENTITY_DOCUMENTS,
        keywords: ['NIC', 'processing time', 'duration', 'how long'],
        searchTags: ['nic', 'time', 'duration', 'processing'],
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
        category: ProcedureCategory.PASSPORTS,
        keywords: ['passport', 'cost', 'price', 'fees', 'charges'],
        searchTags: ['passport', 'cost', 'price', 'fees'],
        isActive: true,
      },
      {
        question: 'Can I apply for a passport online?',
        questionSi: 'මට මාර්ගගතව ගමන් බලපත්‍රයක් සඳහා අයදුම් කළ හැකිද?',
        questionTa: 'நான் ஆன்லைனில் கடவுச்சீட்டிற்கு விண்ணப்பிக்க முடியுமா?',
        answer:
          'Yes, you can submit your passport application online through epassport.gov.lk. However, you still need to visit the passport office for biometric data collection.',
        answerSi:
          'ඔව්, ඔබට epassport.gov.lk හරහා ඔබේ ගමන් බලපත්‍ර අයදුම්පත මාර්ගගතව ඉදිරිපත් කළ හැකිය. කෙසේ වෙතත්, ජීවමිතික දත්ත එකතු කිරීම සඳහා ඔබට තවමත් ගමන් බලපත්‍ර කාර්යාලයට යාමට සිදුවේ.',
        answerTa:
          'ஆம், நீங்கள் epassport.gov.lk மூலம் உங்கள் கடவுச்சீட்டு விண்ணப்பத்தை ஆன்லைனில் சமர்ப்பிக்கலாம். இருப்பினும், உயிரியல் தரவு சேகரிப்பிற்காக நீங்கள் இன்னும் கடவுச்சீட்டு அலுவலகத்திற்கு செல்ல வேண்டும்.',
        category: ProcedureCategory.PASSPORTS,
        keywords: ['passport', 'online application', 'epassport', 'digital'],
        searchTags: ['passport', 'online', 'digital', 'epassport'],
        isActive: true,
      },
      {
        question: 'What documents are required for business registration?',
        questionSi: 'ව්‍යාපාර ලියාපදිංචිය සඳහා අවශ්‍ය ලියකියවිලි මොනවාද?',
        questionTa: 'வணிக பதிவுக்கு என்ன ஆவணங்கள் தேவை?',
        answer:
          'You need completed application form (ROC 1), NIC copies of proprietor/partners, proof of business address (lease agreement or property documents), and required fees.',
        answerSi:
          'ඔබට සම්පුර්ණ අයදුම්පත (ROC 1), හිමිකරු/හවුල්කරුවන්ගේ ජා.හැ.කා පිටපත්, ව්‍යාපාරික ලිපිනයේ සාක්ෂිය (බදු ගිණුම හෝ දේපළ ලියකියවිලි), සහ අවශ්‍ය ගාස්තු අවශ්‍ය වේ.',
        answerTa:
          'உங்களுக்கு நிரப்பப்பட்ட விண்ணப்ப படிவம் (ROC 1), உரிமையாளர்/கூட்டாளர்களின் NIC நகல்கள், வணிக முகவரி ஆதாரம் (குத்தகை ஒப்பந்தம் அல்லது சொத்து ஆவணங்கள்), மற்றும் தேவையான கட்டணங்கள் தேவை.',
        category: ProcedureCategory.BUSINESS,
        keywords: ['business registration', 'documents', 'requirements', 'ROC'],
        searchTags: ['business', 'documents', 'requirements', 'registration'],
        isActive: true,
      },
      {
        question: 'How can I get a certified copy of my birth certificate?',
        questionSi: 'මගේ උප්පැන්න සහතිකයේ සහතික කළ පිටපතක් ලබා ගන්නේ කෙසේද?',
        questionTa:
          'எனது பிறப்பு சான்றிதழின் சான்றளிக்கப்பட்ட நகலை எப்படி பெறுவது?',
        answer:
          "Visit the Registrar General's Department or any authorized divisional secretariat office with your NIC, fill the application form, pay Rs. 50 fee, and collect the certified copy within 3-7 days.",
        answerSi:
          'ඔබේ ජා.හැ.කා සමග ලේඛකාධිකාරී ජනරාල් දෙපාර්තමේන්තුව හෝ ඕනෑම බලයලත් ප්‍රාදේශීය ලේකම් කාර්යාලයකට පිවිසෙන්න, අයදුම්පත පුරවන්න, රු. 50 ගාස්තුව ගෙවන්න, සහ දින 3-7 ක් ඇතුළත සහතික කළ පිටපත එකතු කරගන්න.',
        answerTa:
          'உங்கள் NIC உடன் பதிவாளர் ஜெனரலின் திணைக்களம் அல்லது அங்கீకரிக்கப்பட்ட பிரதேச செயலகத்திற்கு செல்லவும், விண்ணப்ப படிவத்தை நிரப்பவும், ரூ. 50 கட்டணம் செலுத்தவும், மற்றும் 3-7 நாட்களுக்குள் சான்றளிக்கப்பட்ட நகலை சேகரிக்கவும்.',
        category: ProcedureCategory.BIRTH_CERTIFICATES,
        keywords: ['birth certificate', 'certified copy', 'registrar general'],
        searchTags: ['birth', 'certificate', 'copy', 'certified'],
        isActive: true,
      },
    ];

    for (const faq of faqs) {
      await prisma.fAQ.create({ data: faq });
    }

    // Create some sample search history entries
    const sampleSearches = [
      {
        query: 'how to get passport',
        category: ProcedureCategory.PASSPORTS,
        language: Language.EN,
        resultsCount: 3,
      },
      {
        query: 'NIC application',
        category: ProcedureCategory.IDENTITY_DOCUMENTS,
        language: Language.EN,
        resultsCount: 5,
      },
      {
        query: 'ව්‍යාපාර ලියාපදිංචිය',
        category: ProcedureCategory.BUSINESS,
        language: Language.SI,
        resultsCount: 2,
      },
      {
        query: 'பிறப்பு சான்றிதழ்',
        category: ProcedureCategory.BIRTH_CERTIFICATES,
        language: Language.TA,
        resultsCount: 4,
      },
    ];

    for (const search of sampleSearches) {
      await prisma.searchHistory.create({
        data: search,
      });
    }

    // Create a sample chat session with messages
    const sampleSession = await prisma.chatSession.create({
      data: {
        userId: admin.id,
        isActive: true,
      },
    });

    const sampleMessages = [
      {
        sessionId: sampleSession.id,
        message: 'How can I apply for a new NIC?',
        response:
          'To apply for a new National Identity Card, you need to visit your nearest Divisional Secretariat office with your birth certificate, proof of address, and passport-size photographs. The process typically takes 7-14 working days and costs Rs. 100.',
        confidence: 0.95,
        category: ProcedureCategory.IDENTITY_DOCUMENTS,
        language: Language.EN,
        intent: 'procedure_inquiry',
        entities: {
          procedure_type: 'NIC',
          document_type: 'national_identity_card',
        },
      },
      {
        sessionId: sampleSession.id,
        message: 'What documents do I need?',
        response:
          'For a new NIC application, you need: 1) Original birth certificate, 2) Proof of current address (utility bill or Grama Niladhari certificate), 3) Parent/Guardian NIC copies (if applicable), and 4) Two passport-size color photographs.',
        confidence: 0.92,
        category: ProcedureCategory.IDENTITY_DOCUMENTS,
        language: Language.EN,
        intent: 'requirements_inquiry',
        entities: {
          procedure_type: 'NIC',
          inquiry_type: 'requirements',
        },
      },
    ];

    for (const message of sampleMessages) {
      await prisma.chatMessage.create({
        data: message,
      });
    }

    console.log('❓ FAQ entries created');
    console.log('🔍 Sample search history created');
    console.log('💬 Sample chat session created');
    console.log('⚙️ System configuration created');
    console.log('🎉 Database seeded successfully!');

    // Display summary
    const stats = {
      users: await prisma.user.count(),
      offices: await prisma.office.count(),
      procedures: await prisma.procedure.count(),
      faqs: await prisma.fAQ.count(),
      chatSessions: await prisma.chatSession.count(),
      chatMessages: await prisma.chatMessage.count(),
    };

    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${stats.users}`);
    console.log(`   Offices: ${stats.offices}`);
    console.log(`   Procedures: ${stats.procedures}`);
    console.log(`   FAQs: ${stats.faqs}`);
    console.log(`   Chat Sessions: ${stats.chatSessions}`);
    console.log(`   Chat Messages: ${stats.chatMessages}`);
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
