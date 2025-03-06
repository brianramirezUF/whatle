'use client'
import { useEffect, useState } from 'react';
import { EditableAnswer, Answer, EditableAttribute, Attribute, Game } from './components';

// TODO: replace component CSS to whatever style we are using + shadcn

export default function GamePage() {
    const [attributes, setAttributes] = useState([]);
    const [attrEditingId, setAttrEditingId] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [ansEditingId, setAnsEditingId] = useState(null);

    useEffect(() => {
        // Update answer objects when attributes change
        setAnswers([...answers]);
    }, [attributes]);

    const addAttribute = () => {
        const newAttribute = {
            id: attributes.length,
            name: 'Attribute',
            type: 'String'
        };

        setAttributes([...attributes, newAttribute]);
    };

    const addAnswer = () => {
        if (!attributes.length) return;

        const newAnswer = {
            // Answer has an ID (basically an index) in the list of possible answers
            id: answers.length,
            // Automatically get all attributes and add to the answer
            ...attributes.reduce((acc, attr) => ({
                ...acc,
                [attr.id]: ''
            }), {})
        };

        setAnswers([...answers, newAnswer]);
    };

    const handleAnswerSave = (id, values) => {
        setAnswers(answers.map((answer) => {
            if (answer.id === id) {
                return {
                    ...answer,
                    ...values
                };
            }
            return answer;
        }));
        setAnsEditingId(null);
    };

    // Change ID (index) of current editing answer
    const handleAnswerEdit = (id) => {
        setAnsEditingId(id);
    };

    // Change ID (index) of current editing attribute
    const handleAttributeEdit = (id) => {
        setAttrEditingId(id);
    };
 
    const handleAttributeSave = (id, name, type) => {
        // Sort by ID and edit selected
        setAttributes(attributes.map((attribute) => {
            return attribute.id === id ? { ...attribute, name, type } : attribute;
        }));

        setAttrEditingId(null);
    };

    const content = (
        <div className='App'>
            <h1 className='font-bold'>Attribute List</h1>
            <button onClick={addAttribute} className='decoration-dashed underline'>Add New Attribute</button>
            <a target='_blank' rel='noopener noreferrer' className='decoration-dashed underline table'
                href={"data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ attributes }, null, 2))}
            >Display as JSON</a>
            <div className='mt-2'>
                {attributes.map(attribute => (
                    <div key={attribute.id} className='my-5 p-5 border-2 border-white-600'>
                        {attrEditingId === attribute.id ? (
                            <EditableAttribute
                                attribute={attribute}
                                onSave={handleAttributeSave}
                            />
                        ) : (
                            <Attribute
                                attribute={attribute}
                                onEdit={handleAttributeEdit}
                            />
                        )}
                    </div>
                ))}
            </div>
            <h1 className='font-bold'>Answer List</h1>
            <button onClick={addAnswer} className='decoration-dashed underline'>Add New Answer</button>
            <a target='_blank' rel='noopener noreferrer' className='decoration-dashed underline table'
                href={"data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ answers }, null, 2))}
            >Display as JSON</a>
            <div className='mt-2'>
                {attributes.length > 0 && answers.map(answer => (
                    <div key={answer.id} className='my-5 p-5 border-2 border-white-600'>
                        {ansEditingId === answer.id ? (
                            <EditableAnswer
                                attributes={attributes}
                                answer={answer}
                                onSave={handleAnswerSave}
                            />
                        ) : (
                            <Answer
                                attributes={attributes}
                                answer={answer}
                                onEdit={handleAnswerEdit}
                            />
                        )}
                    </div>
                ))}
            </div>
            <h1 className='font-bold'>Game</h1>
            <Game answers={answers} attributes={attributes}></Game>
        </div>
    );

    return content;
};