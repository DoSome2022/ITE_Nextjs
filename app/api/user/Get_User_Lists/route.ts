//app/api/user/Get_User_Lists/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireLogin, requireRoles, userSafeSelect } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export async function GET(req: Request) {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    if(req.method === 'GET'){
        const res = await db.user.findMany({ select: userSafeSelect })
        return NextResponse.json(res)
    }
}
