import { NextResponse } from 'next/server';
import { adminDB } from '@/config/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const { gameId, name, won, timeTaken } = await req.json();

        console.log('Received update history request:', { gameId, name, won, timeTaken });

        if (!gameId || !name || typeof won !== 'boolean' || typeof timeTaken !== 'number') {
            return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
        }

        const gameRef = adminDB.collection('games').doc(gameId);
        const gameSnap = await gameRef.get();

        if (!gameSnap.exists) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const gameData = gameSnap.data();
        await gameRef.set({ ...gameData, daily_plays: gameData?.daily_plays + 1, total_plays: gameData?.total_plays + 1 });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
