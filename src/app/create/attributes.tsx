import { Card, CardContent } from "@/components/ui/card";
import { GuessStatus } from "@/lib/guessComparison";
// define all possible comparison functions, so you can compare a users guess to the correct answer and return the expected functionality
// based on the return, you can modify the display in the GamePage 
// (for example, if a number is less than: guess displays red with an up arrow, greater than: guess displays red with a down arrow,
// equal to: guess displays green)

// Define types for attributes and answers
export interface AttributeType {
    name: string;
    type: string;
}

export interface AnswerType {
    name: string;
    attributes: Record<string, string>;
}

interface guessProps {
    guess: string,
    status: GuessStatus
    details?: string,
    rowIndex?: number,
    colIndex?: number,
};

// Component to display within the game page for each individual attribute
export const Guess: React.FC<guessProps> = ({ details, status, rowIndex = 0, colIndex = 0 }) => {
    const backgroundImage = (() => {
        if (status === GuessStatus.OVER) return `url('/svgs/arrowDown.svg')`;
        if (status === GuessStatus.UNDER) return `url('/svgs/arrowUp.svg')`;
        return 'none';
    })();

    return (
        <div
        key={`cell-${rowIndex}-${colIndex}`}
        style={{ animationDelay: `${colIndex * 0.4}s` }}
        className="fade-in"
        >
        <Card
            className="p-2 shadow-md flex items-center justify-center border aspect-square min-w-[100px] max-w-[300px]"
            style={{
            backgroundColor: status,
            backgroundImage,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            }}
        >
            <CardContent className="text-center ">
            <div className="flex items-center justify-center">
                <span className="text-2xl text-center guess-text text-white">
                {details}
                </span>
            </div>
            </CardContent>
        </Card>
        </div>
    );
};