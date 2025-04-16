'use client'
import { useEffect, useRef, useState, useMemo } from 'react';
import { AttributeType, AnswerType } from '../attributes';
import { AnswerCard, EditableAttribute } from '../components';
//import { EditableAnswer, Answer, EditableAttribute} from '../components';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JsonParser } from '@/components/JsonParser';
import { GameProps } from '../../play/components';
import { redirect, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { ImageDrop } from '@/components/ImageDrop';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CreateGame() {
    const router = useRouter();
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [attrEditingName, setAttrEditingName] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
    const [ansEditingName, setAnsEditingName] = useState<string | null>(null);
    const [tempAnswerName, setTempAnswerName] = useState<string>("");
    const [gameName, setGameName] = useState<string>("Game Name");
    const [isLoading, setIsLoading] = useState(true);
    const [maxGuesses, setMaxGuesses] = useState<number>(6);
    const [maxGuessesInput, setMaxGuessesInput] = useState<string>('6');
    const imageDropRef = useRef<{ getImageLink: () => string | null; setImageLink: (link: string | null) => void }>(null);
    const [imageLink, setImageLink] = useState<string | null>(null);

    useEffect(() => {
        console.log('Image Link updated:', imageLink);
    }, [imageLink]);

    // Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Routing
    const params = useParams();
    const gameId = params.gameId;
    const { currentUser } = useAuth();


    // Filter answers based on search term
    const filteredAnswers = useMemo(() => {
        if (!searchTerm.trim()) return Object.values(answers);

        const lowercaseSearch = searchTerm.toLowerCase();
        return Object.values(answers).filter(answer => {
            // Search in answer name
            if (answer.name.toLowerCase().includes(lowercaseSearch)) return true;

            // Search in attribute values
            for (const [key, value] of Object.entries(answer.attributes)) {
                if (value && value.toLowerCase().includes(lowercaseSearch)) return true;
            }

            return false;
        });
    }, [answers, searchTerm]);

    // Get paginated answers
    const paginatedAnswers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAnswers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAnswers, currentPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);


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

                if (data.icon) {
                    if(imageDropRef.current){
                        imageDropRef.current.setImageLink(data.icon);
                    }
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
                body: JSON.stringify({ id: gameId, name: gameName, answers, attributes, maxGuesses, icon: imageLink }, null, 2)

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

                if (result.id) {
                    router.push(`/play/${result.id}`);
                }
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
            icon: null,
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
        values: { attributes: Record<string, string>},
        icon: null | string
    ) => {
        setAnswers((prev) => {
            const updated = { ...prev };

            // name hasn’t changed, just update attributes
            if (oldName === tempAnswerName) {
                updated[oldName] = {
                    name: oldName,
                    attributes: { ...values.attributes },
                    icon: icon,
                };
                return updated;
            }

            delete updated[oldName];
            updated[tempAnswerName] = {
                name: tempAnswerName,
                attributes: { ...values.attributes },
                icon: icon,
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
                <h2 className="text-2xl font-bold text-center mb-4">Icon</h2>
                <ImageDrop ref={imageDropRef} onImageLinkChange={setImageLink} />
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
            <div className="mt-8 w-full">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold mb-2 lg:mb-0">Answers</h2>

                    <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search answers..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>
                {attributes.length > 0 && Object.keys(answers).length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedAnswers.map((answer) => (
                                <AnswerCard
                                    key={answer.name}
                                    attributes={attributes}
                                    answer={answer}
                                    isEditing={ansEditingName === answer.name}
                                    onEdit={handleAnswerEdit}
                                    onSave={handleAnswerSave}
                                    onDelete={() => {
                                        const updated = { ...answers };
                                        delete updated[answer.name];
                                        setAnswers(updated);
                                    }}
                                    setTempName={setTempAnswerName}
                                />
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-6 space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>

                                <span className="text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={uploadGame}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-300"
                            >
                                Upload Game
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                        <p className="text-gray-500">No answers created yet. Add attributes and create answers to see them here.</p>
                    </div>
                )}
            </div>

            <a
                download={gameName + '.json'}
                target='_blank'
                rel='noopener noreferrer'
                className='decoration-dashed underline table'
                href={
                    'data:application/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify({ name: gameName, answers, attributes, uid: currentUser?.uid || '', maxGuesses }, null, 2))
                }
            >
                Get Game as JSON
            </a>
            <JsonParser onParse={handleJSON} />

        </div>
    );

    return content;
}
