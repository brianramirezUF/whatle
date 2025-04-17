import { NextResponse } from 'next/server';
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

        if (!gameDoc) {
            // Game names are unique on a per user basis (two users can have the same game name,
            // but one user cannot have multiple of the same name)
            const nameQuery = await gamesRef.where('name', '==', body.name).where('uid', '==', uid).get();
            if (!nameQuery.empty) {
                return NextResponse.json({ error: `Game of the same name "${body.name}" already exists in your account!` }, { status: 500 });;
            }

            // Game does not exist and name is not duplicate, create new document
            const keys = Object.keys(body.answers);
            const randomAnswer = keys[Math.floor(Math.random() * keys.length)];

            const gameDoc = gamesRef.doc();
            await gameDoc.set({ 
                name: body.name,
                answers: body.answers,
                attributes: body.attributes,
                maxGuesses: body.maxGuesses,
                tag: body.tag,
                correct_answer: randomAnswer,
                uid,
                daily_plays: 0,
                total_plays: 0
            });

            return NextResponse.json({ id: gameDoc.id, message: `${body.name} was uploaded successfully!` }, { status: 201 });

        } 
        else {
            // Game exists, update document
            const gameData = gameDoc.data();

            let randomAnswer;
            const keys = Object.keys(body.answers);
            if (!keys.includes(gameData?.correct_answer)) {
                // Create new correct answer (old one deleted)
                randomAnswer = keys[Math.floor(Math.random() * keys.length)];
                await gameDoc.ref.set({
                    ...gameData, 
                    name: body.name, 
                    answers: body.answers, 
                    attributes: body.attributes,
                    maxGuessses: body.maxGuesses,
                    tag: body.tag, 
                    correct_answer: randomAnswer, 
                    uid 
                });
            }
            else {
                await gameDoc.ref.set({
                    ...gameData, 
                    name: body.name, 
                    answers: body.answers, 
                    attributes: body.attributes,
                    maxGuessses: body.maxGuesses,
                    tag: body.tag, 
                    uid 
                });
            }

            return NextResponse.json({ id: gameDoc.id, message: `${body.name} was updated successfully!` }, { status: 200 });
        }
    } 
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
