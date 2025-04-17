import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nameQuery = searchParams.get("name")?.toLowerCase();

  if (!nameQuery) return NextResponse.json([], { status: 200 });

  const gamesRef = collection(db, "games");
  const allGames = await getDocs(gamesRef);
  
  const results = allGames.docs
  .map(doc => {
    const data = doc.data() as { name?: string };
    return { id: doc.id, ...data };
  })
  .filter(game => game.name?.toLowerCase().includes(nameQuery));

  return NextResponse.json(results);
}
