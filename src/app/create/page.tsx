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

interface Game {
    id: string,
    uid: string,
    name: string,
    icon: string,
    plays: string
};

export default function GameList() {
    const [games, setGames] = useState([]);
    // TODO: add UseContext
    const [uid, setUID] = useState('');
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const fillerGame: Game = {
        id: "filler",
        uid: "filler",
        name: "...",
        icon: "",
        plays: "0",
    };
      
    function padWithFiller(games: Game[]): Game[] {
        const length = games.length;
  
        if (length >= 1 && length < 5) {
            const fillersNeeded = 5 - length;
            const fillerGames = Array(fillersNeeded).fill(fillerGame).map((filler, index) => ({
            ...filler,
            id: `filler-${index}`,
            uid: `filler-${index}`,
            }));
            return [...games, ...fillerGames];
        }

        return games;
    }

    const paddedGames = padWithFiller(games); 
    console.log(paddedGames);

    const gamesList = paddedGames.length ? (
        <Carousel>
            <CarouselContent className='pb-4 w-full max-w-5xl mx-auto'>
                {paddedGames.map((game: Game, index) => (
                    <CarouselItem key={index} className={'basis-1/5'}>
                        <div className='p-1'>
                            {game.name === "..." ? 
                                <Card
                                    className='card'
                                    style={game.icon ? {
                                        backgroundImage: `url(${game.icon})`,
                                    } : {}}
                                >
                                    <CardContent className="card-content flex aspect-square items-center justify-center p-6">
                                        <span className={`text-3xl font-semibold ${game.name === "..." ? "filler-text opacity-60 italic" : "real-text"}`}>{game.name}</span>
                                    </CardContent>
                                </Card>
                                : 
                                <Link href={`create/${game.id}`}>
                                    <Card
                                        className='card'
                                        style={game.icon ? {
                                            backgroundImage: `url(${game.icon})`,
                                        } : {}}
                                    >
                                        <CardContent className="card-content flex aspect-square items-center justify-center p-6">
                                            <span className={`text-3xl font-semibold ${game.name === "..." ? "filler-text opacity-60 italic" : "real-text"}`}>{game.name}</span>
                                        </CardContent>
                                    </Card>
                                </Link>
                            }  
                        </div>
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
