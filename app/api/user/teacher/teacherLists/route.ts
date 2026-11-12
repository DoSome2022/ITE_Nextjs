import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLogin, requireRoles } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export async function GET() {
  // const { searchParams } = new URL(request.url);
  // const role = searchParams.get("role");

  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    const teachers = await prisma.user.findMany({
      // where: {
      //   role: role === "TEACHER" ? "TEACHER" : undefined,
      // },
      select: {
        id: true,
        role:true,
        username: true,
      },
    });

    return NextResponse.json(teachers);
  } catch {
    return NextResponse.json(
      { error: "無法獲取教師列表" },
      { status: 500 }
    );
  }
}