//app/api/Type/Get_Type_Lists/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server"; 

export async function GET(req: Request) {
    if(req.method === 'GET'){
        const res = await db.courseProductType.findMany()
        return NextResponse.json(res)
    }
}
