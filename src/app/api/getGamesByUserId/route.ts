import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { getDocs, query, collection, where } from 'firebase/firestore';

// GET /api/getGamesByUserId?uid=<uid>
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
        return NextResponse.json({ error: 'Missing user ID!' }, { status: 400 });
    }

    try {
        const gameQuery = query(collection(db, 'games'), where('uid', '==', uid));
        const querySnapshot = await getDocs(gameQuery);

        const games = querySnapshot.docs.map((gameDoc) => {
            const data = gameDoc.data();
            return {
                id: gameDoc.id,
                uid: data.uid,
                name: data.name,
                icon: data.icon,
                daily_plays: data.daily_plays,
                total_plays: data.total_plays
            };
        });

        return NextResponse.json(games, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}