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

type Game = {
  id: string;
  name: string;
  icon: string;
};

export default function Home(){
  const [popularGames, setPopularGames] = useState<Game[]>([]);

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
      });
  }, []);
  
  if (popularGames.length == 0) {
    return (
      <div className="container">
        <h1 className="title text-center font-medium">
            Loading Games...
        </h1>
      </div>
    )
  }

  return(
      <div className="container">
        <h1 className="title text-center font-medium">
            Featured Games:
        </h1>
        <Carousel>
          <CarouselContent className="pb-4">
          {popularGames.map((game, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <Link href={{ pathname: "/play", query: { id: game.id } }}>
                <div className="p-1">
                  <Card
                    className="card"
                    style={game.icon ? {
                      backgroundImage: `url(${game.icon})`,
                    } : {}}
                  >
                    <CardContent className="card-content flex aspect-square items-center justify-center p-6">
                      <span className="text-3xl font-semibold text">{game.name}</span>
                    </CardContent>
                  </Card>
                </div>
              </Link>
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
