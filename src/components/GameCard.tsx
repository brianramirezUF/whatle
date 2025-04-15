import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';

export interface GameCardProps {
    id: string,
    name: string,
    daily_plays: number,
    total_plays: number,
    icon?: string,
    play?: boolean
};

export const GameCard: React.FC<GameCardProps> = ({ id, name, daily_plays, total_plays, icon, play=true }) => {
    return (
        <Link href={`${play ? 'play' : 'create'}/${id}`}>
            <div className='p-1'>
                <Card
                    className='card transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    style={icon ? {
                        backgroundImage: `url(${icon})`
                    } : {}}
                >
                    <CardContent className='card-content flex aspect-square items-center justify-center p-6'>
                        <span className='text-3xl font-semibold text text-center'>{name}</span>
                    </CardContent>
                </Card>
            </div>
        </Link>
    );
};