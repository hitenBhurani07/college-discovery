import { prisma } from "../src/lib/db";

async function main() {
  const collegeCount = await prisma.college.count();
  const courseCount = await prisma.course.count();
  const placementCount = await prisma.placement.count();
  const savedCount = await prisma.savedCollege.count();

  console.log("DB_CHECK_COUNTS:", JSON.stringify({
    collegeCount,
    courseCount,
    placementCount,
    savedCount
  }));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
