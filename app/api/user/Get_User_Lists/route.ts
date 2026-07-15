//app/api/user/Get_User_Lists/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server"; 

export async function GET(req: Request) {
    if(req.method === 'GET'){
        const res = await db.user.findMany()
        return NextResponse.json(res)
    }
}
