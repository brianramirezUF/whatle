import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { RedirectButton } from '@/components/Buttons'
import "./styles.css";

type Game = {
  id: string;
  name: string;
  icon: string;
};

export default function Home(){
  const Games = [
    {
      id: "4",
      name: "MLBdle",
      icon: "https://i.imgur.com/B7wb5i6_d.webp?maxwidth=520&shape=thumb&fidelity=high",
    },
    {
      id: "2",
      name: "Pokedle",
      icon: "https://i.imgur.com/5ValAxb.jpeg",
    },
    {
      id: "3",
      name: "NBAdle",
      icon: "https://i.imgur.com/PV54ZYq_d.webp?maxwidth=520&shape=thumb&fidelity=high",
    },
    {
      id: "1",
      name: "Marvelde",
      icon: "https://i.imgur.com/YZwdjey.jpeg",
    },
  ];
  
  // call endpoint to receive featured games
  const featuredGames = Games;

  return(
      <div className="container">
        <h1 className="title text-center font-medium">
            Featured Games:
        </h1>
        <Carousel>
          <CarouselContent className="pb-4">
          {featuredGames.map((game, index) => (
            <CarouselItem key={index} className="basis-1/3">
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
            </CarouselItem>
          ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <h1 className="subtitle text-center font-medium">
          Create Your Own Game:
        </h1>
        <RedirectButton url="/create-game" text="Create" className="button  w-[125px] h-[40px]"/>
      </div>
  )
}
