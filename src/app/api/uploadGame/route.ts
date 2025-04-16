import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, collection, setDoc, query, getDocs, where } from 'firebase/firestore';
import { adminAuth, adminDB } from '@/config/firebaseAdmin';

// TODO: update firebase rules and authentication to verify correct user is updating correct
// PUT /api/uploadGame
export async function POST(req: Request) {
    const body = await req.json();
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
        // Verify the ID token
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid; // Extract uid from the decoded token

        const gamesRef = adminDB.collection('games');
        let gameDoc;

        // Try finding by document ID
        if (body.id) {
            const doc = await gamesRef.doc(body.id).get();
            if (doc.exists && doc.data()?.uid === uid) {
                gameDoc = doc;
            }
        }

        // Game names are unique on a per user basis (two users can have the same game name,
        // but one user cannot have multiple of the same name)
        const nameQuery = await gamesRef.where('name', '==', body.name).where('uid', '==', uid).get();
        if (!nameQuery.empty) {
            return NextResponse.json({ error: `Game of the same name "${body.name}" already exists in your account!` }, { status: 500 });;
        }

        if (!gameDoc) {
            // Game does not exist and name is not duplicate, create new document
            const keys = Object.keys(body.answers);
            const randomAnswer = body.answers[keys[Math.floor(Math.random() * keys.length)]];

            const gameDoc = gamesRef.doc();
            await gameDoc.set({ ...body, correct_answer: randomAnswer, uid, daily_plays: 0, total_plays: 0 });

            return NextResponse.json({ id: gameDoc.id, message: `${body.name} was uploaded successfully!` }, { status: 201 });

        } 
        else {
            // Game exists, update document
            const gameData = gameDoc.data();
            await gameDoc.ref.set({ ...body, ...gameData, name: body.name, answers: body.answers, attributes: body.attributes, uid });

            return NextResponse.json({ id: gameDoc.id, message: `${body.name} was updated successfully!` }, { status: 200 });
        }
    } 
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
