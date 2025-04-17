import { Icons } from '@/components/icons'
import { useState, useEffect, useMemo } from 'react';
import { Guess, AttributeType, AnswerType } from './attributes';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit2, Trash2 } from 'lucide-react';

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

    return (
        <div
            className={`p-5 border rounded-xl transition-all duration-300 ${isEditing
                    ? "shadow-lg ring-2 ring-blue-300 bg-white"
                    : "bg-white shadow hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                }`}
            onClick={() => !isEditing && onEdit(answer.name)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && isEditing) {
                    console.log('a');
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
                        <div>
                            {isEditing ? (
                                <Input
                                    value={values.attributes[attribute.name] || ''}
                                    onChange={(e) => handleChange(attribute.name, e.target.value)}
                                    className="w-full"
                                />
                            ) : (
                                <span className="text-sm">{answer.attributes[attribute.name] || 'N/A'}</span>
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

interface AttributeProps {
    attribute: AttributeType;
    onEdit: (name: string) => void;
}

// Component to display a specific attribute and its name/type
const Attribute: React.FC<AttributeProps> = ({ attribute, onEdit }) => {
    return (
        <div className='p-4 border rounded-lg shadow-md bg-white flex justify-between items-center'>
            <div>
                <span className='font-semibold'>{attribute.name}</span>
                <span className='text-gray-500 ml-2'>({attribute.type})</span>
            </div>
            <Icons.pen onClick={() => onEdit(attribute.name)} className="cursor-pointer text-gray-500 hover:text-gray-700" />
        </div>
    );
};

export { EditableAttribute, AnswerCard };