interface JsonParsersProps {
    onParse: (data: any) => void;
}

const JsonParser: React.FC<JsonParsersProps> = ({ onParse }) => {
    let json = null;

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (file && file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result as string);
                    json = data;
                    onParse(data);
                    return data;
                } catch (error) {
                    return null;
                }
            };

            reader.readAsText(file);
        }
        else {
            return null;
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
                border: '1px solid #ccc',
                borderRadius: 5,
                padding: 20,
                width: 300,
                height: 200,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {json ? (
                <pre>
                    JSON Loaded
                </pre>
            ) : (
                <p>
                    Drag and drop a JSON file here to parse it.
                </p>
            )}
        </div>
    );
}

export { JsonParser };