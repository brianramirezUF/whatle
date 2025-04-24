/* TESTING BUTTONS PRE-home screen development*/
// "use client"
// import { RedirectButton } from '@/components/Buttons'
// import { useAuth } from '@/contexts/AuthContext';
// import { useEffect } from 'react';
// import React from 'react';

// export default function Home() {

//   const authProvider = useAuth();

//   useEffect(() => {
//     console.log('AuthContext contents:', authProvider)
//   }, []);


//   return (
//     <>
//       <ul>
//         <li className='underline table'>Testing Buttons:</li>
//         <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/upload" text="upload" /></li>
//         <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/create" text="create" /></li>
//         <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/play" text="play" /></li>
//       </ul>
//     </>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import "@/app/styles.css";
import LoadingSpinner from '@/components/LoadingSpinner';
import { GameCardProps } from '@/components/GameCard';
import { GameCarousel } from '@/components/GameCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { RedirectButton } from '@/components/Buttons'

export default function Home() {
  const [popularGames, setPopularGames] = useState<GameCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, loading } = useAuth();

  const currUid = !currentUser ? "" : currentUser.uid;

  // call endpoint to receive featured games
  useEffect(() => {
    fetch("/api/getPopularGames")
      .then((res) => res.json())
      .then((games) => {
        setPopularGames(games);
        console.log("Fetched popular games:", games);
      })
      .catch((err) => {
        console.error("Failed to fetch popular games:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner />
    )
  }

  return (
    <main className="flex flex-col w-full min-h-screen pt-0 mt-0 relative">
      <div className="flex-grow">
        <div className="container mx-auto px-4">
          <GameCarousel title="POPULAR GAMES" games={popularGames} />
        </div>
      </div>
    </main>
  )
}

