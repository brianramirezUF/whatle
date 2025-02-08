import { NextResponse } from "next/server";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
        }

        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const user = credentials.user;

        return NextResponse.json({ user: user }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}