import { NextResponse } from 'next/server';

export const config = {
    api: {
        bodyParser: false
    }
};

export async function POST(req: Request){
    try {
        const body = await req.formData();

        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                Authorization: `Client-ID ${process.env.imgur_clientId}`
            },
            body: body
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.data.error);
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error("Error uploading", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}