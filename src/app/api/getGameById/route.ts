import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc } from 'firebase/firestore';

// GET /api/getGameById?id=<gameId>
// fb postman test:
// http://localhost:3000/api/getGameById?id=hcCnbAKvmGRKwOep94Am

export async function GET(req: Request)  {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("id");

    if (!gameId) {
        return NextResponse.json({ error: "Missing game ID!" }, { status: 400 });
    }

    try {
        const gamePointer = doc(db, "games", gameId);
        const gameSnapshot = await getDoc(gamePointer);

        if (!gameSnapshot.exists()) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gameData = gameSnapshot.data();
        return NextResponse.json({ 
            id: gameSnapshot.id,
            answers: gameData.answers, 
            attributes: gameData.attributes, 
            name: gameData.name, 
            uid: gameData.uid,
            daily_plays: gameData.daily_plays,
            total_plays: gameData.total_plays
        }, 
        { status: 200 });
    } 
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}