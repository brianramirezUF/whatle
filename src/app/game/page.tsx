'use client';
import { useState } from 'react';
import { AttributeType, AnswerType } from './attributes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from 'react';

export default function GamePage() {
    const [gameName, setGameName] = useState<string>("Game Name");
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
    const [newAttributeName, setNewAttributeName] = useState<string>("");
    const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
    const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [values, setValues] = useState<string[]>(["ValA", "ValB", "ValC", "ValD", "ValE", "ValF"]);
    const [editingValue, setEditingValue] = useState<string | null>(null);
    const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
    const [currentlyEditing, setCurrentlyEditing] = useState<{ type: 'attribute' | 'value' | 'answer' | null; name: string | null }>({ type: null, name: null });
    const [attributeValues, setAttributeValues] = useState<Record<string, string[]>>({});



    const handleValueSelect = (attributeName: string, value: string) => {
        if (!selectedAnswer) {
            alert("Please select an answer first.");
            return;
        }
    
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [selectedAnswer]: {
                ...prevAnswers[selectedAnswer],
                attributes: {
                    ...prevAnswers[selectedAnswer].attributes,
                    [attributeName]: value, // Assign selected value
                },
            },
        }));
    };
    
    const handleValueEdit = (attributeName: string, oldValue: string, newValue: string) => {
        if (!newValue.trim()) return;
    
        setAttributeValues((prevValues) => ({
            ...prevValues,
            [attributeName]: prevValues[attributeName].map((val) => 
                val === oldValue ? newValue : val
            ),
        }));
    
        // Update any selected answers that use the edited value
        setAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers };
            Object.keys(updatedAnswers).forEach(answerKey => {
                if (updatedAnswers[answerKey].attributes[attributeName] === oldValue) {
                    updatedAnswers[answerKey].attributes[attributeName] = newValue;
                }
            });
            return updatedAnswers;
        });
    
        setEditingValue(null);
    };
    
    
    

    
    const handleAnswerSave = (oldName: string, newName: string) => {
        if (!newName.trim()) return;
        setAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers };
            updatedAnswers[newName] = { name: newName, attributes: { ...prevAnswers[oldName].attributes } };
            delete updatedAnswers[oldName];
            return updatedAnswers;
        });
        setEditingAnswer(null);
    };

    const handleValueSave = (oldValue: string, newValue: string) => {
        if (!newValue.trim()) return;
        setValues((prevValues) =>
            prevValues.map((val) => (val === oldValue ? newValue : val))
        );
        setEditingValue(null);
    };
    
    const handleAttributeSave = (oldName: string, newName: string) => {
        if (!newName.trim()) return;
    
        setAttributes((prevAttributes) =>
            prevAttributes.map((attr) =>
                attr.name === oldName ? { ...attr, name: newName } : attr
            )
        );
    
        // Update existing answers to reflect the new attribute name
        setAnswers((prevAnswers) => {
            const updatedAnswers: Record<string, AnswerType> = {};
            Object.keys(prevAnswers).forEach(answerKey => {
                updatedAnswers[answerKey] = {
                    ...prevAnswers[answerKey],
                    attributes: {
                        ...prevAnswers[answerKey].attributes,
                        [newName]: prevAnswers[answerKey].attributes[oldName]
                    }
                };
                delete updatedAnswers[answerKey].attributes[oldName];
            });
            return updatedAnswers;
        });
    
        setEditingAttribute(null);
    };
    
    // Add New Attribute
    const addAttribute = () => {
        const newAttribute: AttributeType = {
            name: `Attr ${attributes.length + 1}`,
            type: 'String',
        };
        setAttributes([...attributes, newAttribute]);
    
        // Add the new attribute to all existing answers with a default "-"
        setAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers };
            Object.keys(updatedAnswers).forEach(answerKey => {
                updatedAnswers[answerKey] = {
                    ...updatedAnswers[answerKey],
                    attributes: {
                        ...updatedAnswers[answerKey].attributes,
                        [newAttribute.name]: '-',
                    },
                };
            });
            return updatedAnswers;
        });
    };
    
    

    // Remove Latest Attribute
    const removeLastAttribute = () => {
        if (attributes.length === 0) return;
        const lastAttribute = attributes[attributes.length - 1].name;
        setAttributes(attributes.slice(0, -1));

        setAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers };
            Object.keys(updatedAnswers).forEach(answerKey => {
                delete updatedAnswers[answerKey].attributes[lastAttribute];
            });
            return updatedAnswers;
        });
    };

    // Add New Value
    const addValue = (attributeName: string) => {
        const newValue = prompt(`Enter new value for ${attributeName}:`);
        if (!newValue || !newValue.trim()) return;
    
        setAttributeValues((prevValues) => ({
            ...prevValues,
            [attributeName]: [...(prevValues[attributeName] || []), newValue],
        }));
    };
    
    
    

    // Remove Latest Value
    const removeLastValue = () => {
        if (values.length === 0) return;
        setValues(values.slice(0, -1));
    };

    // Add New Answer
    const addAnswer = () => {
        if (!attributes.length) return;
    
        const name = `Answer ${Object.keys(answers).length + 1}`;
        const newAnswer: AnswerType = {
            name,
            attributes: attributes.reduce<Record<string, string>>(
                (acc, attr) => ({
                    ...acc,
                    [attr.name]: '-', // Default value for each attribute
                }),
                {}
            ),
        };
        setAnswers({ ...answers, [name]: newAnswer });
    };
    
    

    return (
        <div className="flex flex-col items-center p-10 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold">CREATE GAME</h1>

            {/* Editable Game Name */}
            <Input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-1/3 mt-2 text-center border border-gray-300 rounded-lg px-2 py-1"
            />

            {/* Editable Attributes Section */}
            <div className="flex flex-col items-center mt-6">
                <div className="flex space-x-4">
                {attributes.map((attribute, index) => (
                    <div key={index} className="relative flex items-center space-x-2">
                        {editingAttribute === attribute.name ? (
                            <Input
                                defaultValue={attribute.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setAttributes((prevAttributes) =>
                                        prevAttributes.map((attr) =>
                                            attr.name === attribute.name ? { ...attr, name: newName } : attr
                                        )
                                    );
                                }}
                                autoFocus
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                            />
                        ) : (
                            <button
                                className={`px-4 py-2 rounded-full font-medium ${selectedAttribute === attribute.name ? "bg-red-400 text-white" : "bg-red-200"}`}
                                onClick={() => setSelectedAttribute(attribute.name)}
                            >
                                {attribute.name}
                            </button>
                        )}

                        <Button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents immediate closing when clicking the button
                                setEditingAttribute(attribute.name);
                            }}
                            className="bg-gray-300 text-black px-3 py-1 rounded-md"
                        >
                            Edit
                        </Button>
                    </div>
                ))}

                {/* Detects click outside to stop editing */}
                <div
                    onClick={() => setEditingAttribute(null)}
                    className="fixed top-0 left-0 w-full h-full -z-10"
                />

                </div>
                <div className="flex space-x-2 mt-2">
                    <Button onClick={addAttribute} className="bg-red-300 text-black px-4 py-2 rounded-full">+ Attr</Button>
                    {attributes.length > 0 && (
                        <Button onClick={removeLastAttribute} className="bg-red-500 text-white px-4 py-2 rounded-full">Remove</Button>
                    )}
                </div>
            </div>

            {/* Editable Values Section */}
            <div className="mt-6 w-3/4">
                <h2 className="text-lg font-semibold text-center">Answers</h2>
                <div className="border border-gray-300 rounded-lg overflow-hidden mt-3">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Name</th>
                                {attributes.map((attribute, index) => (
                                    <th key={index} className="border p-2">{attribute.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(answers).map(([answerKey, answer], index) => (
                                <tr key={index} className="border">
                                    <td
                                        className={`border p-2 cursor-pointer ${
                                            selectedAnswer === answerKey ? "bg-gray-300" : ""
                                        }`}
                                        onClick={() => setSelectedAnswer(answerKey)}
                                    >
                                        {answer.name}
                                    </td>

                                    {/* Dropdowns for Attributes */}
                                    {attributes.map((attribute, attrIndex) => (
                                        <td key={attrIndex} className="border p-2 text-center">
                                            <select
                                                className="border px-2 py-1 rounded"
                                                value={answer.attributes[attribute.name] || ""}
                                                onChange={(e) => handleValueSelect(attribute.name, e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {(attributeValues[attribute.name] || []).map((val, i) => (
                                                    <option key={i} value={val}>{val}</option>
                                                ))}
                                            </select>
                                            {/* Button to add new value */}
                                            <button
                                                onClick={() => addValue(attribute.name)}
                                                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                                            >
                                                +
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Button onClick={addAnswer} className="w-full bg-gray-200 text-black px-4 py-2 rounded-lg mt-4">
                    Add Possible Answer
                </Button>
            </div>


            
        </div>
    );
}
