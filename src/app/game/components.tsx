import { Icons } from '@/components/icons'
import { useState } from 'react';
import { Guess, AttributeType, AnswerType, comparisons  } from './attributes';
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';

// TODO: replace component CSS to whatever style we are using + shadcn
interface EditableAnswerProps {
    attributes: AttributeType[];
    answer: AnswerType;
    onSave: (name: string, values: { attributes: Record<string, string> }) => void;
}

// Component enabled when an answer is being edited (pen button on 'Answer' component clicked)
const EditableAnswer: React.FC<EditableAnswerProps> = ({ attributes, answer, onSave }) => {
    // Update attribute values
    const [values, setValues] = useState<{ attributes: Record<string, string>}>({
        attributes: attributes.reduce((acc, attr) => ({
            ...acc,
            [attr.name]: answer?.attributes[attr.name] || ''
        }), {})
    });

    const handleChange = (attributeName: string, value: string) => {
        setValues(prev => ({
            attributes: {
                ...prev.attributes,
                [attributeName]: value
            }
        }));
    };

    // Calls 'handleAnswerSave' in ./page.tsx (GamePage)
    const handleSave = () => {
        onSave(answer.name, values);
    };

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <span className='font-semibold text-lg'>{answer.name}</span>
            <table className="w-full border-collapse mt-2">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {attributes.map(attribute => (
                        <tr key={attribute.name} className="border-b">
                            <td className="p-2">{attribute.name}</td>
                            <td className="p-2">{attribute.type}</td>
                            <td className="p-2">
                                <input
                                    type='text'
                                    value={values.attributes[attribute.name] || ''}
                                    onChange={(e) => handleChange(attribute.name, e.target.value)}
                                    className='w-full p-1 border rounded bg-gray-100'
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSave} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
    );
};

interface AnswerProps {
    attributes: AttributeType[];
    answer: AnswerType;
    onEdit: (name: string) => void;
}

// Component to display a specific answer
const Answer: React.FC<AnswerProps> = ({ attributes, answer, onEdit }) => {
    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <span className='font-semibold text-lg'>{answer.name}</span>
            <table className="w-full border-collapse mt-2">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {attributes.map(attribute => (
                        <tr key={attribute.name} className="border-b">
                            <td className="p-2">{attribute.name || 'null'}</td>
                            <td className="p-2">{attribute.type || 'null'}</td>
                            <td className="p-2">{answer.attributes[attribute.name] || 'null'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Icons.pen onClick={() => onEdit(answer.name)} className="cursor-pointer text-gray-500 hover:text-gray-700 mt-2" />
        </div>
    );
};

interface EditableAttributeProps {
    attribute: AttributeType;
    onSave: (oldName: string, newName: string, type: string) => void;
}

// Component enabled when an attribute is being edited (pen button on 'Attribute' component clicked)
const EditableAttribute: React.FC<EditableAttributeProps> = ({ attribute, onSave }) => {
    const [name, setName] = useState(attribute.name);
    const [type, setType] = useState(attribute.type);

    return (
        <div className='p-4 border rounded-lg shadow-md bg-white flex gap-4 items-center'>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Name'
                className='p-2 border rounded w-1/2 bg-gray-100'
            />
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='p-2 border rounded bg-gray-100'
            >
                <option value='String'>String</option>
                <option value='Number'>Number</option>
                <option value='Boolean'>Boolean</option>
            </select>
            <button onClick={() => onSave(attribute.name, name, type)} className="px-4 py-2 bg-blue-500 text-white rounded">
                Save
            </button>
        </div>
    );
};

interface AttributeProps {
    attribute: AttributeType;
    onEdit: (name: string) => void;
}

// Component to display a specific attribute and its name/type
const Attribute: React.FC<AttributeProps> = ({ attribute, onEdit }) => {
    return (
        <div className='p-4 border rounded-lg shadow-md bg-white flex justify-between items-center'>
            <div>
                <span className='font-semibold'>{attribute.name}</span>
                <span className='text-gray-500 ml-2'>({attribute.type})</span>
            </div>
            <Icons.pen onClick={() => onEdit(attribute.name)} className="cursor-pointer text-gray-500 hover:text-gray-700" />
        </div>
    );
};

interface GameProps {
    answers: Record<string, AnswerType>,
    attributes: AttributeType[]
}

const Game: React.FC<GameProps> = ({ answers, attributes }) => {
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
    const makeGuess = (guess: string) => {
        if (!guess) return;

        setGuesses([...guesses, guess]);
    }

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
            <Card className="p-2 bg-gray-100 flex font-bold items-center justify-center aspect-square min-w-[100px] max-w-[300px]">
              <CardContent className="text-center">{guessName}</CardContent>
            </Card>
          </div>
            {attributes.map((attr: AttributeType, colIndex: number) => (
            <Card
                key={`${rowIndex}-${colIndex}`}
                className="p-2 shadow-md flex items-center justify-center border aspect-square min-w-[100px] max-w-[300px]"
                style={{ backgroundColor: comparisons[attr.type as keyof typeof comparisons](
                guessedAnswer.attributes[attr.name],
                correctAnswer.attributes[attr.name]
                ).status }} >
                    <CardContent className="text-center">
                  <div>
                    <Guess
                      guess={guessedAnswer.attributes[attr.name] || 'Value'}
                      answer={correctAnswer.attributes[attr.name] || 'Value'}
                      type={attr.type}
                    />
                    </div>
                  </CardContent>
                </Card>
              ))}

        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-4"> 
      <div className="max-w-6xl w-full flex flex-col bg-white rounded-lg p-6 mb-4 justify-center items-center">
        <h2 className="text-xl mb-4 font-bold text-center">Gameplay Board</h2>
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

//     // TODO: probably don't need to reupdate each previous guess for a new one, replace to use previous state for previous guesses
//     const content = (
//         <div>
//             {!won && <div>
//                 <select
//                     value={curGuess}
//                     onChange={(e) => setCurGuess(e.target.value)}
//                     className='text-black'
//                 >
//                     {/* Display all answers as an option in the select 
//                         TODO: add a search/sort feature so users can type in their guess and have it display related guesses
//                     */}
//                     {Object.keys(answers).map((answerName, index) => {
//                         // TODO: currently displaying a name for each given guess assumes that the first attribute is the name
//                         return <option value={answerName} key={index}>{answerName || 'unnamed'}</option>
//                     })}
//                 </select>
//                 <button onClick={() => makeGuess(curGuess)}>Guess</button>
//             </div>
//             }

//             <button onClick={newGame}>New Game</button>
//             <table className='background-white text-black'>
//                 <tbody>
//                     <tr className='flex gap-5 items-center'>
//                         {/* Show all attributes as a different header in the first row */}
//                         <th key='name'>Name</th>
//                         {attributes.map((attribute) => (
//                             <th key={attribute.name}>{attribute.name}</th>
//                         ))}
//                     </tr>
//                     {/* Show all guesses as a new row in the game table */}
//                     {correctAnswer && guesses.map((guess, index) => (
//                         <tr className='flex gap-5 items-center' key={index}>
//                             {/* For each attribute, compare the current guess to the correct answer, then show comparison */}

//                             <Guess guess={guess} answer={correctAnswer.name} type='String' />
//                             {attributes.map((attribute, index) => {
//                                 return <Guess key={index} guess={answers[guess].attributes[attribute.name] || 'Value'} answer={correctAnswer.attributes[attribute.name] || 'Value'} type={attribute.type} />
//                             })}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     return content;
 };

export { EditableAnswer, Answer, EditableAttribute, Attribute, Game };