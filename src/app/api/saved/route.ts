import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const savedColleges = await prisma.savedCollege.findMany({
      where: {
        userId: user.id,
      },
      include: {
        college: {
          include: {
            courses: true,
            placements: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(savedColleges);
  } catch (error) {
    console.error("Error in GET /api/saved:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { collegeId } = body;

    if (!collegeId) {
      return NextResponse.json(
        { error: "collegeId is required" },
        { status: 400 }
      );
    }

    // Verify college exists
    const collegeExists = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!collegeExists) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    // Upsert (to ignore duplicates atomically)
    const savedCollege = await prisma.savedCollege.upsert({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
      create: {
        userId: user.id,
        collegeId,
      },
      update: {}, // do nothing on update
    });

    return NextResponse.json(savedCollege, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/saved:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
