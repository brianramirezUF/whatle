'use client'
import { useEffect, useState } from 'react';
import { AttributeType, AnswerType } from '../attributes';
import { EditableAnswer, Answer, EditableAttribute, Attribute } from '../components';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JsonParser } from '@/components/JsonParser';
import { GameProps } from '../../play/components';
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from "sonner";

export default function CreateGame() {
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [attrEditingName, setAttrEditingName] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
    const [ansEditingName, setAnsEditingName] = useState<string | null>(null);
    const [tempAnswerName, setTempAnswerName] = useState<string>("");
    const [gameName, setGameName] = useState<string>("Game Name");
    const [isLoading, setIsLoading] = useState(true);
    const [maxGuesses, setMaxGuesses] = useState<number>(6); 

    // Routing
    const params = useParams();
    const gameId = params.gameId;
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadGame = async () => {
            try {
                if (gameId == 'new-game') return;

                const response = await fetch(`http://localhost:3000/api/getGameById?id=${gameId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch game');
                }

                const data = await response.json();
                console.group('Retrieved Game:', data);
                if (data.name) {
                    setGameName(data?.name);
                }

                if (data.maxGuesses !== undefined) {
                    setMaxGuesses(data.maxGuesses);
                }                

                if (data.attributes) {
                    setAttributes(data?.attributes);
                }

                if (data.answers) {
                    setAnswers(data?.answers);
                }
            }
            catch (err) {
                console.log('Error:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        
        loadGame();
    }, [gameId]);

    const uploadGame = async () => {
        if (!currentUser) return;

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/uploadGame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({ name: gameName, answers, attributes, uid: currentUser.uid, maxGuesses }, null, 2)

            });

            const result = await response.json();
            console.log('Server Response:', result);
            toast("✅ Game uploaded!", {
                description: `${gameName} was saved successfully.`,
            });
        } catch (err) {
            console.log('Error:', err);
            toast("❌ Upload failed", {
                description: "Something went wrong while uploading the game.",
            });
        }
    };

    const handleJSON = (data: GameProps) => {
        setAnswers(data.answers);
        setAttributes(data.attributes);
        setGameName(data.name);
    }

    const addAttribute = () => {
        const newAttribute: AttributeType = {
            name: `Attribute ${attributes.length}`,
            type: 'String',
        };

        setAttributes([...attributes, newAttribute]);
    };

    const addAnswer = () => {
        if (!attributes.length) return;

        const existingIndices = Object.keys(answers)
        .map((key) => parseInt(key.replace("Answer ", ""), 10))
        .filter((num) => !isNaN(num));
      
        let newIndex = 0;
        while (existingIndices.includes(newIndex)) {
            newIndex++;
        }
        
        let name = `Answer ${newIndex}`;
      
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
    const handleAnswerSave = (
    oldName: string,
    values: { attributes: Record<string, string> }
    ) => {
    setAnswers((prev) => {
        const updated = { ...prev };

        // name hasn’t changed, just update attributes
        if (oldName === tempAnswerName) {
            updated[oldName] = {
                name: oldName,
                attributes: { ...values.attributes },
            };
            return updated;
        }

        delete updated[oldName];
        updated[tempAnswerName] = {
            name: tempAnswerName,
            attributes: { ...values.attributes },
        };

        return updated;
    });

    setAnsEditingName(null);
    setTempAnswerName('');
};


    // Change ID (name) of current editing answer (called by clicking pen icon in 'Answer' component ./components.tsx)
    const handleAnswerEdit = (name: string) => {
        setAnsEditingName(name);
        setTempAnswerName(name);  
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

    if (isLoading) {
        return (
            <LoadingSpinner />
        );
    }

    const content = (
        <div className='m-5'>

            <div className="flex flex-col items-center text-center space-y-3 mb-6">
                <h1 className="text-3xl font-bold">CREATE GAME</h1>
                <Input
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="w-[300px] text-center border border-gray-300 rounded-lg px-2 py-1"
                />
                <label className="text-sm font-medium">Max Guesses</label>
                <Input
                    type="number"
                    min={1}
                    value={maxGuesses}
                    onChange={(e) => setMaxGuesses(Number(e.target.value))}
                    className="w-[300px] text-center border border-gray-300 rounded-lg px-2 py-1"
                />
            </div>

            <h2 className="text-2xl font-bold text-center mb-4">Attribute List</h2>
            <div className="flex flex-col items-center mt-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {attributes.map((attribute, index) => (
                        <Card key={index}>
                            <CardContent className="p-4 relative">
                            {attrEditingName === attribute.name ? (
                                <EditableAttribute attribute={attribute} onSave={handleAttributeSave} />
                            ) : (
                                <>
                                <Attribute attribute={attribute} onEdit={handleAttributeEdit} />
                                <button
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                                    onClick={() => {
                                    setAttributes(attributes.filter((_, i) => i !== index));
                                    setAnswers((prev) => {
                                        const updated = { ...prev };
                                        Object.keys(updated).forEach((key) => {
                                        delete updated[key].attributes[attribute.name];
                                        });
                                        return updated;
                                    });
                                    }}
                                >
                                    ✕
                                </button>
                                </>
                            )}
                            </CardContent>
                      </Card>                      
                    ))}
                </div>

                <div className="flex space-x-2 mt-4">
                    <Button
                        onClick={addAttribute}
                        className="bg-red-300 text-black px-4 py-2 rounded-full"
                    >
                        + Add Attribute
                    </Button>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-7"></h2>
            <h2 className="text-2xl font-bold text-center mb-2">Answer List</h2>
            <div className="flex flex-col items-center mt-10 w-full">
                <div className="flex space-x-2 mb-4">
                    <Button
                        onClick={addAnswer}
                        className="bg-blue-300 text-black px-4 py-2 rounded-full"
                    >
                        + Add Answer
                    </Button>
                </div>


            </div>


            {attributes.length > 0 && Object.keys(answers).length > 0 && (
                <div className="mt-6 w-full overflow-x-auto">
                    <h2 className="text-2xl font-bold text-center mb-2">Answers</h2>
                    <div className="border border-gray-300 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2">Name</th>
                                    {attributes.map((attr, index) => (
                                        <th key={index} className="border px-4 py-2 text-center">
                                            {attr.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(answers).map(([answerKey, answer], rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">
                                            {ansEditingName === answer.name ? 
                                            (
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                    value={tempAnswerName}
                                                    onChange={(e) => setTempAnswerName(e.target.value)}
                                                /> 
                                            ) : (answer.name)}  
                                        </td>

                                        {attributes.map((attr, attrIndex) => (
                                            <td key={attrIndex} className="border px-2 py-1 text-center">
                                                {ansEditingName === answer.name ? (
                                                    <input
                                                        type="text"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                                        value={answer.attributes[attr.name] || ""}
                                                        onChange={(e) =>
                                                            setAnswers((prev) => ({
                                                                ...prev,
                                                                [answerKey]: {
                                                                    ...prev[answerKey],
                                                                    attributes: {
                                                                        ...prev[answerKey].attributes,
                                                                        [attr.name]: e.target.value,
                                                                    },
                                                                },
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    <span>{answer.attributes[attr.name]}</span>
                                                )}
                                            </td>
                                        ))}

                                        <td className="border px-2 py-1 text-center flex justify-center gap-2">
                                        {ansEditingName === answer.name ? (
                                            <Button
                                            onClick={() => handleAnswerSave(answer.name, { attributes: answer.attributes })}
                                            size="sm"
                                            className="bg-green-500 text-white"
                                            >
                                            Save
                                            </Button>
                                        ) : (
                                            <>
                                            <Button
                                                onClick={() => handleAnswerEdit(answer.name)}
                                                size="sm"
                                                className="bg-blue-500 text-white"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                const updated = { ...answers };
                                                delete updated[answer.name];
                                                setAnswers(updated);
                                                }}
                                                size="sm"
                                                className="bg-red-500 text-white"
                                            >
                                                Delete
                                            </Button>
                                            </>
                                        )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                    <Button
                        onClick={addAnswer}
                        className="w-full mt-4 bg-gray-200 text-black px-4 py-2 rounded-lg"
                    >
                        Add Possible Answer
                    </Button>
                </div>
            )}
            <a
                download = {gameName + '.json'}
                target='_blank'
                rel='noopener noreferrer'
                className='decoration-dashed underline table'
                href={
                    'data:application/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify({ name: gameName, answers, attributes }, null, 2))
                }
            >
                Get Game as JSON
            </a>
            <JsonParser onParse={handleJSON} />
            <Button
                onClick={uploadGame}
                className="bg-green-300 text-black px-4 py-2 rounded-full"
            >
                Upload Game
            </Button>
        </div>
    );

    return content;
}
