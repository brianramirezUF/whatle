import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
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
    },
    {
      id: "2",
      name: "Pokedle",
    },
    {
      id: "3",
      name: "NBAdle",
    },
    {
      id: "1",
      name: "Marvelde",
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
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-semibold">{game.name}</span>
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
        <Button className="button w-[100px]">Create</Button>
      </div>
  )
}
