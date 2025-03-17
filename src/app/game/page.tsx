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

    const handleAnswerEdit = (name: string) => {
        setAnsEditingName(name);
    };

    const handleAttributeEdit = (name: string) => {
        setAttrEditingName(name);
    };

    const handleAttributeSave = (oldName: string, newName: string, type: string) => {
        setAttributes((prevAttributes) =>
            prevAttributes.map((attr) =>
                attr.name === oldName ? { name: newName, type } : attr
            )
        );

        setAnswers((prevAnswers) => {
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
                {attributes.map((attribute, index) => (
                    <div key={index} className='my-5 p-5 border-2 border-white-600'>
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
                {attributes.length > 0 &&
                    Object.values(answers).map((answer, index) => (
                        <div key={index} className='my-5 p-5 border-2 border-white-600'>
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
            <Game answers={answers} attributes={attributes} />
        </div>
    );

    return content;
}
