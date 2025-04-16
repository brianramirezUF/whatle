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

export default function GameList() {
    const [games, setGames] = useState([]);
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

    const gamesList = paddedGames.length ? (
        <Carousel>
            <CarouselContent className='pb-4 w-full max-w-5xl mx-auto'>
                {paddedGames.map((game: GameCardProps, index) => (
                    <CarouselItem key={index} className={paddedGames.length < 3 ? '' : 'basis-1/3'}>
                        <GameCard {...game} currUid={currUid} play={false} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ) : 'No Games';

    const content = (
        <div className='container'>
            <h1 className='title text-center font-medium'>
                Edit Your Existing Games:
            </h1>
            {gamesList}
            <h1 className='subtitle text-center font-medium'>
                Create A New Game:
            </h1>
            <RedirectButton url='/create/new-game' text='Create' className='button  w-[125px] h-[40px]' />
        </div>
    );

    return <ProtectedRoute>{content}</ProtectedRoute>;
}
