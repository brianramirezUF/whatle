'use client'
import { useEffect, useRef, useState, useMemo } from 'react';
import { AttributeType, AnswerType } from '../attributes';
import { AnswerCard, EditableAttribute } from '../components';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

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
    const [tag, setTag] = useState('');

    // Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Routing
    const params = useParams();
    const gameId = params.gameId;
    const { currentUser } = useAuth();

    useEffect(() => {
        console.log('Image Link updated:', imageLink);
    }, [imageLink]);

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

                const response = await fetch(`/api/getGameById?id=${gameId}`);

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
                    console.log("Setting icon to", data.icon);
                    setImageLink(data.icon);
                }

                if (data.tag) {
                    setTag(data.tag);
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

    useEffect(() => {
        if (imageDropRef.current && imageLink) {
            imageDropRef.current.setImageLink(imageLink);
        }
    }, [imageDropRef, imageLink]);

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
                body: JSON.stringify({ id: gameId, name: gameName, answers, attributes, maxGuesses, tag, icon: imageLink }, null, 2)

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
        values: { attributes: Record<string, string> },
        icon: null | string
    ) => {
        setAnswers((prev) => {
            const updated = { ...prev };

            // name hasn't changed, just update attributes
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
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <h1 className="text-3xl font-bold text-center mb-8">CREATE GAME</h1>

            {/* Game Configuration Section - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Game Name & Upload */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-3">Game Name</h2>
                        <Input
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            className="text-center border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-3">Max Guesses</h2>
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
                            className="text-center border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-3">Category</h2>
                        <Select
                            value={tag}
                            onValueChange={(value) => setTag(value)}
                        >
                            <SelectTrigger>
                                <div className="flex-1 text-center">
                                    <SelectValue placeholder="Choose a Tag" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Games'>
                                    <div className="w-full text-center">Games</div>
                                </SelectItem>
                                <SelectItem value='TV/Movies'>
                                    <div className="w-full text-center">TV/Movies</div>
                                </SelectItem>
                                <SelectItem value='IRL'>
                                    <div className="w-full text-center">IRL</div>
                                </SelectItem>
                                <SelectItem value='Other'>
                                    <div className="w-full text-center">Other</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Game Icon */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 text-center">Game Icon</h2>
                    <ImageDrop ref={imageDropRef} onImageLinkChange={setImageLink} />
                </div>
                {/* Game Actions */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3">Actions</h2>
                    <div className="mt-4 mb-2">
                        <h3 className="text-sm text-gray-500 mb-2">Import/Export</h3>

                        {/* JSON Import */}
                        <JsonParser onParse={handleJSON} />

                        {/* Export JSON button */}
                        <div className="mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-gray-700 border border-gray-300"
                                asChild
                            >
                                <a
                                    download={gameName + '.json'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href={
                                        'data:application/json;charset=utf-8,' +
                                        encodeURIComponent(JSON.stringify({
                                            name: gameName,
                                            answers,
                                            attributes,
                                            uid: currentUser?.uid || '',
                                            maxGuesses
                                        }, null, 2))
                                    }
                                >
                                    Export Game as JSON
                                </a>
                            </Button>
                            {/* Upload Button */}
                            <Button
                                onClick={uploadGame}
                                className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition"
                            >
                                Upload Game
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attributes Column */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Attributes</h2>
                        <Button
                            onClick={addAttribute}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                            + Add Attribute
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attributes.map((attribute, index) => {
                            if (attrEditingName === attribute.name) {
                                return (
                                    <div key={index} className="col-span-full">
                                        <EditableAttribute attribute={attribute} onSave={handleAttributeSave} />
                                    </div>
                                );
                            } else {
                                return (
                                    <Card
                                        key={index}
                                        className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                                        onClick={() => handleAttributeEdit(attribute.name)}
                                    >
                                        <CardContent className="p-3 relative flex justify-between items-center gap-2">
                                            <div className="truncate">
                                                <span className="font-semibold">{attribute.name}</span>
                                                <span className="text-gray-500 ml-1 text-sm">({attribute.type})</span>
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

                    {attributes.length === 0 && (
                        <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No attributes created yet. Add attributes to define your game.</p>
                        </div>
                    )}
                </div>

                {/* Answers Column */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Answers</h2>
                        <Button
                            onClick={addAnswer}
                            disabled={attributes.length === 0}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                            + Add Answer
                        </Button>
                    </div>

                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search answers..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {attributes.length > 0 && Object.keys(answers).length > 0 ? (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
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

                            {/* Pagination controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-4 py-2 space-x-2">
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
                        </div>
                    ) : (
                        <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">
                                {attributes.length === 0
                                    ? "Create attributes first before adding answers."
                                    : "No answers created yet. Add answers to your game."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}