import { Observable, Observer, of } from 'rxjs';
import { timer, fromEvent, from } from 'rxjs';
import { map, concatMap, bufferCount, share, takeUntil, repeat, delay, concatAll } from 'rxjs/operators'
import { Settings, Game, GameIteration } from './model'

const DEFAULT_KIDOKER_ALPHABET : string[] = [ "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const DEFAULT_SETTINGS : Settings = {
    startScrollMs: 3000,
    scrollFrequencyMs: 1000,
    sequenceLength: 3,
    minItemsForGame: 4,
    maxItemsForGame: 15,
    alphabet: DEFAULT_KIDOKER_ALPHABET
}

let settings : Settings = DEFAULT_SETTINGS

// share() it is needed for avoiding a second call to randomItems() when the events of the piped 
// observable 'numberGeneratorBufferedObservable' are generated (no double 'side effect')
var clickObservable = fromEvent(document, 'click')
var numberGeneratorObservable = Observable.create(function(observer  : any) {
    var game : Game = generateGame(settings);
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
    repeat(Number.MAX_SAFE_INTEGER));

/*
var numberGeneratorObservable = 
    timer(DEFAULT_SETTINGS.startScrollMs, DEFAULT_SETTINGS.scrollFrequencyMs).pipe(
        map( (x : any) => randomItems(settings.alphabet, 1)[0] ), 
        share(), 
        takeUntil(clickObservable),
        repeat(3)
    )
var numberGeneratorBufferedObservable = numberGeneratorObservable.pipe(bufferCount(3, 1))
*/


numberGeneratorObservable.subscribe(
    (gameIteration : GameIteration) => paintGameIteration(gameIteration)
);

clickObservable.subscribe(
    val => console.log(`CLICKED: ${val}`)
);


/*
numberGeneratorObservable.subscribe(
    (x:any) => logItem(x),
    (error: any) => logItem ('Error: ' + error),
    () => logItem('Completed')
);
*/


function paintGameIteration(gameIteration : GameIteration) {
    document.getElementById("itemScrollerPanel").innerHTML = gameIteration.item;
    document.getElementById("winningSequencePanel").innerHTML = gameIteration.winningSequence.join(" ")
}

function generateWinningSequence(settings : Settings) : string[] {
    let arrayToShuffle : string[] = Array.from(settings.alphabet)
    var j, x;
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
    // random numbers before a winning sequence
    let numItemsToGenerate : number = generateRandomInt(settings.minItemsForGame, settings.maxItemsForGame + 1)
    let randomSequence : string[] = [ ]
    for (let i=0; i<numItemsToGenerate; i++) {
        randomSequence.push(settings.alphabet[generateRandomInt(0, settings.alphabet.length)])
    }
    let winningSequence : string[] = generateWinningSequence(settings)
    randomSequence = randomSequence.concat(winningSequence)
    return { randomSequence: randomSequence, winningSequence: winningSequence }
}

