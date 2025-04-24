'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { RedirectButton } from '@/components/Buttons'
import './styles.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { GameCard, GameCardProps, padWithFiller } from '@/components/GameCard';
import { GameCarousel } from '@/components/GameCarousel'

export default function GameList() {
    const [games, setGames] = useState<GameCardProps[]>([]);
    // TODO: add UseContext
    const [uid, setUID] = useState('');
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const currUid = !currentUser ? "" : currentUser.uid;

    useEffect(() => {
        const fetchGames = async () => {
            try {
                // TODO: uncomment when added UseContext for uid
                const response = await fetch(`/api/getGamesByUserId?uid=${currentUser?.uid}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch games');
                }
                const data = await response.json();
                console.log(data);
                setGames(data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGames();
    }, [uid]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const paddedGames = padWithFiller(games, 3);
    console.log(paddedGames);

    const content = (
        <div className="container pt-2 px-4 mt-0 mb-0">
            <h1 className='title text-center font-medium'>
                Create A New Game:
            </h1>
            <div className="flex justify-center">
                <RedirectButton
                    url='/create/new-game'
                    text='Create'
                    className='button w-[125px] h-[40px]'
                />
            </div>
            {paddedGames.length ? (
                <GameCarousel games={games} title='YOUR GAMES' />
            ) : 'No Games'}
        </div>
    );

    return <ProtectedRoute>{content}</ProtectedRoute>;
}
