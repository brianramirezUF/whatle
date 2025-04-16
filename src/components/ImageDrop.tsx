'use client'
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageDropHandle = {
    getImageLink: () => string | null;
    setImageLink: (link: string | null) => void;
};

interface ImageDropProps {
    onImageLinkChange?: (link: string | null) => void;
}

const ImageDrop = forwardRef<ImageDropHandle, ImageDropProps>(({ onImageLinkChange }, ref) => {
    const [imageLink, setImageLinkState] = useState<string | null>(null);
    const { currentUser, imgurTokens, refreshImgurTokens } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
        getImageLink: () => imageLink,
        setImageLink: (link: string | null) => setImageLink(link)
    }));

    const setImageLink = (link: string | null) => {
        setImageLinkState(link);
        if (onImageLinkChange) {
            onImageLinkChange(link);
        }
    };

    const upload = async (file: File) => {
        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("image", file);
            if (!imgurTokens) {
                throw new Error("Missing imgur tokens");
            }
            const url = `/api/uploadToImgur?imgurAccessToken=${encodeURIComponent(imgurTokens.accessToken)}&imgurRefreshToken=${encodeURIComponent(imgurTokens.refreshToken)}`;

            let response = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                if (!currentUser) {
                    throw new Error("User not logged in");
                }
                const refreshedTokens = await refreshImgurTokens(currentUser.uid, imgurTokens.refreshToken);
                if (!refreshedTokens) {
                    throw new Error("Failed to refresh tokens");
                }
                const url = `/api/uploadToImgur?imgurAccessToken=${encodeURIComponent(refreshedTokens.accessToken)}&imgurRefreshToken=${encodeURIComponent(refreshedTokens.refreshToken)}`;
                response = await fetch(url, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Upload failed");
                }
            }

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

        const data = await upload(file);

        if (data?.status === 200) {
            setImageLink(data.data.link);
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !file.type.startsWith("image/")) {
            setError("Only image files are allowed.");
            return;
        }

        const data = await upload(file);

        if (data?.status === 200) {
            setImageLink(data.data.link);
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

    const handleRemove = () => {
        setImageLink(null);
        setUploading(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input value
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
                    onClick={(e) => !imageLink && fileInputRef.current?.click()}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-xl p-4 cursor-pointer",
                        uploading ? "border-gray-400" : "border-gray-300 hover:border-gray-500"
                    )}
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                    ) : imageLink ? (
                        <div className="relative w-full h-full flex flex-col items-center">
                            <a href={imageLink} target="_blank" rel="noopener noreferrer" className="w-full h-48">
                                <img src={imageLink} alt="Uploaded" className="w-full h-full object-cover rounded-lg shadow" />
                            </a>
                            <Button
                                variant="destructive"
                                className="mt-2 flex items-center gap-1"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering file input click
                                    handleRemove();
                                }}
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
});

ImageDrop.displayName = 'ImageDrop';

export { ImageDrop };