"use client";

import { useState, useEffect } from 'react';
import { Game, GameProps } from '../components';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import React from 'react';

export default function PlayGame() {
    const [gameData, setGameData] = useState<GameProps | null>();
    const [isLoading, setIsLoading] = useState(true);
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [gameId]);
     
    const doTestUpdate = async () => {
      await fetch('/api/testUpdate', {
        headers: {
          'x-cron-secret': `${process.env.NEXT_PUBLIC_CRON_SECRET}`
        }
      }); 
    };

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner />
        </div>
      );
    }

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