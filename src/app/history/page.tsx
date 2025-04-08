"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "./styles.css";

type GameHistory = {
  id: number;
  name: string;
  numPlays: number;
  numWins: number;
  fastestTime: number;
};

export default function History(){
  const [userHistory, setUserHistory] = useState<GameHistory[]>([]);
  
  // call endpoint to receive user history
  useEffect(() => {
    fetch("/api/getUserHistoryById?id=lKWKGCmoUWM5ggLm1pv90ltIlFU2")
      .then((res) => res.json())
      .then((history) => {
        setUserHistory(history);
        console.log("Fetched user history:", history);
      })
      .catch((err) => {
        console.error("Failed to fetch user history:", err);
      });
  }, []);

  if (userHistory.length == 0) {
    return (
      <div className="container">
        <h1 className="title text-center font-medium">
          No games played yet.
        </h1>
      </div>
    )
  }
  
  // iterate through map of history to determine top 3 played games
  let top1: GameHistory | undefined;
  let top2: GameHistory | undefined;
  let top3: GameHistory | undefined;

  Object.entries(userHistory).forEach(([key, game]) => {
    // check if game is undefined
    if (!game) return;

    // check if game has been played the most
    if (top1 == undefined) {
      top1 = game;
    } else if (game.numPlays > top1.numPlays) {
      // shift the rankings down
      top3 = top2;
      top2 = top1;
      top1 = game;
    } else if (top2 == undefined) {
      top2 = game;
    } else if (game.numPlays > top2.numPlays) {
      // shift the rankings down
      top2 = top1;
      top2 = game;
    } else if (top3 == undefined) {
      top3 = game;
    } else if (game.numPlays > top3.numPlays) {
      top3 = game;
    }
  });

  const topGames: (GameHistory | undefined)[] = [top1, top2, top3].filter(Boolean);
  console.log(topGames);

  return(
      <div className="container">
        <h1 className="title text-center font-medium">
            Games Played
        </h1>
        <Table className="table table-fixed">
          <TableCaption className="text-center">Your top 3 played games.</TableCaption>
          <TableHeader>
            <TableRow className="table-row">
              <TableHead className="w-[125px]"></TableHead>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[125px] text-center">Number of Plays</TableHead>
              <TableHead className="w-[125px] text-center">Percent Solved</TableHead>
              <TableHead className="w-[125px] text-center">Fastest Solve Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topGames.map((game, index) => ( game != undefined ?
              <TableRow className="table-row" key={game.id}>
                <TableCell className="w-[125px] text-right medium-cell">
                  {game.name}
                </TableCell>
                <TableCell
                  className={`text-center ${index === 0 ? "gold-cell" : index === 1 ? "silver-cell" : "bronze-cell"} small-cell w-[50px]`}
                >
                  {index + 1}
                </TableCell>
                <TableCell className="text-center grey-cell medium-cell w-[125px]">
                  {game.numPlays}
                </TableCell>
                <TableCell
                  className={`text-center ${(game.numWins / game.numPlays) >= 0.5 ? "green-cell" : "red-cell"} medium-cell w-[125px]`}
                >
                  {Math.ceil((game.numWins / game.numPlays) * 100)}%
                </TableCell>
                <TableCell className="text-center grey-cell medium-cell w-[125px]">
                  {
                    Math.floor(game.fastestTime / 60) > 0 
                    ? `${Math.floor(game.fastestTime / 60)}m ` 
                    : ""
                  }
                  {game.fastestTime % 60}s
                </TableCell>
              </TableRow>
              : undefined
            ))}
          </TableBody>
        </Table>
      </div>
  )
}
