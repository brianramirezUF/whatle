'use client'
import { Card, CardContent } from '@/components/ui/card'
import './styles.css';

import React, { useState, useEffect } from 'react';

interface Game {
    id: string,
    userId: string,
    name: string,
    icon: string,
    plays: string
};

export default function GameList() {
  const [games, setGames] = useState([]);
  // TODO: add UseContext
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // const response = await fetch(`https://localhost:3000/api/getGamesByUserId?userId=${userId}`);
        const response = await fetch(`https://localhost:3000/api/getGamesByUserId?uid=blah`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        console.log(data);
        setGames(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Game List</h1>
      <ul>
        {games.map((game: Game, index) => (
          <li key={index}>{game.name}</li>
        ))}
      </ul>
    </div>
  );
};