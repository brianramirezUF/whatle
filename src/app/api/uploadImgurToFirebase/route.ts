import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { addDoc, collection } from 'firebase/firestore';

export const config = {
    api: {
        bodyParser: false
    }
};

export async function POST(req: Request){
    try {
        const imageUrl = await req.text();

        await addDoc(collection(db, 'uploadedImages'), {
            imageUrl
        })

        return NextResponse.json({ message: 'Saved image on FireBase' });
    } catch (e) {
        console.error("Error uploading", e);
        return NextResponse.json({ message: 'FireBase Image save failed' }, { status: 500 });
    }
}