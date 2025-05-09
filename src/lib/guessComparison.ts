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
            details: guess.toLocaleString('en')
        };
    }

    if (guess > answer) {
        return {
            status: GuessStatus.OVER,
            details: guess.toLocaleString('en')
        };
    }

    if (guess == answer) {
        return {
            status: GuessStatus.CORRECT,
            details: guess.toLocaleString('en')
        };
    }

    return {
        status: GuessStatus.INCORRECT,
        details: guess.toLocaleString('en')
    };
};

const compareBoolean = (guess: string | boolean, answer: string | boolean): GuessCorrectness => {
    // Normalize guess and answer if they are strings
    if (typeof guess === 'string') {
        guess = guess.trim().toLowerCase() === 'true';
    }
    if (typeof answer === 'string') {
        answer = answer.trim().toLowerCase() === 'true';
    }
    return {
        status: guess === answer ? GuessStatus.CORRECT : GuessStatus.INCORRECT,
        details: guess ? 'True' : 'False'
    };
};

const compareCollection = (guess: Array<string>, answer: Array<string>): GuessCorrectness => {
    const guessArr = Array.isArray(guess) ? guess : String(guess).split(',').map(s => s.trim());
    const answerArr = Array.isArray(answer) ? answer : String(answer).split(',').map(s => s.trim());

    const safeGuess: string[] = Array.isArray(guess) ? guess : [guess];
    const safeAnswer: string[] = Array.isArray(answer) ? answer : [answer];

    const correct = safeAnswer.filter((x) => safeGuess.includes(x));
    const extra = safeGuess.filter((x) => !safeAnswer.includes(x));
    const missingCount = safeAnswer.length - correct.length;

    console.log('Correct:', correct);
    console.log('Extra:', extra);
    console.log('Missing Count:', missingCount);

    const joinedGuess = safeGuess.join(', ');

    if (missingCount === 0 && extra.length === 0) {
        return {
            status: GuessStatus.CORRECT,
            details: joinedGuess
        };
    }
    else if (missingCount === answer.length) {
        return {
            status: GuessStatus.INCORRECT,
            details: joinedGuess
        };
    }
    else {
        return {
            status: GuessStatus.PARTIAL,
            details: joinedGuess
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