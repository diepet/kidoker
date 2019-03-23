import { Observable, Observer, of } from 'rxjs';
import { timer, fromEvent, from } from 'rxjs';
import { map, concatMap, bufferCount, share, takeUntil, repeat, delay, concatAll, last, catchError } from 'rxjs/operators'
import { Settings, Game, GameIteration } from './model'

const DEFAULT_KIDOKER_ALPHABET : string[] = [ "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const DEFAULT_SETTINGS : Settings = {
    startScrollMs: 3000,
    scrollFrequencyMs: 800,
    sequenceLength: 3,
    minItemsForGame: 4,
    maxItemsForGame: 15,
    alphabet: DEFAULT_KIDOKER_ALPHABET
}

const EMPTY_GAME_ITERATION : GameIteration = { item: "", winningSequence: [ ]  }

let settings : Settings = DEFAULT_SETTINGS

// share() it is needed for avoiding a second call to generateGame() when the events of the piped 
// observable 'numberGeneratorBufferedObservable' are generated (no double 'side effect')
let clickObservable = fromEvent(document, 'click')
let numberGeneratorObservable = Observable.create(function(observer : any) {
    let game : Game = generateGame(settings);
    game.randomSequence.forEach(function(value) {
        let gameIteration : GameIteration = {
            item: value,
            winningSequence: game.winningSequence
        }
        observer.next(gameIteration);
    });
    observer.complete();
}).pipe(
    concatMap((gameIteration : GameIteration) => of(gameIteration).pipe(delay(settings.scrollFrequencyMs))),
    share(),
    takeUntil(clickObservable),
    repeat(Number.MAX_SAFE_INTEGER));

let numberGeneratorBufferedObservable = 
    numberGeneratorObservable.pipe(
        bufferCount(settings.sequenceLength, 1),
        takeUntil(clickObservable),
        last(),
        // for avoiding EmptyError when a click event is generated without a buffer
        catchError(_ => of([EMPTY_GAME_ITERATION ] )), 
        repeat(Number.MAX_SAFE_INTEGER)
    )

numberGeneratorObservable.subscribe(
    (gameIteration : GameIteration) => paintGameIteration(gameIteration)
);

numberGeneratorBufferedObservable.subscribe(
    (gameIterations : GameIteration[]) => { 
        let length = gameIterations.length;
        let lastItems : string[]  = [ ]
        gameIterations.forEach(function(gameIteration : GameIteration) {
            lastItems.push(gameIteration.item)
        })

        console.log(equalsArray(lastItems, gameIterations[gameIterations.length - 1].winningSequence))
    }
);

function paintGameIteration(gameIteration : GameIteration) {
    document.getElementById("itemScrollerPanel").innerHTML = gameIteration.item;
    document.getElementById("winningSequencePanel").innerHTML = gameIteration.winningSequence.join(" ")
}

function generateWinningSequence(settings : Settings) : string[] {
    let arrayToShuffle : string[] = Array.from(settings.alphabet)
    let j, x;
    for (let i = arrayToShuffle.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arrayToShuffle[i];
        arrayToShuffle[i] = arrayToShuffle[j];
        arrayToShuffle[j] = x;
    }
    return arrayToShuffle.slice(0, settings.sequenceLength);
}

function generateRandomInt(min : number, max : number) : number {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateGame(settings : Settings) : Game {
    // generate winning sequence
    let winningSequence : string[] = generateWinningSequence(settings)
    // generate random numbers before a winning sequence
    let numItemsToGenerate : number = generateRandomInt(settings.minItemsForGame, settings.maxItemsForGame + 1)
    let randomSequence : string[] = [ ]
    for (let i=0; i<numItemsToGenerate; i++) {
        randomSequence.push(settings.alphabet[generateRandomInt(0, settings.alphabet.length)])
    }
    randomSequence = randomSequence.concat(winningSequence)
    return { randomSequence: randomSequence, winningSequence: winningSequence }
}

function equalsArray(array1 : string[], array2 : string[]) {

    let len1 = array1.length
    let len2 = array2.length

    if (len1 != len2) { return false }

    for (let i=0; i<len1; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }

    return true;

}
