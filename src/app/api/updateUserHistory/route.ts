import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { adminAuth, adminDB } from '@/config/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { gameId, name, won, timeTaken } = await req.json();
    
    console.log('Received update history request:', { gameId, name, won, timeTaken });

    if (!gameId || !name || typeof won !== 'boolean' || typeof timeTaken !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid; // Extract uid from the decoded token
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
    /*console.log('✅ Firestore updated for user:', userId);
    console.log('📦 Updated history object:', updatedHistory);*/

    const gameRef = adminDB.collection('games').doc(gameId);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const gameData = gameSnap.data();
    await gameRef.set({...gameData, daily_plays: gameData?.daily_plays + 1, total_plays: gameData?.total_plays + 1 });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
