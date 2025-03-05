import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


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
      <h1>
          Games Played
      </h1>
      <Table>
        <TableCaption>Your top 3 played games.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead>Number of Plays</TableHead>
            <TableHead>Percent Solved</TableHead>
            <TableHead>Fastest Solve Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top3.map((game, index) => (
            <TableRow key={game.id}>
              <TableCell className="text-right">
                {game.name}
              </TableCell>
              <TableCell>
                {index + 1}
              </TableCell>
              <TableCell>
                {game.numPlays}
              </TableCell>
              <TableCell>
                {Math.ceil((game.numWins / game.numPlays) * 100)}%
              </TableCell>
              <TableCell>
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
    </>
  )
}
