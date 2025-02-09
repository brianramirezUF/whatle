import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const accessToken = url.searchParams.get('access_token');
        const user = url.searchParams.get('state');

        console.log(accessToken, user);

        if (!accessToken || !user) {
            return NextResponse.json({ error: "Missing access token or uid" }, { status: 400 });
        }

        const userInfo = await getDoc(doc(db, "users", user))

        if (!userInfo) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await updateDoc(doc(db, "users", user), {
            imgurToken: accessToken
        });

        return NextResponse.json({ message: "Imgur authentication successful" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}