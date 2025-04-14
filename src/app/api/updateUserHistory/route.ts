import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, gameId, name, won, timeTaken } = await req.json();
    console.log("Received update history request:", { userId, gameId, name, won, timeTaken });

    if (!userId || !gameId || !name || typeof won !== "boolean" || typeof timeTaken !== "number") {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const prevHistory = userData.history || {};

    const currentGame = prevHistory[gameId] || {
      id: gameId,
      name: name,
      numPlays: 0,
      numWins: 0,
      fastestTime: Number.MAX_SAFE_INTEGER,
    };

    const updatedGame = {
      ...currentGame,
      numPlays: currentGame.numPlays + 1,
      numWins: currentGame.numWins + (won ? 1 : 0),
      fastestTime: Math.min(currentGame.fastestTime, timeTaken),
    };

    const updatedHistory = {
      ...prevHistory,
      [gameId]: updatedGame,
    };

    await setDoc(userRef, { ...userData, history: updatedHistory });
    /*console.log("✅ Firestore updated for user:", userId);
    console.log("📦 Updated history object:", updatedHistory);*/

    return NextResponse.json({ success: true, updatedGame }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
