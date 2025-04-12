import { Icons } from '@/components/icons'
import { useState } from 'react';
import { Guess, AttributeType, AnswerType, comparisons, GuessStatus } from '../create/attributes';
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import "./styles.css";
import { getAuth } from "firebase/auth";



const Games = [
  {
    id: "4",
    name: "MLBdle",
    icon: "https://i.imgur.com/B7wb5i6_d.webp?maxwidth=520&shape=thumb&fidelity=high",
  },
  {
    id: "2",
    name: "Pokedle",
    icon: "https://i.imgur.com/5ValAxb.jpeg",
  },
  {
    id: "3",
    name: "NBAdle",
    icon: "https://i.imgur.com/PV54ZYq_d.webp?maxwidth=520&shape=thumb&fidelity=high",
  },
  {
    id: "1",
    name: "Marvelde",
    icon: "https://i.imgur.com/YZwdjey.jpeg",
  },
];

export interface GameProps {
  answers: Record<string, AnswerType>,
  attributes: AttributeType[],
  name: string
}

const Game: React.FC<GameProps> = ({ answers, attributes, name }) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [curGuess, setCurGuess] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<AnswerType | null>(null);
  const [filteredAnswers, setFilteredAnswers] = useState<AnswerType[]>(Object.values(answers));
  const [showDropdown, setShowDropdown] = useState(false);
  let won = false;

  if (!Object.keys(answers).length) {
    return <h1>No answers.</h1>
  }

  const getRandomAnswer = (): AnswerType => {
    const keys = Object.keys(answers);
    const answer = answers[keys[Math.floor(Math.random() * keys.length)]];

    return answer;
  };

  const handleInputChange = (value: string) => {
    setCurGuess(value);
    if (value.trim() === "") {
      setFilteredAnswers([]);
      setShowDropdown(false);
      return;
    }

    const matches = Object.values(answers).filter(ans =>
      ans.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredAnswers(matches);
    setShowDropdown(matches.length > 0);
  };

  // select a guess from dropdown
  const handleSelectGuess = (name: string) => {
    setCurGuess(name);
    setShowDropdown(false);
  };

  // Reset stateful values
  const newGame = () => {
    setGuesses([]);
    setCurGuess('');

    setCorrectAnswer(getRandomAnswer());
    console.log(correctAnswer);
  };

  // Update guesses array (each guess is an index of an answer from the 'answers' array)
  const makeGuess = async (guess: string) => {
    if (!guess || !correctAnswer) return;
  
    setGuesses((prev) => [...prev, guess]);
  
    const isWin = guess === correctAnswer.name;
    won = isWin;
  
    const auth = getAuth();
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      console.error("❌ No user is logged in.");
      alert("❌ You must be logged in to track progress.");
      return;
    }
  
    const userId = currentUser.uid;
    const gameId = "4"; // Or whatever game you're testing
    const timeTaken = Math.floor(Math.random() * 100) + 1;
  
    const payload = {
      userId,
      gameId,
      name,
      won: isWin,
      timeTaken,
    };
  
  
    try {
      const res = await fetch("/api/updateUserHistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("❌ API Error Response:", data);
        alert("❌ Failed to update Firebase: " + (data.error || "Unknown error"));
        return;
      }
  
    } catch (err: any) {
      console.error("❌ Network/Code Error:", err.message);
      alert("❌ Error updating Firebase: " + err.message);
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
    return guesses.map((guessName, rowIndex) => {
      const guessedAnswer = answers[guessName];
      if (!guessedAnswer || !correctAnswer) return null;

      return (
        <React.Fragment key={`row-${rowIndex}`}>
           <div>
            <Card className="p-2 bg-gray-100 flex font-bold items-center justify-center aspect-square min-w-[100px] max-w-[300px] card"
              style={Games[3].icon ? {
                backgroundImage: `url(${Games[3].icon})`,
              } : {}}
            >
              {/* <CardContent className="text-center">{guessName}</CardContent> */}
              <CardContent className="card-content flex aspect-square items-center justify-center truncate">
                <span className="text-2xl text">{guessName}</span>
              </CardContent>
            </Card>
          </div>
          {attributes.map((attr: AttributeType, colIndex: number) => (
             <div style={{ animationDelay: `${colIndex * .4}s` }} className="fade-in">
            <Card
              key={`${rowIndex}-${colIndex}`}
              className="p-2 shadow-md flex items-center justify-center border aspect-square min-w-[100px] max-w-[300px]"
              style={{
                backgroundColor: comparisons[attr.type as keyof typeof comparisons](
                  guessedAnswer.attributes[attr.name],
                  correctAnswer.attributes[attr.name]
                ).status,
                backgroundImage: (() => {
                  const status = comparisons[attr.type as keyof typeof comparisons](
                    guessedAnswer.attributes[attr.name],
                    correctAnswer.attributes[attr.name]
                  ).status;
            
                  if (status === GuessStatus.OVER) return `url('/svgs/arrowDown.svg')`;
                  if (status === GuessStatus.UNDER) return `url('/svgs/arrowUp.svg')`;
                  return 'none';
                })(),
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
              >
              <CardContent className="text-center ">
                <div className="flex items-center justify-center">
                  <span className="text-2xl text-center guess-text ">
                    <Guess
                      guess={guessedAnswer.attributes[attr.name] || 'Value'}
                      answer={correctAnswer.attributes[attr.name] || 'Value'}
                      type={attr.type}
                    />
                  </span>
                </div>
              </CardContent>
            </Card>
            </div>
          ))}

        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-4">
      <div className="max-w-6xl w-full flex flex-col bg-white rounded-lg p-6 mb-4 justify-center items-center">
        <h2 className="text-xl mb-4 font-bold text-center">{name}</h2>
        <div className="flex items-center gap-2 w-full max-w-md">
          {!won &&
            <div className="relative w-full">
              <input
                type="text"
                value={curGuess}
                onChange={(e) => handleInputChange(e.target.value)}
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
            </div>}
          <button
            onClick={() => makeGuess(curGuess)}
            className="px-4 py-2 bg-red-500 text-white rounded">
            Guess
          </button>
        </div>
        {correctAnswer && (
          <div
            className="grid gap-2 mt-10"
            style={{ gridTemplateColumns: `repeat(${attributes.length + 1}, minmax(100px, 300px))` }}
          >
            {renderHeaders()}
            {renderRows()}
          </div>
        )}

        <button onClick={newGame} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          New Game
        </button>
      </div>
    </div>
  );
};

export { Game };