// import { db } from "@/lib/db";
// import { NextResponse } from "next/server"; 

// export async function GET(req: Request) {
//     if(req.method === 'GET'){
//         const res = await db.courseModul.findMany()
//         return NextResponse.json(res)
//     }
// }


// /api/Course/Get_CourseModul_Lists/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireLogin, requireRoles } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.TEACHER, UserRole.ADMIN]);
    if (forbidden) return forbidden;

    const courseModuls = await db.courseModul.findMany({
      include: {
        Courses: true,
        Teacher: true,
      },

    });
    return NextResponse.json(courseModuls);
  } catch (error) {
    console.error("Get_CourseModul_Lists error:", error);
    return NextResponse.json(
      { error: "無法獲取課程模組列表" },
      { status: 500 }
    );
  }
}