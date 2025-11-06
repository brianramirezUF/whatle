import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/config/firebaseAdmin';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const expected = process.env.CRON_SECRET;

    if (!expected) {
        return NextResponse.json({ error: 'Server not configured.' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${expected}`) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    try {
        const gameSnapshot = await adminDB.collection('games').get();

        const updatePromises = gameSnapshot.docs.map(async (docSnap) => {
            const gameData = docSnap.data();
            const answers = gameData.answers;

            // Game has no answers field :(
            if (!answers) {
                return;
            }

            // Game has no answer values :(
            const keys = Object.keys(answers);
            if (keys.length === 0) {
                return;
            }

            const randomAnswer = keys[Math.floor(Math.random() * keys.length)];
            await adminDB.collection('games').doc(docSnap.id).update({
                correct_answer: randomAnswer,
                daily_plays: 0
            });
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ message: 'Games updated successfully' }, { status: 200 });
    }
    catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}