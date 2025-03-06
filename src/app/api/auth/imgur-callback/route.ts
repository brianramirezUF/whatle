import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const refreshToken = url.searchParams.get('access_token');
        const user = url.searchParams.get('state');

        console.log(refreshToken, user);

        if (!refreshToken || !user) {
            return NextResponse.json({ error: "Missing access token or uid" }, { status: 400 });
        }

        const result = await RefreshTokens(refreshToken);
        
        if (result.success) {
            console.log('New tokens:', result.data);
        } else {
            console.error('Error:', result.message);
        }

        const userInfo = await getDoc(doc(db, "users", user))

        if (!userInfo) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await updateDoc(doc(db, "users", user), {
            imgurRefreshToken: result.data.refresh_token,
            imgurAccessToken: result.data.access_token,
        });

        return NextResponse.json({ message: "Imgur authentication successful" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function RefreshTokens(refreshToken: string) {
    const clientId = process.env.imgur_clientId;
    const clientSecret = process.env.imgur_clientSecret;

    if (!clientId || !clientSecret) {
        return { success: false, message: 'Missing imgur environmental tokens' };
    }

    try {
        const body = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
        });

        const response = await fetch("https://api.imgur.com/oauth2/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        if (!response.ok) {
            return { success: false, message: `Error: ${response.statusText}` };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        return { success: false, message: 'Failed to grab refresh token' };
    }
}