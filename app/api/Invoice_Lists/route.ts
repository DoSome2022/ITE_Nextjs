import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireLogin, requireRoles } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export async function GET(req: Request) {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    if(req.method === 'GET'){
        const res = await db.invoice.findMany()
        return NextResponse.json(res)
    }
}
