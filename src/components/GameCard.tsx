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
    categories?: string[]
};

export const GameCard: React.FC<GameCardProps> = ({ id, name, daily_plays, total_plays, icon, play = true, categories }) => {
    return (
        <Link href={`${play ? 'play' : 'create'}/${id}`}>
            <div className='p-1'>
                <Card
                    className='card transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    style={icon ? {
                        backgroundImage: `url(${icon})`
                    } : {}}
                >
                    <CardHeader>
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
                        <span className='text-3xl font-semibold text text-center'>{name}</span>
                    </CardContent>
                    {/*<CardFooter className='justify-end pt-2 pb-3 px-4'>
                        <div className='flex flex-wrap gap-2'>
                            {categories && categories.map((category, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-1 rounded-xl bg-logo-green px-2 py-1 text-sm text-[#1D4B2D] shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                                >
                                    {category}
                                </div>
                            ))}
                        </div>
                    </CardFooter>*/}
                </Card>
            </div>
        </Link>
    );
};