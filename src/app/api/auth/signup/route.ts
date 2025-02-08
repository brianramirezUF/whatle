import { NextResponse } from "next/server";
import { auth, db } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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

        return NextResponse.json({ user: user }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}