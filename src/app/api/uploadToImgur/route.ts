import { NextResponse } from 'next/server';

export const config = {
    api: {
        bodyParser: false
    }
};

export async function POST(req: Request){
    try {
        const body = await req.formData();
        const { searchParams } = new URL(req.url);
        const imgurAccessToken = searchParams.get("imgurAccessToken");
        const imgurRefreshToken = searchParams.get("imgurRefreshToken");

        console.log(imgurAccessToken, imgurRefreshToken)

        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${imgurAccessToken}`
            },
            body: body
        });

        const data = await response.json();
        console.log(data);

        if(!response.ok){
            throw new Error(data);
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error("Error uploading", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}