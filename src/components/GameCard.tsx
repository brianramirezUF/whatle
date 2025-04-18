import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from './ui/card';

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
            <Card
                className='card transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                style={icon ? {
                    backgroundImage: `url(${icon})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                } : {}}
            >
                <CardHeader className={name === "..." ? "invisible" : ""}>
                    <div className='flex flex-wrap gap-2'>
                        <div
                            key='daily-plays'
                            className='flex items-center gap-1 rounded-xl bg-logo-gray px-2 py-1 text-sm text-[#2D3748] shadow-md backdrop-blur-md'
                        >
                            <span role='img' aria-label='clock'>⏰</span>
                            <span>{daily_plays} Today</span>
                        </div>
                        <div
                            key='all-time-plays'
                            className='flex items-center gap-1 rounded-xl bg-logo-yellow px-2 py-1 text-sm text-yellow-800 shadow-md backdrop-blur-md'
                        >
                            <span role='img' aria-label='trophy'>🏆</span>
                            <span>{total_plays} All-Time</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='card-content flex aspect-square items-center justify-center p-6'>
                    <span className={`text-3xl font-semibold text text-center ${name !== "..." ? "text-white" : "text-gray-400"}`}>{name}</span>
                </CardContent>
                <CardFooter className={`flex justify-center items-center pt-2 pb-3 px-4 gap-2 ${name === "..." ? "invisible" : ""}`}>
                    <Link href={`${basePath}play/${id}`}>
                        <div
                            className='flex items-center justify-center gap-1 rounded-xl bg-logo-green px-2 py-1 mx-1 my-3 text-sm text-[#1D4B2D] shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer w-[130px] h-[40px]'
                        >
                            <span className="font-bold">Play</span>
                        </div>
                    </Link>
                    {uid === "" || currUid === "" || uid !== currUid
                        ? null
                        : (
                            <Link href={`${basePath}create/${id}`}>
                                <div
                                    className="flex items-center justify-center gap-1 rounded-xl bg-logo-yellow px-2 py-1 my-3 text-sm text-yellow-800 shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer w-[130px] h-[40px]"
                                >
                                    <span className="font-bold">Edit</span>
                                </div>
                            </Link>
                        )}
                </CardFooter>
            </Card>
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
