export interface Settings {
    startScrollMs : number;
    scrollFrequencyMs : number;
    sequenceLength : number;
    minItemsForGame : number;
    maxItemsForGame : number;
    alphabet : string[];
}

export interface Game {
    randomSequence : string[];
    winningSequence : string[]
}

export interface GameIteration {
    item : string;
    winningSequence : string[]
}