import { NextResponse } from "next/server";
import { auth, db } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
    const host = req.headers.get("host"); 
    const protocol = host?.includes("localhost") ? "http" : "https";
    const envUrl = `${protocol}://${host}/login/callback`;

    const IMGUR_CLIENT_ID = process.env.imgur_clientId;
    const IMGUR_REDIRECT_URI = encodeURIComponent(envUrl);

    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
        }

        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = credentials.user;

        await setDoc(doc(db, "users", user.uid), {
            email: user.email
        });

        const authUrl = `https://api.imgur.com/oauth2/authorize?client_id=${IMGUR_CLIENT_ID}&response_type=token&redirect_uri=${IMGUR_REDIRECT_URI}&state=${encodeURIComponent(user.uid)}`;

        return NextResponse.json({ user: user, imgurAuthUrl: authUrl }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}