'use client'
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ImageDrop() {
    const [image, setImage] = useState<string | null>(null);
    const { imgurTokens } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const upload = async (file: File) => {
        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("image", file);
            if (!imgurTokens) {
                throw new Error("Missing imgur tokens")
            }
            const url = `/api/uploadToImgur?imgurAccessToken=${encodeURIComponent(imgurTokens.accessToken)}&imgurRefreshToken=${encodeURIComponent(imgurTokens.refreshToken)}`;

            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            return data;
        } catch (error) {
            setError("Upload failed. Try again.");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (!file || !file.type.startsWith("image/")) {
            setError("Only image files are allowed.");
            return;
        }

        setImage(URL.createObjectURL(file));
        const data = await upload(file);

        if (data?.status === 200) {
            try {
                await fetch('/api/uploadImgurToFirebase', {
                    method: 'POST',
                    body: data.data.link,
                });
            } catch (error) {
                console.error("Failed to save on Firebase", error);
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !file.type.startsWith("image/")) {
            setError("Only image files are allowed.");
            return;
        }

        setImage(URL.createObjectURL(file));
        const data = await upload(file);

        if (data?.status === 200) {
            try {
                await fetch('/api/uploadImgurToFirebase', {
                    method: 'POST',
                    body: JSON.stringify({ link: data.data.link }),
                    headers: { "Content-Type": "application/json" }
                });
            } catch (error) {
                console.error("Failed to save on Firebase", error);
            }
        }
    };

    return (
        <Card className="max-w-lg mx-auto p-4">
            <CardContent>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()} // ✅ Now works correctly
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-xl p-4 cursor-pointer",
                        uploading ? "border-gray-400" : "border-gray-300 hover:border-gray-500"
                    )}
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                    ) : image ? (
                        <div className="relative w-full h-full flex flex-col items-center">
                            <img src={image} alt="Uploaded" className="w-full h-48 object-cover rounded-lg shadow" />
                            <Button
                                variant="destructive"
                                className="mt-2 flex items-center gap-1"
                                onClick={() => setImage(null)}
                            >
                                <Trash2 size={16} />
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Upload className="text-gray-500 w-8 h-8" />
                            <p className="mt-2 text-gray-600">Drag & Drop an image here</p>
                            <p className="text-xs text-gray-400">or click to select</p>
                        </>
                    )}
                </div>

                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </CardContent>
        </Card>
    );
}

export { ImageDrop };
