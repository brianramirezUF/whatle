'use client'
import { useState } from 'react';
import { AttributeType, AnswerType } from './attributes';
import { EditableAnswer, Answer, EditableAttribute, Attribute, Game } from './components';

// TODO: replace component CSS to whatever style we are using + shadcn
export default function GamePage() {
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [attrEditingName, setAttrEditingName] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
    const [ansEditingName, setAnsEditingName] = useState<string | null>(null);

    const addAttribute = () => {
        const newAttribute: AttributeType = {
            name: `Attribute ${attributes.length}`,
            type: 'String',
        };

        setAttributes([...attributes, newAttribute]);
    };

    const addAnswer = () => {
        if (!attributes.length) return;

        const name = `Answer ${Object.keys(answers).length}`;
        const newAnswer: AnswerType = {
            name,
            attributes: attributes.reduce<Record<string, string>>(
                (acc, attr) => ({
                    ...acc,
                    [attr.name]: '',
                }),
                {}
            ),
        };

        setAnswers({ ...answers, [name]: newAnswer });
    };

    // Map answer values to correct answer
    const handleAnswerSave = (name: string, values: {attributes: Record<string, string>}) => {
        setAnswers((prev) => ({
            ...prev,
            [name]: {
                name,
                attributes: { ...values.attributes },
            },
        }));

        setAnsEditingName(null);
    };

     // Change ID (name) of current editing answer (called by clicking pen icon in 'Answer' component ./components.tsx)
    const handleAnswerEdit = (name: string) => {
        setAnsEditingName(name);
    };

     // Change ID (name) of current editing attribute (called by clicking pen icon in 'Attribute' component ./components.tsx)
    const handleAttributeEdit = (name: string) => {
        setAttrEditingName(name);
    };

    const handleAttributeSave = (oldName: string, newName: string, type: string) => {
        setAttributes((prevAttributes) =>
            prevAttributes.map((attr) =>
                 // Check oldName to see if attribute key (name) changed 
                attr.name === oldName ? { name: newName, type } : attr
            )
        );

        // Update existing answers to correctly display changed attributes
        setAnswers((prevAnswers) => {
             // Copy existing attributes, keeping old values when renaming
            const updatedAnswers: Record<string, AnswerType> = Object.keys(prevAnswers).reduce<Record<string, AnswerType>>(
                (acc, answerKey) => {
                    const answer = prevAnswers[answerKey];

                    const updatedAttributes: Record<string, string> = Object.entries(answer.attributes).reduce<Record<string, string>>(
                        (attrAcc, [key, value]) => {
                            attrAcc[key === oldName ? newName : key] = value;
                            return attrAcc;
                        },
                        {}
                    );

                    acc[answerKey] = { ...answer, attributes: updatedAttributes };
                    return acc;
                },
                {} as Record<string, AnswerType> // Explicitly define the accumulator type
            );

            return updatedAnswers;
        });

        setAttrEditingName(null);
    };

    const content = (
        <div className='m-5'>
            <h1 className='font-bold'>Attribute List</h1>
            <button onClick={addAttribute} className='decoration-dashed underline'>
                Add New Attribute
            </button>
            <a
                target='_blank'
                rel='noopener noreferrer'
                className='decoration-dashed underline table'
                href={
                    'data:application/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify({ attributes }, null, 2))
                }
            >
                Display as JSON
            </a>
            <div className='mt-2'>
                {/* Display all attributes */}
                {attributes.map((attribute, index) => (
                    <div key={index} className='my-5 p-5 border-2 border-white-600'>
                        {/* If an attribute is currently being edited, set that answer component to EditableAttribute */}
                        {attrEditingName === attribute.name ? (
                            <EditableAttribute attribute={attribute} onSave={handleAttributeSave} />
                        ) : (
                            <Attribute attribute={attribute} onEdit={handleAttributeEdit} />
                        )}
                    </div>
                ))}
            </div>
            <h1 className='font-bold'>Answer List</h1>
            <button onClick={addAnswer} className='decoration-dashed underline'>
                Add New Answer
            </button>
            <a
                target='_blank'
                rel='noopener noreferrer'
                className='decoration-dashed underline table'
                href={
                    'data:application/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify({ answers }, null, 2))
                }
            >
                Display as JSON
            </a>
            <div className='mt-2'>
                {/* Display all answers (can't have an answer without any attributes) */}
                {attributes.length > 0 &&
                    Object.values(answers).map((answer, index) => (
                        <div key={index} className='my-5 p-5 border-2 border-white-600'>
                            {/* If an answer is currently being edited, set that answer component to EditableAnswer */}
                            {ansEditingName === answer.name ? (
                                <EditableAnswer
                                    attributes={attributes}
                                    answer={answer}
                                    onSave={handleAnswerSave}
                                />
                            ) : (
                                <Answer attributes={attributes} answer={answer} onEdit={handleAnswerEdit} />
                            )}
                        </div>
                    ))}
            </div>
            <h1 className='font-bold'>Game</h1>
            {/* TESTING: Game here / TODO: have dedicated page for Games */}
            <Game answers={answers} attributes={attributes} />
        </div>
    );

    return content;
}
