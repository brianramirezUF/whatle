'use client'
import { useState, useEffect } from "react";

function ImageDrop(){
    const [image, setImage] = useState<string | null>(null);

    const upload = async (file: File) => {
        try{
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/uploadToImgur", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }
    
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error uploading:', error);
            throw error;
        }
    }

    const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        setImage(URL.createObjectURL(file));
        const data = await upload(file);
        console.log(data.status, data.data.link);

        if(data.status === 200){
            try{
                const response = await fetch('/api/uploadImgurToFirebase', {
                    method: 'POST',
                    body: data.data.link,
                });
                const result = await response.json();
                console.log(result.message);
            } catch(error){
                console.error("Failed to save on firebase", error);
            }
        }
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

export { ImageDrop }