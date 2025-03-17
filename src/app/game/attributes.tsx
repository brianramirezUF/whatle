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
    type: string
};

enum GuessStatus {
    CORRECT = '#4CAF50',
    INCORRECT = '#F44336',
    PARTIAL = '#FF9800',
    OVER = '#2196F3',
    UNDER = '#3F51B5',
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
    // iterate and compare each in guess to each in answer (n^2)
    // make a collection a dictionary, each value would be stored like 
    // {'value': ..., 'type': ...} then each value in the collection can be compared based on the given type
    const correct = answer.filter(x => guess.includes(x));
    const extra = guess.filter(x => !answer.includes(x));
    const missingCount = answer.length - correct.length;

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
type CompareType = 'String' | 'Number' | 'Boolean' | 'Array';

// Enum containing all possible types for an attribute and their associated comparison function
const comparisons: Record<CompareType, (guess: any, answer: any) => GuessCorrectness> = {
    String: comparestring,
    Number: compareNumber,
    Boolean: compareBoolean,
    Array: compareCollection
};

// Component to display within the game page for each individual attribute
export const Guess: React.FC<guessProps> = ({ guess, answer, type }) => {
    const result = comparisons[type as CompareType](guess, answer);
    console.log(result);
    const content = (
        <td className='text-white' style={{ backgroundColor: `${result.status}`}}>
            {result.details}
        </td>
    );

    return content;
};