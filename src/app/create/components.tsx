import { Icons } from '@/components/icons'
import { useState, useEffect, KeyboardEvent } from 'react';
import { Guess, AttributeType, AnswerType } from './attributes';
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from '@/components/Badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit2, Trash2, X, Plus } from 'lucide-react';

// Type badge component to visually indicate attribute types
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const getTypeStyle = () => {
        switch (type.toLowerCase()) {
            case 'boolean':
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case 'number':
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 'string':
                return "bg-purple-100 text-purple-800 border-purple-200";
            case 'collection':
                return "bg-amber-100 text-amber-800 border-amber-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyle()}`}>
            {type}
        </span>
    );
};

// Collection Input component for editing collection attributes
const CollectionInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => {
    const [items, setItems] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState("");

    // Initialize items from comma-separated string
    useEffect(() => {
        if (value) {
            setItems(value.split(',').map(item => item.trim()).filter(Boolean));
        } else {
            setItems([]);
        }
    }, [value]);

    // Update the parent component with the CSV string when items change
    const updateParent = (newItems: string[]) => {
        onChange(newItems.join(', '));
    };

    // Add a new item to the collection
    const addItem = () => {
        if (currentInput.trim()) {
            const newItems = [...items, currentInput.trim()];
            setItems(newItems);
            updateParent(newItems);
            setCurrentInput("");
        }
    };

    // Remove an item from the collection
    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        updateParent(newItems);
    };

    // Handle Enter key to add a new item
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentInput.trim()) {
            e.preventDefault();
            addItem();
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
                {items.map((item, index) => (
                    <Badge
                        key={index}
                        className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-2 py-0.5 flex items-center gap-1"
                    >
                        {item}
                        <X
                            size={14}
                            className="cursor-pointer"
                            onClick={() => removeItem(index)}
                        />
                    </Badge>
                ))}
            </div>
            <div className="flex gap-1">
                <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={!currentInput.trim()}
                >
                    <Plus size={16} />
                </Button>
            </div>
        </div>
    );
};

// Collection Display component for showing collection items
const CollectionDisplay: React.FC<{ value: string }> = ({ value }) => {
    if (!value) return <span className="text-gray-400">Empty collection</span>;

    const items = value.split(',').map(item => item.trim()).filter(Boolean);

    return (
        <div className="flex flex-wrap gap-1">
            {items.map((item, index) => (
                <Badge
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-2 py-0.5"
                >
                    {item}
                </Badge>
            ))}
        </div>
    );
};

// Answer Card Component with enhanced styling and hover effects
const AnswerCard: React.FC<{
    attributes: AttributeType[];
    answer: AnswerType;
    isEditing: boolean;
    onEdit: (name: string) => void;
    onSave: (name: string, values: { attributes: Record<string, string> }) => void;
    onDelete: (name: string) => void;
    setTempName: (tempName: string) => void;
}> = ({ attributes, answer, isEditing, onEdit, onSave, onDelete, setTempName }) => {
    const [values, setValues] = useState<{ attributes: Record<string, string> }>({
        attributes: { ...answer.attributes }
    });

    const [name, setName] = useState(answer.name);
    const [tempAnswerName, setTempAnswerName] = useState(answer.name);

    useEffect(() => {
        if (!isEditing) {
            setValues({ attributes: { ...answer.attributes } });
            setName(answer.name);
        }
    }, [isEditing, answer]);

    const handleChange = (attributeName: string, value: string) => {
        setValues(prev => ({
            attributes: {
                ...prev.attributes,
                [attributeName]: value
            }
        }));
    };

    const handleSave = () => {
        onSave(answer.name, values);
    };

    const renderAttributeInput = (attribute: AttributeType) => {
        const value = values.attributes[attribute.name] || '';
        const type = attribute.type.toLowerCase();

        switch (type) {
            case 'boolean':
                return (
                    <Select
                        value={value.toLowerCase()}
                        onValueChange={(newValue) => handleChange(attribute.name, newValue)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                    </Select>
                );
            case 'collection':
                return (
                    <CollectionInput
                        value={value}
                        onChange={(newValue) => handleChange(attribute.name, newValue)}
                    />
                );
            default:
                return (
                    <Input
                        value={value}
                        onChange={(e) => handleChange(attribute.name, e.target.value)}
                        className="w-full"
                    />
                );
        }
    }

    const displayAttributeValue = (attribute: AttributeType, value: string) => {
        const type = attribute.type.toLowerCase();

        switch (type) {
            case 'boolean':
                const lowerValue = (value || '').toLowerCase();
                if (lowerValue === 'true') {
                    return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">True</span>;
                }
                if (lowerValue === 'false') {
                    return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">False</span>;
                }
                return 'N/A';
            case 'collection':
                return <CollectionDisplay value={value} />;
            default:
                return value || 'N/A';
        }
    };

    return (
        <div
            className={`p-5 border rounded-xl transition-all duration-300 ${isEditing
                ? "shadow-lg ring-2 ring-blue-300 bg-white"
                : "bg-white shadow hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                }`}
            onClick={() => !isEditing && onEdit(answer.name)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && isEditing) {
                    handleSave();
                }
            }}
        >
            {isEditing ? (
                <Input
                    className="font-semibold text-lg mb-3"
                    value={tempAnswerName}
                    onChange={(e) => {
                        setTempName(e.target.value);
                        setTempAnswerName(e.target.value);
                    }}
                />
            ) : (
                <h3 className="font-semibold text-lg mb-3">{answer.name}</h3>
            )}

            <div className="space-y-2">
                {attributes.map(attribute => (
                    <div key={attribute.name} className="grid grid-cols-3 gap-2 items-center">
                        <span className="font-medium text-sm text-gray-700">{attribute.name}</span>
                        <TypeBadge type={attribute.type} />
                        <div className='text-sm'>
                            {isEditing ? (
                                renderAttributeInput(attribute)
                            ) : (
                                displayAttributeValue(attribute, answer.attributes[attribute.name])
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
                {isEditing ? (
                    <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600">
                        <Save size={16} className="mr-1" /> Save
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => onEdit(answer.name)} size="sm" variant="outline">
                            <Edit2 size={16} className="mr-1" /> Edit
                        </Button>
                        <Button onClick={() => onDelete(answer.name)} size="sm" variant="destructive">
                            <Trash2 size={16} className="mr-1" /> Delete
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

interface EditableAttributeProps {
    attribute: AttributeType;
    onSave: (oldName: string, newName: string, type: string) => void;
}

// Component enabled when an attribute is being edited (pen button on 'Attribute' component clicked)
const EditableAttribute: React.FC<EditableAttributeProps> = ({ attribute, onSave }) => {
    const [name, setName] = useState(attribute.name);
    const [type, setType] = useState(attribute.type);

    return (
        <div className='p-4 border rounded-lg shadow-md bg-white flex gap-4 items-center'>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSave(attribute.name, name, type);
                    }
                }}
                placeholder='Name'
                className='p-2 border rounded w-1/2 bg-gray-100'
            />

            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='p-2 border rounded bg-gray-100'
            >
                <option value='String'>String</option>
                <option value='Number'>Number</option>
                <option value='Boolean'>Boolean</option>
                <option value='Collection'>Collection</option>
            </select>
            <button onClick={() => onSave(attribute.name, name, type)} className="px-4 py-2 bg-blue-500 text-white rounded">
                Save
            </button>
        </div>
    );
};

export { EditableAttribute, AnswerCard };