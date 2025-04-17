'use client'
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
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
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [searchInput, setSearchInput] = useState<string>(''); // Search input state
    const { currentUser, imgurTokens, refreshImgurTokens } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const modalContentRef = useRef<HTMLDivElement | null>(null); // Modal content ref
    const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null); // Debounce ref
    const [searchPage, setSearchPage] = useState<number>(1);
    const [searchResults, setSearchResults] = useState<any[]>([]); // Search results state
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
    const searchInputRef = useRef<HTMLInputElement | null>(null); // Search input ref

    useImperativeHandle(ref, () => ({
        getImageLink: () => imageLink,
        setImageLink: (link: string | null) => setImageLink(link),
    }));

    const setImageLink = (link: string | null) => {
        setImageLinkState(link);
        console.log('ImageLink Set:', link);  // Debugging log
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
                const newUrl = `/api/uploadToImgur?imgurAccessToken=${encodeURIComponent(refreshedTokens.accessToken)}&imgurRefreshToken=${encodeURIComponent(refreshedTokens.refreshToken)}`;
                response = await fetch(newUrl, {
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

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleImageSelect = (link: string, cover: string | null) => {
        const imageUrl = cover ? `https://i.imgur.com/${cover}.jpg` : link;
        setImageLink(imageUrl);
        closeModal();
    };

    const fetchGallery = async (query: string, page: number) => {
        try {
            setIsLoading(true);
            setSearchResults([]); // Clear current search results
            if (modalContentRef.current) {
                modalContentRef.current.scrollTo(0, 0); // Scroll to top of modal
            }

            if (!imgurTokens) {
                throw new Error('Missing imgur token');
            }
            const galleryUrl = `/api/getImgurGallery?imgurAccessToken=${encodeURIComponent(imgurTokens.accessToken)}&searchQuery=${encodeURIComponent(query)}&page=${page}`;
            const response = await fetch(galleryUrl);
            const data = await response.json();
            setSearchResults(data.data); // Store search results in the state
        } catch (error) {
            console.error("Failed to fetch gallery", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);

        // Debounce the search input to delay the API call until the user stops typing for 1.5 seconds
        if (debouncedSearchRef.current) {
            clearTimeout(debouncedSearchRef.current);
        }

        debouncedSearchRef.current = setTimeout(() => {
            fetchGallery(value, 1);
        }, 1500);
    };

    const handlePreviousPage = () => {
        if (searchPage > 1) {
            const newPage = searchPage - 1;
            setSearchPage(newPage);
            fetchGallery(searchInput, newPage);
        }
    };

    const handleNextPage = () => {
        const newPage = searchPage + 1;
        setSearchPage(newPage);
        fetchGallery(searchInput, newPage);
    };

    useEffect(() => {
        if (isModalOpen) {
            setSearchPage(1);
            setSearchInput('');
            fetchGallery('', 1);
            if (searchInputRef.current) {
                searchInputRef.current.focus(); // Automatically focus the search input
            }
        }
    }, [isModalOpen]);

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
                    onClick={() => !imageLink && fileInputRef.current?.click()}
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

                {/* Add Search Button */}
                <div className="mt-4 flex justify-center">
                    <Button variant="default" onClick={openModal}>
                        Search
                    </Button>
                </div>
            </CardContent>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div ref={modalContentRef} className="relative bg-white p-6 w-3/4 max-w-5xl h-4/5 rounded-lg shadow-lg overflow-y-auto">
                        <Button 
                            variant="default"
                            className="absolute top-2 right-2"
                            onClick={closeModal}
                        >
                            <X size={20} />
                        </Button>
                        <h2 className="text-xl font-bold mb-4">Search</h2>
                        {/* Centered Search Bar */}
                        <div className="flex justify-center mt-4">
                            <input
                                type="text"
                                className="border rounded p-2 w-3/4"
                                placeholder="Type to search..."
                                value={searchInput}
                                onChange={handleSearchInputChange}
                                ref={searchInputRef}
                            />
                        </div>
                        {/* Display search results */}
                        <div className="mt-4 grid grid-cols-5 gap-4">
                            {searchResults.map((result, index) => (
                                <div key={index} className="w-full h-48 cursor-pointer" onClick={() => handleImageSelect(result.link, result.cover)}>
                                    <img src={result.cover ? `https://i.imgur.com/${result.cover}.jpg` : result.link} alt={result.title} className="w-full h-full object-cover rounded-lg shadow" />
                                </div>
                            ))}
                        </div>
                        {/* Pagination buttons or loader */}
                        {isLoading ? (
                            <div className="flex justify-center mt-4">
                                <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                            </div>
                        ) : (
                            <div className="mt-4 flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={handlePreviousPage}
                                    disabled={searchPage === 1}
                                    className={searchPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    <ChevronLeft className="mr-2" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleNextPage}
                                >
                                    Next
                                    <ChevronRight className="ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
});

ImageDrop.displayName = 'ImageDrop';

export { ImageDrop };