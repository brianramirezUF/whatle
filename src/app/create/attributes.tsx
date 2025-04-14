import { Card, CardContent } from "@/components/ui/card";
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
    answer: string,
    type: string,
    rowIndex?: number,
    colIndex?: number,
};

export enum GuessStatus {
    CORRECT = '#4CAF50',
    INCORRECT = '#F44336',
    PARTIAL = '#FF9801',
    UNDER = '#FF9800',
    OVER = '#FF9802',
    // OVER = '#2196F3',
    // UNDER = '#3F51B5',
}

interface GuessCorrectness {
    status: GuessStatus,
    details?: string
}

const comparestring = (guess: string, answer: string): GuessCorrectness => {
    return {
        status: guess === answer ? GuessStatus.CORRECT : GuessStatus.INCORRECT,
        details: guess
    };
};

const compareNumber = (guess: number, answer: number): GuessCorrectness => {
    // change guess and answer to have the correct respective values (probably not a good solution)
    guess = Number(guess);
    answer = Number(answer);

    if (guess < answer) {
        return {
            status: GuessStatus.UNDER,
            details: guess.toString()
        };
    }

    if (guess > answer) {
        return {
            status: GuessStatus.OVER,
            details: guess.toString()
        };
    }

    if (guess == answer) {
        return {
            status: GuessStatus.CORRECT,
            details: guess.toString()
        };
    }

    return {
        status: GuessStatus.INCORRECT,
        details: guess.toString()
    };
};

const compareBoolean = (guess: boolean, answer: boolean): GuessCorrectness => {
    // change guess and answer to have the correct respective values (probably not a good solution)
    guess = Boolean(guess);
    answer = Boolean(answer);

    return {
        status: guess === answer ? GuessStatus.CORRECT : GuessStatus.INCORRECT,
        details: guess.toString()
    };
};

const compareCollection = (guess: Array<string>, answer: Array<string>): GuessCorrectness => {
    const correct = answer.filter(x => guess.includes(x));
    const extra = guess.filter(x => !answer.includes(x));
    const missingCount = answer.length - correct.length;

    console.log('Correct:', correct);
    console.log('Extra:', extra);
    console.log('Missing Count:', missingCount)

    if (missingCount === 0 && extra.length === 0) {
        return {
            status: GuessStatus.CORRECT,
            details: guess.join()
        };
    }
    else if (missingCount === answer.length) {
        return {
            status: GuessStatus.INCORRECT,
            details: guess.join()
        };
    }
    else {
        return {
            status: GuessStatus.PARTIAL,
            details: guess.join(',')
        };
    }
};

// Define type for specific comparisons
type CompareType = 'String' | 'Number' | 'Boolean' | 'Collection';

// Enum containing all possible types for an attribute and their associated comparison function
// NOTE: for new data types, just add a new value to CompareType above, and an associated comparison function here
export const comparisons: Record<CompareType, (guess: any, answer: any) => GuessCorrectness> = {
    String: comparestring,
    Number: compareNumber,
    Boolean: compareBoolean,
    Collection: compareCollection
};

// Component to display within the game page for each individual attribute
export const Guess: React.FC<guessProps> = ({ guess, answer, type, rowIndex = 0, colIndex = 0 }) => {
    let result;
    if (answer.includes(',')) {
        const answerArray = answer.split(',');
        const guessArray = guess.split(',');
        result = comparisons['Collection'](guessArray, answerArray);
    }
    else {
        result = comparisons[type as keyof typeof comparisons](guess, answer);
    }
    const { status, details } = result;

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