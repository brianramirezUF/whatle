"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { RedirectButton } from '@/components/Buttons'
import "./styles.css";
import Link from "next/link";
import LoadingSpinner from '@/components/LoadingSpinner';
import { GameCard, GameCardProps } from '@/components/GameCard'

export default function Home(){
  const [popularGames, setPopularGames] = useState<GameCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return(
      <div className="container">
        <h1 className="title text-center font-medium">
            Featured Games:
        </h1>
        <Carousel>
          <CarouselContent className="pb-4 w-full max-w-5xl mx-auto">
          {popularGames.map((game, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <GameCard { ...game } />
            </CarouselItem>
          ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <h1 className="subtitle text-center font-medium">
          Create Your Own Game:
        </h1>
        <RedirectButton url="/create" text="Create" className="button  w-[125px] h-[40px]"/>
      </div>
  )
}
