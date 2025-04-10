import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc } from 'firebase/firestore';

// GET /api/getUserHistoryById?id=<userId>
// fb postman test:
// http://localhost:3000/api/getUserHistoryById?id=lKWKGCmoUWM5ggLm1pv90ltIlFU2

export async function GET(req: Request)  {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
        return NextResponse.json({ error: "Missing user ID!" }, { status: 400 });
    }

    try {
        const userPointer = doc(db, "users", userId);
        const userSnapshot = await getDoc(userPointer);

        if (!userSnapshot.exists()) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userSnapshot.data();
        return NextResponse.json({ ...userData.history }, { status: 200 });
    } 
    
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
