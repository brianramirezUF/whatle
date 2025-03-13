import { Icons } from '@/components/icons'
import { useState } from 'react';

// TODO: change answers to be a map, "name": {answer}

// TODO: replace component CSS to whatever style we are using + shadcn
const EditableAnswer = ({ attributes, answer, onSave }) => {
    const [values, setValues] = useState({
        attributes: attributes.reduce((acc, attr) => ({
            ...acc,
            [attr.name]: answer?.attributes[attr.name] || ''
        }), {})
    });

    const handleChange = (attributeName, value) => {
        setValues(prev => ({
            attributes: {
                ...prev.attributes,
                [attributeName]: value
            }
        }));
    };

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

const Answer = ({ attributes, answer, onEdit }) => {
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

const EditableAttribute = ({ attribute, onSave }) => {
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

const Attribute = ({ attribute, onEdit }) => {
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

const Game = ({ answers, attributes }) => {
    const [guesses, setGuesses] = useState([]);
    const [curGuess, setCurGuess] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState(null);
    let won = false;

    if (!Object.keys(answers).length) {
        return <h1>No answers.</h1>
    }

    // Reset stateful values
    const newGame = () => {
        setGuesses([]);
        setCurGuess('');

        const keys = Object.keys(answers);
        setCorrectAnswer(answers[keys[Math.floor(Math.random() * keys.length)]]);
    };

    // Update guesses array (each guess is an index of an answer from the 'answers' array)
    const makeGuess = (guess) => {
        console.log(guess);
        if (!guess) return;

        setGuesses([...guesses, guess]);
    }

    const content = (
        <div>
            {!won && <div>
                <select
                    value={curGuess}
                    onChange={(e) => setCurGuess(e.target.value)}
                    className='text-black'
                >
                    {/* Display all answers as an option in the select 
                        TODO: add a search/sort feature so users can type in their guess and have it display related guesses
                    */}
                    {Object.keys(answers).map((answerName, index) => {
                        // TODO: currently displaying a name for each given guess assumes that the first attribute is the name
                        return <option value={answerName} key={index}>{answerName || 'unnamed'}</option>
                    })}
                </select>
                <button onClick={() => makeGuess(curGuess)}>Guess</button>
            </div>
            }

            <button onClick={newGame}>New Game</button>
            <table className='background-white text-black'>
                <tbody>
                    <tr className='flex gap-5 items-center'>
                        {/* Show all attributes as a different header in the first row */}
                        <th key='name'>Name</th>
                        {attributes.map((attribute) => (
                            <th key={attribute.name}>{attribute.name}</th>
                        ))}
                    </tr>
                    {/* Show all guesses as a new row in the game table */}
                    {guesses.map((guess, index) => (
                        <tr className='flex gap-5 items-center' key={index}>
                            {/* For each attribute, compare the current guess to the correct answer, then show comparison */}
                            <td>{(correctAnswer.name == answers[guess].name) ? 'correct' : 'incorrect'}</td>
                            {attributes.map((attribute, index) => {
                                if (correctAnswer.attributes[attribute.id] == answers[guess].attributes[attribute.id]) {
                                    return <td key={index}>correct</td>
                                }

                                return <td key={index}>incorrect</td>
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return content;
};

export { EditableAnswer, Answer, EditableAttribute, Attribute, Game };