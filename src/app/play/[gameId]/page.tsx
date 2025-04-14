"use client";

import { Icons } from '@/components/icons'
import { useState, useEffect } from 'react';
import { AttributeType, AnswerType } from '../../create/attributes';
import { Game, GameProps } from '../components';
import { JsonParser } from '@/components/JsonParser';
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from 'next/navigation';
import React from 'react';

export default function PlayGame() {
    const [gameData, setGameData] = useState<GameProps | null>();
    const params = useParams();
    const gameId = params.gameId as string;

    // call endpoint to receive game information
    useEffect(() => {
      fetch(`/api/getGameById?id=${gameId}`)
        .then((res) => res.json())
        .then((game) => {
          setGameData(game);
        })
        .catch((err) => {
          console.error("Failed to fetch game:", err);
        });
    }, [gameId]);
     
    const doTestUpdate = async () => {
      await fetch('/api/testUpdate', {
        headers: {
          'x-cron-secret': `${process.env.NEXT_PUBLIC_CRON_SECRET}`
        }
      }); 
    };

    const content = (
        <div>
            {gameData ? <Game {...gameData} gameId={gameId} /> : 'Failed to load game.'}
            <div>
              <button onClick={doTestUpdate}>
                Cron Update
              </button>
            </div>
        </div>
        
    );

    return content;
};