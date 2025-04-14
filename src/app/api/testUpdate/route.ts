import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, updateDoc, getDocs } from 'firebase/firestore';

export async function GET(req: Request) {
    const authHeader = req.headers.get('x-cron-secret');
    if (authHeader !== `${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    try {
        const gameSnapshot = await getDocs(collection(db, 'games'));

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
            await updateDoc(docSnap.ref, {
                correct_answer: randomAnswer,
                daily_plays: 0,
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