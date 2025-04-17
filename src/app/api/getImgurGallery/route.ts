import { NextResponse } from 'next/server';

export const config = {
    api: {
        bodyParser: false
    }
};

export async function GET(req: Request){
    try {
        const { searchParams } = new URL(req.url);
        const imgurAccessToken = searchParams.get("imgurAccessToken");
        const searchQuery = searchParams.get("searchQuery");
        const page = searchParams.get("page");
        if(!imgurAccessToken || !page){
            throw new Error("Missing imgur token or page");
        }
        let url;
        if (searchQuery) {
            url = `https://api.imgur.com/3/gallery/search?q=${encodeURIComponent(searchQuery)}&page=${encodeURIComponent(page)}`;
        } else {
            url = `https://api.imgur.com/3/gallery/hot/viral/week?page=${encodeURIComponent(page)}`;
        }
        console.log(url);
        console.log(imgurAccessToken)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${imgurAccessToken}`
            }
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data);
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error("Error uploading", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}