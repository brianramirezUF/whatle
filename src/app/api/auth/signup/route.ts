import { NextResponse } from "next/server";
import { auth, db } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const envUrl = 
process.env.NODE_ENV === "production" ? "https://whatle.com/api/auth/imgur-callback":
process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"? "https://preview.whatle.com/api/auth/imgur-callback": 
"http://localhost:3000/api/auth/imgur-callback";

console.log(envUrl);

const IMGUR_CLIENT_ID = process.env.imgur_clientId;
const IMGUR_REDIRECT_URI = encodeURIComponent(envUrl);
export async function POST(req: Request) {
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