'use client'
import { useEffect, useState } from 'react';
import { AttributeType, AnswerType } from '../attributes';
import { EditableAnswer, Answer, EditableAttribute} from '../components';
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
    const [maxGuessesInput, setMaxGuessesInput] = useState<string>('6');

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
                body: JSON.stringify({ id: gameId, name: gameName, answers, attributes, maxGuesses }, null, 2)

            });

            const result = await response.json();
            if (!response.ok) {
                toast("❌ Upload failed!", {
                    description: result.error
                });
            }
            else {
                toast("✅ Game uploaded!", {
                    description: result.message
                });
            }            
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
        if (data.maxGuesses) {
            setMaxGuesses(data.maxGuesses);
            setMaxGuessesInput(data.maxGuesses.toString());
          }
    }
 
    const addAttribute = () => {
        // Extract current attribute indices
        const existingIndices = attributes
            .map(attr => parseInt(attr.name.replace("Attribute ", ""), 10))
            .filter(num => !isNaN(num));
    
        // Find the next available index
        let newIndex = 0;
        while (existingIndices.includes(newIndex)) {
            newIndex++;
        }
    
        const newAttribute: AttributeType = {
            name: `Attribute ${newIndex}`,
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
        // Prevent duplicate attribute names (optional but recommended)
        if (oldName !== newName && attributes.some(attr => attr.name === newName)) {
            toast.error("An attribute with this name already exists.");
            return;
        }
    
        setAttributes((prevAttributes) =>
            prevAttributes.map((attr) =>
                attr.name === oldName ? { name: newName, type } : attr
            )
        );
    
        setAnswers((prevAnswers) => {
            const updatedAnswers: Record<string, AnswerType> = Object.keys(prevAnswers).reduce((acc, key) => {
                const answer = prevAnswers[key];
                const updatedAttributes: Record<string, string> = {};
    
                for (const [attrName, value] of Object.entries(answer.attributes)) {
                    const newAttrName = attrName === oldName ? newName : attrName;
                    updatedAttributes[newAttrName] = value;
                }
    
                acc[key] = { ...answer, attributes: updatedAttributes };
                return acc;
            }, {} as Record<string, AnswerType>);
    
            return updatedAnswers;
        });
    
        // ✅ This closes the editor view even if nothing changed
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
                    step={1}
                    value={maxGuessesInput}
                    onChange={(e) => {
                        const cleaned = e.target.value.replace(/^0+(?=\d)/, '');
                        setMaxGuessesInput(cleaned);
                    }}
                    onBlur={() => {
                        const parsed = parseInt(maxGuessesInput, 10);
                        if (!isNaN(parsed) && parsed >= 1) {
                            setMaxGuesses(parsed);
                        } 
                        else {
                            setMaxGuesses(1);
                            setMaxGuessesInput('1');
                        }
                    }}
                    className="w-[300px] text-center border border-gray-300 rounded-lg px-2 py-1"
                    />
            </div>

            <h2 className="text-2xl font-bold text-center mb-4">Attribute List</h2>
            <div className="flex flex-col items-center mt-6 w-full">
            <div className="flex flex-wrap gap-2 justify-center w-full">
                {attributes.map((attribute, index) => {
                    if (attrEditingName === attribute.name) {
                        return (
                        <div key={index} className="w-full max-w-sm">
                            <EditableAttribute attribute={attribute} onSave={handleAttributeSave} />
                        </div>
                        );
                    } else {
                        return (
                            <Card 
                                key={index} 
                                className="transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer m-2"
                                onClick={() => handleAttributeEdit(attribute.name)}
                                >                          
                                <CardContent className="p-4 relative flex justify-between items-center gap-4">
                                    <div>
                                    <span className="font-semibold">{attribute.name}</span>
                                    <span className="text-gray-500 ml-2">({attribute.type})</span>
                                    </div>
                                    <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                                    Delete
                                    </Button>
                                </CardContent>
                                </Card>

                        );
                    }
                    })}

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

                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={uploadGame}
                            className="bg-green-400 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-full shadow-md transition duration-300"
                        >
                            Upload Game
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    return content;
}
