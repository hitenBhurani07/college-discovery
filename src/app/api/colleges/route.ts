import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination Parameters
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") ?? "10")));
    const skip = (page - 1) * limit;

    // Filter/Search Parameters
    const search = searchParams.get("search") || searchParams.get("name") || "";
    const location = searchParams.get("location") || "";
    const minRating = parseFloat(searchParams.get("minRating") ?? "");
    const minFees = parseInt(searchParams.get("minFees") ?? "");
    const maxFees = parseInt(searchParams.get("maxFees") ?? "");

    // Build the dynamic Prisma filter object
    const where: any = {};

    // Name Search (case-insensitive partial match)
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Location filter (case-insensitive match)
    if (location) {
      where.location = {
        equals: location,
        mode: "insensitive",
      };
    }

    // Rating filter (greater than or equal to)
    if (!isNaN(minRating)) {
      where.rating = {
        gte: minRating,
      };
    }

    // Fee range filter (checks overlap of college min-max range with input range)
    if (!isNaN(minFees) || !isNaN(maxFees)) {
      const feeConditions: any[] = [];
      if (!isNaN(minFees)) {
        // The college's maximum course fee must be at least the minFees requested
        feeConditions.push({ feesMax: { gte: minFees } });
      }
      if (!isNaN(maxFees)) {
        // The college's minimum course fee must be at most the maxFees requested
        feeConditions.push({ feesMin: { lte: maxFees } });
      }
      
      if (feeConditions.length > 0) {
        where.AND = feeConditions;
      }
    }

    // Fetch data and total count concurrently
    const [data, total] = await Promise.all([
      prisma.college.findMany({
        where,
        include: {
          courses: true,
          placements: true,
        },
        skip,
        take: limit,
        orderBy: {
          rating: "desc", // Default ordering by rating descending
        },
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/colleges:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
