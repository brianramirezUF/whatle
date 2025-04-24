import "@/app/styles.css";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link";
import { GameCard, GameCardProps, padWithFiller } from '@/components/GameCard';
import { useAuth } from "@/contexts/AuthContext";

export const GameCarousel = ({title, games}: {title: string, games: GameCardProps[]}) => {
    const { currentUser } = useAuth();
    const currUid = !currentUser ? "" : currentUser.uid;
    const paddedGames = padWithFiller(games, 3);

    return (
        <div className="container px-4 md:px-10 lg:px-16 xl:px-20 w-full mt-4">
            <div className="relative w-full mx-auto">
                <h1 className="text-left font-bold text-xl mb-0 pl-0">
                    {title}
                </h1>
                <Carousel
                    opts={{
                        align: "start",
                        dragFree: true,
                        loop: true,
                        containScroll: "trimSnaps",
                    }}
                >
                    <CarouselContent className="pb-4">
                        {paddedGames.map((game, index) => (
                            <CarouselItem
                                key={index}
                                className="basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 min-w-0"
                            >
                                <div className="pr-4 h-full">
                                    <GameCard {...game} currUid={currUid} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <div className="hidden md:block">
                        <CarouselPrevious />
                        <CarouselNext />
                    </div>

                    <div className="flex justify-center gap-2 mt-4 md:hidden">
                        <CarouselPrevious className="relative" />
                        <CarouselNext className="relative" />
                    </div>
                </Carousel>
            </div>
        </div>
    );
};