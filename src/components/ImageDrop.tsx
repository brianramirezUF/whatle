'use client'
import { useState, useEffect } from "react";

function ImageDrop(){
    const [image, setImage] = useState<string | null>(null);

    const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        setImage(URL.createObjectURL(file))
    }

    useEffect(() => {
        console.log(image);
    }, [image]);

    return(
        <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-full"
        >
            {image ? (
                <img src={image} alt="Uploaded preview" />
            ) : (
                <p>Drag & Drop an image</p>
            )}
        </div>

    )
}

export{ImageDrop}