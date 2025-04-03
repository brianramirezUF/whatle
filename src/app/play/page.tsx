'use client'
import { Icons } from '@/components/icons'
import { useState } from 'react';
import { AttributeType, AnswerType } from '../create-game/attributes';
import { Game, GameProps } from './components';
import { JsonParser } from '@/components/JsonParser';
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';

export default function PlayGame() {
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
    const [gameName, setGameName] = useState<string>('');

    const handleJSON = (data: GameProps) => {
        setAnswers(data.answers);
        setAttributes(data.attributes);
        setGameName(data.gameName);
    }

    const content = (
        <div>
            <JsonParser onParse={handleJSON}/>
            <h1 className='font-bold'>Game</h1>
            <Game answers={answers} attributes={attributes} gameName={gameName}/>
        </div>
    );

    return content;
};