'use client'
import { useEffect, useState } from 'react';
import { EditableAnswer, Answer, EditableAttribute, Attribute, Game } from './components';

// TODO: replace component CSS to whatever style we are using + shadcn
export default function GamePage() {
    const [attributes, setAttributes] = useState([]);
    const [attrEditingName, setAttrEditingName] = useState(null);
    const [answers, setAnswers] = useState({});
    const [ansEditingName, setAnsEditingName] = useState(null);

    const addAttribute = () => {
        const newAttribute = {
            name: `Attribute ${attributes.length}`,
            type: 'String'
        };

        setAttributes([...attributes, newAttribute]);
    };

    const addAnswer = () => {
        if (!attributes.length) return;

        const name = `Answer ${Object.values(answers).length}`;
        const newAnswer = {
            // Automatically get all attributes and add to the answer
            name,
            attributes: attributes.reduce((acc, attr) => ({
                ...acc,
                [attr.name]: ''
            }), {})
        };

        setAnswers({ ...answers, [name]: newAnswer });
    };

    const handleAnswerSave = (name, values) => {
        setAnswers(prev => {
            const updatedAnswers = {
                ...prev,
                [name]: {
                    name,
                    attributes: {
                        ...values.attributes
                    }
                }
            };

            return updatedAnswers;
        });

        setAnsEditingName(null);
    };

    // Change ID (name) of current editing answer
    const handleAnswerEdit = (name) => {
        setAnsEditingName(name);
    };

    // Change ID (name) of current editing attribute
    const handleAttributeEdit = (name) => {
        setAttrEditingName(name);
    };

    const handleAttributeSave = (oldName, newName, type) => {
        // Check oldName to see if attribute key (name) changed 
        setAttributes(prevAttributes =>
            prevAttributes.map(attr =>
                attr.name === oldName ? { name: newName, type } : attr
            )
        );

        // Update existing answers to correctly display changed attributes
        setAnswers(prevAnswers => {
            const updatedAnswers = Object.keys(prevAnswers).reduce((acc, answerKey) => {
                const answer = prevAnswers[answerKey];
    
                // Copy existing attributes, keeping old values when renaming
                const updatedAttributes = Object.entries(answer.attributes).reduce((attrAcc, [key, value]) => {
                    if (key === oldName) {
                        attrAcc[newName] = value; // Assign old value to new attribute name (if name changed)
                    } else {
                        attrAcc[key] = value; // Keep existing attributes
                    }
                    return attrAcc;
                }, {});
    
                acc[answerKey] = { ...answer, attributes: updatedAttributes };
                return acc;
            }, {});
    
            return updatedAnswers;
        });

        setAttrEditingName(null);
    }

    const content = (
        <div className='m-5'>
            <h1 className='font-bold'>Attribute List</h1>
            <button onClick={addAttribute} className='decoration-dashed underline'>Add New Attribute</button>
            <a target='_blank' rel='noopener noreferrer' className='decoration-dashed underline table'
                href={"data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ attributes }, null, 2))}
            >Display as JSON</a>
            <div className='mt-2'>
                {attributes.map((attribute, index) => (
                    <div key={index} className='my-5 p-5 border-2 border-white-600'>
                        {attrEditingName === attribute.name ? (
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
                {attributes.length > 0 && Object.values(answers).map((answer, index) => (
                    <div key={index} className='my-5 p-5 border-2 border-white-600'>
                        {ansEditingName === answer.name ? (
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