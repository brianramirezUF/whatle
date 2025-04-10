"use client";

import { Icons } from '@/components/icons'
import { useState, useEffect } from 'react';
import { AttributeType, AnswerType } from '../create/attributes';
import { Game, GameProps } from './components';
import { JsonParser } from '@/components/JsonParser';
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import { useSearchParams } from "next/navigation";

export default function PlayGame() {
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
    const [gameName, setGameName] = useState<string>('');
    const [game, setGame] = useState<GameProps>();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // call endpoint to receive game information
      useEffect(() => {
        fetch(`/api/getGameById?id=${id}`)
          .then((res) => res.json())
          .then((game) => {
            setGame(game);
            console.log("Fetched game:", game);
          })
          .catch((err) => {
            console.error("Failed to fetch game:", err);
          });
      }, []);

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