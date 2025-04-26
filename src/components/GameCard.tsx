import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from './ui/card';
import { Edit } from 'lucide-react';

export interface GameCardProps {
    id: string,
    name: string,
    daily_plays: number,
    total_plays: number,
    icon?: string,
    play?: boolean,
    categories?: string[],
    uid?: string,
    currUid?: string,
    tag?: string
};

export interface GameCardContentProps {
    id: string,
    name: string,
    daily_plays: number,
    total_plays: number,
    icon?: string,
    play?: boolean,
    categories?: string[],
    uid?: string,
    currUid?: string,
};

const fillerGame: GameCardProps = {
    id: "filler",
    name: "...",
    daily_plays: 0,
    total_plays: 0,
};

export const GameCard: React.FC<GameCardProps> = ({ id, name, daily_plays, total_plays, icon, play = true, categories, uid = "", currUid = "" }) => {
    return (
        <GameCardContent
            id={id}
            name={name}
            daily_plays={daily_plays}
            total_plays={total_plays}
            icon={icon}
            play={play}
            categories={categories}
            uid={uid}
            currUid={currUid}
        />
    );
};

export const GameCardContent: React.FC<GameCardContentProps> = ({ id, name, daily_plays, total_plays, icon, play = true, categories, uid = "", currUid = "" }) => {
    const basePath = "/";

    return (
        <div className='p-1'>
            <Link href={`${basePath}play/${id}`}>
                <Card
                    className='card transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    style={icon ? {
                        backgroundImage: `url(${icon})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {
                        background: 'linear-gradient(to top right, white, #D8D8D8)'
                    }}
                >
                    <CardHeader className={`z-10 p-3 ${name === "..." ? "invisible" : ""}`}>
                        <div className='flex flex-wrap items-center gap-1.5 w-full'>
                            <div
                                key='daily-plays'
                                className='flex items-center gap-1 rounded-full bg-logo-gray/75 px-2 py-0.5 text-xs font-medium text-gray-800 backdrop-blur'
                            >
                                <span role='img' aria-label='clock' className="text-xs">⏰</span>
                                <span>{daily_plays} Today</span>
                            </div>
                            <div
                                key='all-time-plays'
                                className='flex items-center gap-1 rounded-full bg-logo-yellow/75 px-2 py-0.5 text-xs font-medium text-yellow-800 backdrop-blur'
                            >
                                <span role='img' aria-label='trophy' className="text-xs">🏆</span>
                                <span>{total_plays}</span>
                            </div>

                            {uid === currUid && uid !== "" && currUid !== "" && name !== "..." && (
                                <button
                                    aria-label="Edit game"
                                    className="ml-auto"
                                    onClick={(e) => { 
                                        e.preventDefault();
                                        window.location.href = `${basePath}create/${id}`
                                }}
                                >
                                    <Edit className='p-1 rounded-full bg-logo-green/80 text-[#1D4B2D] transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'></Edit>
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className='card-content flex aspect-square items-center justify-center p-6'>
                        <span className={`text-3xl font-semibold text text-center ${name !== "..." ? "text-white" : "text-gray-400"}`}>{name}</span>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
};

export const padWithFiller = (games: GameCardProps[], maxLength: number): GameCardProps[] => {
    const length = games.length;

    if (length >= 1 && length < maxLength) {
        const fillersNeeded = maxLength - length;
        const fillerGames = Array(fillersNeeded).fill(fillerGame).map((filler, index) => ({
            ...filler,
            id: `filler-${index}`,
            uid: `filler-${index}`,
        }));
        return [...games, ...fillerGames];
    }

    return games;
};
