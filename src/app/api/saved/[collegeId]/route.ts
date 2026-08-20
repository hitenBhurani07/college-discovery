import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createClient } from "../../../../lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collegeId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collegeId } = await params;

    if (!collegeId) {
      return NextResponse.json({ error: "collegeId is required" }, { status: 400 });
    }

    // Delete the row — if it doesn't exist, Prisma throws P2025; treat that as 404
    await prisma.savedCollege.delete({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error?.code === "P2025") {
      // Record not found — not saved in the first place
      return NextResponse.json({ error: "Saved college not found" }, { status: 404 });
    }
    console.error("Error in DELETE /api/saved/[collegeId]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
