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

export default function History(){
  const Users = {
    history: {
      1: {
        id: 1,
        name: "Marvelde",
        numPlays: 20,
        numWins: 13,
        fastestTime: 53,
      },
      2: {
        id: 2,
        name: "Pokedle",
        numPlays: 10,
        numWins: 1,
        fastestTime: 192,
      },
      3: {
        id: 3,
        name: "NBAdle",
        numPlays: 3,
        numWins: 2,
        fastestTime: 106,
      },
    }
  }

  const top3 = [Users.history[1], Users.history[2], Users.history[3]];
  
  // call endpoint to receive current user's history
  // iterate through map of history to determine top 3 played games

  return(
    <>
      <div className="container">
        <h1 className="title text-center font-medium">
            Games Played
        </h1>
        <Table className="table">
          <TableCaption className="text-center">Your top 3 played games.</TableCaption>
          <TableHeader>
            <TableRow className="table-row">
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-center">Number of Plays</TableHead>
              <TableHead className="text-center">Percent Solved</TableHead>
              <TableHead className="text-center">Fastest Solve Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top3.map((game, index) => (
              <TableRow className="table-row" key={game.id}>
                <TableCell className="text-right">
                  {game.name}
                </TableCell>
                <TableCell
                  className={`text-center ${index === 0 ? "gold-cell" : index === 1 ? "silver-cell" : "bronze-cell"} small-cell`}
                >
                  {index + 1}
                </TableCell>
                <TableCell className="text-center grey-cell medium-cell">
                  {game.numPlays}
                </TableCell>
                <TableCell
                  className={`text-center ${(game.numWins / game.numPlays) >= 0.5 ? "green-cell" : "red-cell"} medium-cell`}
                >
                  {Math.ceil((game.numWins / game.numPlays) * 100)}%
                </TableCell>
                <TableCell className="text-center grey-cell medium-cell">
                  {
                    Math.floor(game.fastestTime / 60) > 0 
                    ? `${Math.floor(game.fastestTime / 60)}m ` 
                    : ""
                  }
                  {game.fastestTime % 60}s
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
