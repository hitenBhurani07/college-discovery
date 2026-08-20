import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CollegeTemplate {
  name: string;
  location: string;
  rating: number;
  type:
    | "engineering_top"
    | "engineering_mid"
    | "engineering_low"
    | "management_top"
    | "management_mid"
    | "medical_govt"
    | "medical_private"
    | "arts_top"
    | "arts_mid"
    | "law_top"
    | "law_mid";
}

// Utility functions for realistic variance
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomIntRange(min: number, max: number): number {
  return Math.floor(randomRange(min, max));
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function generateCoursesForType(type: string): { name: string; duration: string; fees: number }[] {
  const courses: { name: string; duration: string; fees: number }[] = [];
  const numCourses = randomIntRange(2, 5); // Generates 2, 3, or 4 courses

  switch (type) {
    case "engineering_top": {
      const templates = [
        { name: "B.Tech Computer Science and Engineering", duration: "4 Years", minFee: 800000, maxFee: 1200000 },
        { name: "B.Tech Electronics and Communication Engineering", duration: "4 Years", minFee: 800000, maxFee: 1100000 },
        { name: "B.Tech Mechanical Engineering", duration: "4 Years", minFee: 750000, maxFee: 1000000 },
        { name: "M.Tech Software Engineering", duration: "2 Years", minFee: 200000, maxFee: 400000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "engineering_mid": {
      const templates = [
        { name: "B.Tech Computer Science and Engineering", duration: "4 Years", minFee: 1200000, maxFee: 1800000 },
        { name: "B.Tech Information Technology", duration: "4 Years", minFee: 1100000, maxFee: 1600000 },
        { name: "B.Tech Electronics and Communication Engineering", duration: "4 Years", minFee: 1000000, maxFee: 1500000 },
        { name: "Master of Computer Applications (MCA)", duration: "2 Years", minFee: 300000, maxFee: 500000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "engineering_low": {
      const templates = [
        { name: "B.Tech Computer Science and Engineering", duration: "4 Years", minFee: 250000, maxFee: 450000 },
        { name: "B.Tech Mechanical Engineering", duration: "4 Years", minFee: 200000, maxFee: 350000 },
        { name: "B.Tech Civil Engineering", duration: "4 Years", minFee: 200000, maxFee: 350000 },
        { name: "Diploma in Electrical Engineering", duration: "3 Years", minFee: 80000, maxFee: 150000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "management_top": {
      const templates = [
        { name: "Post Graduate Diploma in Management (PGDM)", duration: "2 Years", minFee: 1800000, maxFee: 2400000 },
        { name: "Master of Business Administration (MBA)", duration: "2 Years", minFee: 2000000, maxFee: 2500000 },
        { name: "Executive Post Graduate Programme in Management (EPGP)", duration: "1 Year", minFee: 2200000, maxFee: 2500000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "management_mid": {
      const templates = [
        { name: "Master of Business Administration (MBA)", duration: "2 Years", minFee: 800000, maxFee: 1500000 },
        { name: "MBA in Human Resource Management", duration: "2 Years", minFee: 750000, maxFee: 1400000 },
        { name: "Bachelor of Business Administration (BBA)", duration: "3 Years", minFee: 300000, maxFee: 600000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "medical_govt": {
      const templates = [
        { name: "Bachelor of Medicine and Bachelor of Surgery (MBBS)", duration: "5.5 Years", minFee: 50000, maxFee: 150000 },
        { name: "MD General Medicine", duration: "3 Years", minFee: 80000, maxFee: 200000 },
        { name: "MS General Surgery", duration: "3 Years", minFee: 80000, maxFee: 200000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "medical_private": {
      const templates = [
        { name: "Bachelor of Medicine and Bachelor of Surgery (MBBS)", duration: "5.5 Years", minFee: 1500000, maxFee: 2500000 },
        { name: "MD Paediatrics", duration: "3 Years", minFee: 1000000, maxFee: 1800000 },
        { name: "B.Sc Nursing", duration: "4 Years", minFee: 200000, maxFee: 400000 },
        { name: "Bachelor of Dental Surgery (BDS)", duration: "5 Years", minFee: 600000, maxFee: 1200000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "arts_top": {
      const templates = [
        { name: "B.Com (Honours)", duration: "3 Years", minFee: 80000, maxFee: 250000 },
        { name: "B.A. (Honours) Economics", duration: "3 Years", minFee: 70000, maxFee: 200000 },
        { name: "B.Sc (Honours) Statistics", duration: "3 Years", minFee: 90000, maxFee: 240000 },
        { name: "M.A. English Literature", duration: "2 Years", minFee: 50000, maxFee: 120000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "arts_mid": {
      const templates = [
        { name: "Bachelor of Commerce (B.Com)", duration: "3 Years", minFee: 50000, maxFee: 120000 },
        { name: "Bachelor of Science in Physics", duration: "3 Years", minFee: 60000, maxFee: 140000 },
        { name: "Bachelor of Arts in English", duration: "3 Years", minFee: 50000, maxFee: 100000 },
        { name: "M.Sc Chemistry", duration: "2 Years", minFee: 80000, maxFee: 180000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "law_top": {
      const templates = [
        { name: "B.A. LL.B. (Honours)", duration: "5 Years", minFee: 800000, maxFee: 1400000 },
        { name: "B.B.A. LL.B. (Honours)", duration: "5 Years", minFee: 900000, maxFee: 1500000 },
        { name: "Master of Laws (LL.M.)", duration: "1 Year", minFee: 150000, maxFee: 300000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
    case "law_mid": {
      const templates = [
        { name: "B.A. LL.B. (Integrated)", duration: "5 Years", minFee: 300000, maxFee: 600000 },
        { name: "Bachelor of Laws (LL.B.)", duration: "3 Years", minFee: 150000, maxFee: 300000 },
        { name: "Master of Laws (LL.M.)", duration: "1 Year", minFee: 100000, maxFee: 200000 },
      ];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
        courses.push({
          name: shuffled[i].name,
          duration: shuffled[i].duration,
          fees: clamp(randomIntRange(shuffled[i].minFee, shuffled[i].maxFee), 50000, 2500000),
        });
      }
      break;
    }
  }

  return courses;
}

function generatePlacementsForType(type: string): { year: number; avgPackage: number; placementRate: number }[] {
  const placements: { year: number; avgPackage: number; placementRate: number }[] = [];
  const numYears = Math.random() < 0.25 ? 1 : 2; // 1 or 2 years of placement data

  let basePackage2024 = 0;
  let packageVariance = 0;
  let baseRate2024 = 0;
  let rateVariance = 0;

  switch (type) {
    case "engineering_top":
      basePackage2024 = 1600000;
      packageVariance = 800000;
      baseRate2024 = 92;
      rateVariance = 7;
      break;
    case "engineering_mid":
      basePackage2024 = 550000;
      packageVariance = 350000;
      baseRate2024 = 82;
      rateVariance = 13;
      break;
    case "engineering_low":
      basePackage2024 = 280000;
      packageVariance = 120000;
      baseRate2024 = 55;
      rateVariance = 20;
      break;
    case "management_top":
      basePackage2024 = 2200000;
      packageVariance = 800000;
      baseRate2024 = 96;
      rateVariance = 4;
      break;
    case "management_mid":
      basePackage2024 = 650000;
      packageVariance = 450000;
      baseRate2024 = 78;
      rateVariance = 17;
      break;
    case "medical_govt":
      basePackage2024 = 1000000;
      packageVariance = 600000;
      baseRate2024 = 97;
      rateVariance = 3;
      break;
    case "medical_private":
      basePackage2024 = 800000;
      packageVariance = 400000;
      baseRate2024 = 90;
      rateVariance = 9;
      break;
    case "arts_top":
      basePackage2024 = 500000;
      packageVariance = 450000;
      baseRate2024 = 78;
      rateVariance = 17;
      break;
    case "arts_mid":
      basePackage2024 = 240000;
      packageVariance = 120000;
      baseRate2024 = 50;
      rateVariance = 22;
      break;
    case "law_top":
      basePackage2024 = 900000;
      packageVariance = 600000;
      baseRate2024 = 85;
      rateVariance = 12;
      break;
    case "law_mid":
      basePackage2024 = 400000;
      packageVariance = 250000;
      baseRate2024 = 65;
      rateVariance = 18;
      break;
  }

  // 2024 placement data
  const pkg2024 = randomIntRange(basePackage2024, basePackage2024 + packageVariance);
  const rate2024 = roundTo(randomRange(baseRate2024, baseRate2024 + rateVariance), 2);
  placements.push({
    year: 2024,
    avgPackage: pkg2024,
    placementRate: clamp(rate2024, 0, 100),
  });

  // 2025 placement data
  if (numYears === 2) {
    const packageMultiplier = randomRange(0.98, 1.08); // Slight realistic variation/growth
    const pkg2025 = Math.floor(pkg2024 * packageMultiplier);
    const rateDiff = randomRange(-4, 6);
    const rate2025 = roundTo(rate2024 + rateDiff, 2);
    placements.push({
      year: 2025,
      avgPackage: pkg2025,
      placementRate: clamp(rate2025, 0, 100),
    });
  }

  return placements;
}

const collegeTemplates: CollegeTemplate[] = [
  { name: "Indian Institute of Technology (IIT), Bombay", location: "Mumbai", rating: 4.8, type: "engineering_top" },
  { name: "Indian Institute of Technology (IIT), Delhi", location: "New Delhi", rating: 4.8, type: "engineering_top" },
  { name: "Birla Institute of Technology and Science (BITS), Pilani", location: "Pilani", rating: 4.6, type: "engineering_top" },
  { name: "Delhi Technological University (DTU)", location: "New Delhi", rating: 4.4, type: "engineering_top" },
  { name: "Jadavpur University Faculty of Engineering", location: "Kolkata", rating: 4.5, type: "engineering_top" },
  { name: "Vellore Institute of Technology (VIT)", location: "Vellore", rating: 4.2, type: "engineering_mid" },
  { name: "Manipal Institute of Technology (MIT)", location: "Manipal", rating: 4.1, type: "engineering_mid" },
  { name: "RV College of Engineering (RVCE)", location: "Bengaluru", rating: 4.2, type: "engineering_mid" },
  { name: "PSG College of Technology", location: "Coimbatore", rating: 4.3, type: "engineering_mid" },
  { name: "Thapar Institute of Engineering and Technology", location: "Patiala", rating: 4.0, type: "engineering_mid" },
  { name: "Kalinga Institute of Industrial Technology (KIIT)", location: "Bhubaneswar", rating: 3.9, type: "engineering_mid" },
  { name: "M.S. Ramaiah Institute of Technology (MSRIT)", location: "Bengaluru", rating: 4.0, type: "engineering_mid" },
  { name: "Karunya Institute of Technology and Sciences", location: "Coimbatore", rating: 3.5, type: "engineering_low" },
  { name: "Sikkim Manipal Institute of Technology (SMIT)", location: "Majitar", rating: 3.6, type: "engineering_low" },
  { name: "Jaipur National University", location: "Jaipur", rating: 3.0, type: "engineering_low" },
  { name: "Sharda University", location: "Greater Noida", rating: 3.4, type: "engineering_low" },
  { name: "Integral University", location: "Lucknow", rating: 3.2, type: "engineering_low" },
  { name: "Lovely Professional University (LPU)", location: "Phagwara", rating: 3.5, type: "engineering_low" },
  { name: "Indian Institute of Management (IIM), Ahmedabad", location: "Ahmedabad", rating: 4.8, type: "management_top" },
  { name: "Indian Institute of Management (IIM), Bangalore", location: "Bengaluru", rating: 4.8, type: "management_top" },
  { name: "Faculty of Management Studies (FMS), Delhi University", location: "New Delhi", rating: 4.7, type: "management_top" },
  { name: "XLRI - Xavier School of Management", location: "Jamshedpur", rating: 4.7, type: "management_top" },
  { name: "Symbiosis Institute of Business Management (SIBM)", location: "Pune", rating: 4.4, type: "management_mid" },
  { name: "Narsee Monjee Institute of Management Studies (NMIMS)", location: "Mumbai", rating: 4.3, type: "management_mid" },
  { name: "Institute of Management Technology (IMT)", location: "Ghaziabad", rating: 4.1, type: "management_mid" },
  { name: "All India Institute of Medical Sciences (AIIMS)", location: "New Delhi", rating: 4.8, type: "medical_govt" },
  { name: "Christian Medical College (CMC)", location: "Vellore", rating: 4.7, type: "medical_govt" },
  { name: "Bangalore Medical College and Research Institute", location: "Bengaluru", rating: 4.5, type: "medical_govt" },
  { name: "Kasturba Medical College (KMC)", location: "Manipal", rating: 4.4, type: "medical_private" },
  { name: "St. John's Medical College", location: "Bengaluru", rating: 4.3, type: "medical_private" },
  { name: "Shri Ram College of Commerce (SRCC)", location: "New Delhi", rating: 4.6, type: "arts_top" },
  { name: "St. Stephen's College", location: "New Delhi", rating: 4.5, type: "arts_top" },
  { name: "Loyola College", location: "Chennai", rating: 4.4, type: "arts_top" },
  { name: "St. Xavier's College", location: "Mumbai", rating: 4.4, type: "arts_top" },
  { name: "Christ University", location: "Bengaluru", rating: 4.1, type: "arts_mid" },
  { name: "Fergusson College", location: "Pune", rating: 4.0, type: "arts_mid" },
  { name: "The Oxford College of Science", location: "Bengaluru", rating: 3.3, type: "arts_mid" },
  { name: "National Law School of India University (NLSIU)", location: "Bengaluru", rating: 4.8, type: "law_top" },
  { name: "Symbiosis Law School (SLS)", location: "Pune", rating: 4.3, type: "law_mid" },
  { name: "Army Institute of Law", location: "Mohali", rating: 3.8, type: "law_mid" },
];

async function main() {
  console.log("Cleaning database...");
  await prisma.savedCollege.deleteMany({});
  await prisma.placement.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.college.deleteMany({});
  console.log("Database cleaned successfully.");

  console.log("Seeding colleges...");
  for (const t of collegeTemplates) {
    // Generate rating with minor variance (+/- 0.1) clamped to [3.0, 4.8]
    const ratingVariance = randomRange(-0.1, 0.1);
    const rating = roundTo(clamp(t.rating + ratingVariance, 3.0, 4.8), 1);

    // Generate courses
    const coursesData = generateCoursesForType(t.type);

    // Calculate feesMin and feesMax for the college
    const fees = coursesData.map((c) => c.fees);
    const feesMin = Math.min(...fees);
    const feesMax = Math.max(...fees);

    // Generate placements
    const placementsData = generatePlacementsForType(t.type);

    console.log(`Creating ${t.name} in ${t.location}...`);
    await prisma.college.create({
      data: {
        name: t.name,
        location: t.location,
        rating: rating,
        feesMin: feesMin,
        feesMax: feesMax,
        courses: {
          create: coursesData,
        },
        placements: {
          create: placementsData,
        },
      },
    });
  }

  console.log(`Successfully seeded all ${collegeTemplates.length} colleges.`);
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
