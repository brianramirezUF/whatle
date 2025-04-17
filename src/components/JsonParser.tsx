import { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';
import { toast } from "sonner";

interface JsonParserProps {
    onParse: (data: any) => void;
}

const JsonParser: React.FC<JsonParserProps> = ({ onParse }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileProcess = (file: File) => {
        if (file && file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result as string);
                    onParse(data);
                    setIsLoaded(true);
                } catch (error) {
                    toast("❌ JSON error", {
                        description: "Failed to parse JSON file"
                    });
                    setIsLoaded(false);
                }
            };
            reader.readAsText(file);
        } else {
            toast("❌ Invalid file", {
                description: "Please use a .json file"
            });
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileProcess(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileProcess(file);
        }
    };

    return (
        <>
            <input 
                type="file" 
                ref={fileInputRef} 
                accept=".json" 
                onChange={handleFileChange} 
                className="hidden" 
            />
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`
                    border-2 border-dashed rounded-lg p-3 
                    flex flex-col items-center justify-center 
                    transition-colors cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${isLoaded ? 'bg-green-50 border-green-300' : ''}
                `}
                style={{ height: "100px", width: "100%" }}
            >
                {isLoaded ? (
                    <>
                        <Check size={18} className="text-green-500 mb-2" />
                        <p className="text-sm text-green-600 font-medium">JSON Loaded Successfully</p>
                    </>
                ) : (
                    <>
                        <Upload size={18} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                            Click or drop JSON file here
                        </p>
                    </>
                )}
            </div>
        </>
    );
}

export { JsonParser };