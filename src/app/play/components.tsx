import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react';
import { Guess, AttributeType, AnswerType } from '../create/attributes';
import { Card, CardContent } from "@/components/ui/card";
import { GuessStatus } from '@/lib/guessComparison';
import React from 'react';
import "./styles.css";
import { getAuth } from "firebase/auth";
import { ConfettiBurst } from '@/components/ConfettiBurst';

type GuessResult = {
  guess: string;
  status: GuessStatus;
  details?: string;
  icon?: string;
};

type GuessResultContainer = {
  result: GuessResult[],
  name: string
};

export interface GameProps {
  answers: Record<string, AnswerType>,
  attributes: AttributeType[],
  name: string,
  gameId?: string,
  maxGuesses?: number;
}

const Game: React.FC<GameProps> = ({ answers, attributes, name, gameId, maxGuesses }) => {
  const [guesses, setGuesses] = useState<GuessResultContainer[]>([]);
  const [guessNames, setGuessNames] = useState<string[]>([]);
  const [curGuess, setCurGuess] = useState<string>('');
  const [filteredAnswers, setFilteredAnswers] = useState<AnswerType[]>(Object.values(answers));
  const [showDropdown, setShowDropdown] = useState(false);
  const [won, setWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [confettiBursts, setConfettiBursts] = useState<{ id: number; x: number; y: number }[]>([]);

  if (!Object.keys(answers).length) {
    return <h1>No answers.</h1>
  }

  const handleInputChange = (value: string) => {
    setCurGuess(value);
    if (value.trim() === "") {
      setFilteredAnswers([]);
      setShowDropdown(false);
      return;
    }

    const matches = Object.values(answers).filter(ans =>
      ans.name.toLowerCase().includes(value.toLowerCase()) && !guessNames.includes(ans.name)
    );

    setFilteredAnswers(matches);
    setShowDropdown(matches.length > 0);
  };

  // select a guess from dropdown
  const handleSelectGuess = (name: string) => {
    setCurGuess(name);
    setShowDropdown(false);
  };

  const resetGame = () => {
    setWon(false);
    setIsLost(false);
    setGuesses([]);
    setGuessNames([]);
    setCurGuess('');
  };

  // Update guesses array (each guess is an index of an answer from the 'answers' array)
  const makeGuess = async (guess: string) => {
    if (!guess || won) return;

    if (guessNames.includes(guess)) return;

    const res = await fetch("/api/checkGuess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, guess }),
    });

    if (!res.ok) {
      throw new Error('Failed to make guess.');
    }
    
    const { results, isWin } = await res.json();
    setWon(isWin);
    setGuessNames((prev) => [...prev, guess]);

    const newGuessCount = guessNames.length + 1;
    const isGuessLimitReached = maxGuesses && newGuessCount >= maxGuesses && !isWin;

    if (isGuessLimitReached) {
      setIsLost(true); // UI will still reflect loss
    }

    setGuesses((prev) => [...prev, { result: results, name: guess }]);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("❌ No user is logged in.");
      alert("❌ You must be logged in to track progress.");
      return;
    }


    const userId = currentUser.uid;
    const timeTaken = Math.floor(Math.random() * 100) + 1;

    const payload = { 
      userId,
      gameId,
      name,
      won: isWin,
      timeTaken,
    };

    const launchBursts = (count = 5) => {
      const bursts = Array.from({ length: count }).map((_, i) => {
        const id = Date.now() + i;
        // const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
        // const y = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.2;
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;

        const jitterRange = 250; // Try 30, 100, 200 for different feels
        const jitterX = (Math.random() - 0.5) * jitterRange;
        const jitterY = (Math.random() - 0.5) * jitterRange;


        //const jitterX = (Math.random() - 0.5) * 100; // -50 to +50 px
        //const jitterY = (Math.random() - 0.5) * 100;

        const x = screenCenterX + jitterX;
        const y = screenCenterY + jitterY;


        return { id, x, y };
      });

      setConfettiBursts(bursts); // Single state update → single re-render

      setTimeout(() => {
        setConfettiBursts([]);
      }, 2500);
    };

    if (isWin) {
      // Wait for full answer to render before doing win animation
      setTimeout(() => {
        setConfettiBursts([]);
        launchBursts();
      }, attributes.length * 400);
    }

    if (isGuessLimitReached) { // losing animation
      

    }

    // update if win OR lose
    if (isWin || isGuessLimitReached) {
      try {
        const res = await fetch("/api/updateUserHistory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
  
        if (!res.ok) {
          console.error("❌ API Error Response:");
          // alert("❌ Failed to update Firebase: " + (data.error || "Unknown error"));
          // return;
        }
  
      } catch (err: any) {
        console.error("❌ Network/Code Error:", err.message);
        //alert("❌ Error updating Firebase: " + err.message);
      }
    }
  };

  const renderHeaders = () => (
    <>
      <div></div>
      {attributes.map((attr: AttributeType, index: number) => (
        <Card key={`header-${index}`} className="bg-gray-100 text-center font-bold p-2 border min-w-[100px] max-w-[300px]">
          {attr.name}
        </Card>
      ))}
    </>
  );

  const renderRows = () => {
    return guesses.map((guess, rowIndex) => {
      return (
        <React.Fragment key={`row-${rowIndex}`}>
          <div>
            <>{console.log(answers[guess.name].icon)}</>
            <Card className="p-2 bg-gray-100 flex font-bold items-center justify-center aspect-square min-w-[100px] max-w-[300px] card"
              style={answers[guess.name].icon ? {
                backgroundImage: `url(${answers[guess.name].icon})`,
              } : {}}
            >
              <CardContent className="card-content flex aspect-square items-center justify-center truncate">
                <span className="text-2xl text">{guess.name}</span>
              </CardContent>
            </Card>
          </div>
          {guess.result.map((cur, colIndex: number) => (
            <Guess
              key={`cell-${rowIndex}-${colIndex}`}
              colIndex={colIndex}
              rowIndex={rowIndex}
              guess={cur.guess || 'Value'}
              status={cur.status}
              details={cur.details}
            />
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-4">
      {maxGuesses && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          Guesses: {guessNames.length} / {maxGuesses}
        </p>
      )}


      {confettiBursts.map((burst) => (
        <ConfettiBurst key={burst.id} x={burst.x} y={burst.y} id={burst.id} />
      ))}

      {isLost && (
        <p className="mt-4 text-lg font-semibold text-red-600 lost-text">
          ❌ You lost! Try again next time! ❌
        </p>
      )}
      <div className="max-w-6xl w-full flex flex-col bg-white rounded-lg p-6 mb-4 justify-center items-center">
        <h2 className="text-xl mb-4 font-bold text-center">{name}</h2>


        {!won && !isLost &&
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={curGuess}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key == 'Enter') e.preventDefault();
                }}
                onFocus={() => setShowDropdown(filteredAnswers.length > 0)}
                placeholder="Type to search..."
                className="w-full border rounded p-2"
              />
              {showDropdown && (
                <div className="absolute left-0 w-full bg-white border rounded shadow-md z-10 max-h-40 overflow-y-auto">
                  {filteredAnswers.map((ans, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleSelectGuess(ans.name)}>
                      {ans.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => makeGuess(curGuess)}
              className="px-4 py-2 bg-red-500 text-white rounded">
              Guess
            </button>
          </div>}
        <div
          className="grid gap-2 mt-10"
          style={{ gridTemplateColumns: `repeat(${attributes.length + 1}, minmax(100px, 300px))` }}
        >
          {renderHeaders()}
          {renderRows()}
        </div>

        <button onClick={resetGame} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Reset
        </button>
      </div>
    </div>
  );
};

export { Game };