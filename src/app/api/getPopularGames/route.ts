import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { collection, getDocs } from 'firebase/firestore';

// GET /api/getPopularGames
// fb postman test:
// http://localhost:3000/api/getPopularGames

export async function GET(req: Request) {
  try {
    const gamesCollection = collection(db, "games");
    const gamesSnapshot = await getDocs(gamesCollection);

    const games = gamesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(games, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
