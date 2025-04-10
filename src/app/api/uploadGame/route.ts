import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, collection, setDoc, query, getDocs, where } from 'firebase/firestore';

// TODO: update firebase rules and authentication to verify correct user is updating correct
// PUT /api/uploadGame
export async function POST(req: Request) {
    const body = await req.json();
    const uid = body.uid;
    /*const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }*/

    try {
        // Verify the ID token
        /*const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid; // Extract uid from the decoded token*/

        // Game names are unique on a per user basis (two users can have the same game name,
        // but one user cannot have multiple of the same name)
        const gameRef = query(collection(db, 'games'), where('name', '==', body.name), where('uid', '==', uid));
        const gameSnapshot = await getDocs(gameRef);
        
        if (gameSnapshot.docs.length === 0) {
            // Game does not exist, create new document
            const gamePointer = doc(collection(db, 'games'));
            const gameRef = await setDoc(gamePointer, { ...body, uid });

            return NextResponse.json({ ref: gameRef, message: 'Game uploaded successfully' }, { status: 201 });
        } else {
            // Game exists, update document
            const gameDoc = gameSnapshot.docs[0];
            await setDoc(gameDoc.ref, { ...body, uid }, { merge: true });

            return NextResponse.json({ id: gameDoc.id, message: 'Game updated successfully' }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}