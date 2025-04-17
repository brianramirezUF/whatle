'use client';

import { useEffect, useState } from 'react';
import { GameCard, GameCardProps } from '@/components/GameCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function GamesCategoryPage() {
  const [games, setGames] = useState<GameCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
    const currUid = !currentUser ? "" : currentUser.uid;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const q = query(collection(db, 'games'), where('tag', '==', 'Other'));
        const snapshot = await getDocs(q);

        const gameList: GameCardProps[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name,
            maxGuesses: data.maxGuesses ?? 6,
            daily_plays: data.daily_plays ?? 0,
            total_plays: data.total_plays ?? 0,
            uid: data.uid,
            icon: data.icon
          };
        });

        setGames(gameList);
      } catch (err) {
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🌀 Other</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : games.length === 0 ? (
        <p className="text-center">No games found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} currUid={currUid} {...game} />
          ))}
        </div>
      )}
    </div>
  );
}
