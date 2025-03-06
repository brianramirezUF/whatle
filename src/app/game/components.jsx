import { Icons } from '@/components/icons'
import { useState } from 'react';

// TODO: replace component CSS to whatever style we are using + shadcn

const EditableAnswer = ({ attributes, answer, onSave }) => {
    const [values, setValues] = useState(
        attributes.reduce((acc, attribute) => ({
            ...acc,
            [attribute.id]: answer[attribute.id] || ''
        }), {})
    );

    const handleChange = (attributeId, value) => {
        setValues(prev => ({
            ...prev,
            [attributeId]: {'value': value, 'attribute': attributes[attributeId].name}
        }));
    };

    const handleSave = () => {
        onSave(answer.id, values);
    };

    return (
        <div>
            {attributes.map(attribute => (
                <div key={attribute.id} className="flex gap-5 items-center">
                    <span>Name: {attribute.name} Type: {attribute.type} Value: </span>
                    <input
                        type='text'
                        value={values[attribute.id].value || ''}
                        onChange={(e) => handleChange(attribute.id, e.target.value)}
                        className='text-black'
                    />
                </div>
            ))}
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

// Basic answer display
const Answer = ({ attributes, answer, onEdit }) => {
    return (
        <div>
            {attributes.map(attribute => (
                <div key={attribute.id} className="flex gap-5 items-center">
                    <span>Name: {attribute.name} Type: {attribute.type} Value: {answer[attribute.id]?.value || 'null'}</span>
                </div>
            ))}
            <Icons.pen onClick={() => onEdit(answer.id)} />
        </div>
    );
};

// Editable attribute
const EditableAttribute = ({ attribute, onSave }) => {
    const [name, setName] = useState(attribute.name);
    const [type, setType] = useState(attribute.type);

    const content = (
        <div className='flex gap-5 items-center'>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Name'
                className='text-black'
            />
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='text-black'
            >
                <option value='String'>String</option>
                <option value='Number'>Number</option>
                <option value='Boolean'>Boolean</option>
            </select>
            <button onClick={() => onSave(attribute.id, name, type)}>
                Save
            </button>
        </div>
    );

    return content;
};

// Display each attribute
const Attribute = ({ attribute, onEdit }) => {
    const content = (
        <div className='flex gap-5 items-center'>
            <span>Name: {attribute.name}</span>
            <span>Type: {attribute.type}</span>
            <Icons.pen onClick={() => onEdit(attribute.id)}></Icons.pen>
        </div>
    );

    return content;
};

const Game = ({ answers, attributes }) => {
    const [guesses, setGuesses] = useState([]);
    const [curGuess, setCurGuess] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    let won = false;

    if (!answers.length) {
        return <h1>No answers.</h1>
    }

    // Reset stateful values
    const newGame = () => {
        setGuesses([]);
        setCurGuess(0);
        setCorrectAnswer(Math.floor(Math.random() * answers.length))
        console.log(answers[correctAnswer])
    };

    // Update guesses array (each guess is an index of an answer from the 'answers' array)
    const makeGuess = (guess) => {
        setGuesses([...guesses, Number(guess)]);
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
                    {answers.map((_, index) => {
                        // TODO: currently displaying a name for each given guess assumes that the first attribute is the name
                        return <option value={index} key={index}>{answers[index][0].value || 'unnamed'}</option>
                    })}
                </select>
                <button onClick={() => makeGuess(curGuess)}>Guess</button>
            </div>
            }

            <button onClick={newGame}>New Game</button>
            <table className='background-white text-white'>
                <tbody>
                    <tr className='flex gap-5 items-center'>
                        {/* Show all attributes as a different header in the first row */}
                        {attributes.map((attribute) => (
                            <th key={attribute.id}>{attribute.name}</th>
                        ))}
                    </tr>
                    {/* Show all guesses as a new row in the game table */}
                    {guesses.map((guess, index) => (
                        <tr className='flex gap-5 items-center' key={index}>
                            {/* For eacah attribute, compare the current guess to the correct answer, then show comparison */}
                            {attributes.map((attribute, index) => {
                                if (answers[guess].length < attribute.id) return;
                                
                                if (answers[correctAnswer][attribute.id].value == answers[guess][attribute.id].value) {
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

export { EditableAnswer, Answer, EditableAttribute, Attribute, Game};