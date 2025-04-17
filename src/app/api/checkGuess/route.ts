import { comparisons } from "@/lib/guessComparison";
import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
    const body = await req.json();
    const { gameId, guess } = body;

    if (!gameId) {
        return NextResponse.json({ error: "Missing game ID!" }, { status: 400 });
    }

    try {
        const gamePointer = doc(db, "games", gameId);
        const gameSnapshot = await getDoc(gamePointer);

        if (!gameSnapshot.exists()) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gameData = gameSnapshot.data();
        const correctAnswer = gameData.answers[gameData.correct_answer];
        const guessedAnswer = gameData.answers[guess];

        if (!guessedAnswer) {
            return NextResponse.json({ error: "Answer not found" }, { status: 404 });
        }

        const results = [];
        for (let i = 0; i < gameData.attributes.length; i++) {
            let result;
            const curAttribute = gameData.attributes[i];
            
            let correctAttribute = correctAnswer.attributes[curAttribute.name];
            let guessedAttribute = guessedAnswer.attributes[curAttribute.name];

            if (!correctAttribute) {
                correctAttribute = 'N/A';
            }

            if (!guessedAttribute) {
                guessedAttribute = 'N/A';
            }

            if (curAttribute.type === 'Collection' && typeof correctAttribute === 'string' && typeof guessedAttribute === 'string') {
                const answerArray = correctAttribute.split(',').map(s => s.trim());
                const guessArray = guessedAttribute.split(',').map(s => s.trim());
                result = comparisons['Collection'](guessArray, answerArray);
              } 
              else {
                result = comparisons[curAttribute.type as keyof typeof comparisons](guessedAttribute, correctAttribute);
              }              
            
            results.push(result);
        }
        const isWin = (gameData.correct_answer == guess);
        return NextResponse.json({ results, isWin, guess }, { status: 200 });
    }
    catch (error: any) {
        console.error("Error in checkGuess API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
