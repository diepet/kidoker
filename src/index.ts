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
var clickObservable = fromEvent(document, 'click')
var numberGeneratorObservable = Observable.create(function(observer : any) {
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
    share(),
    takeUntil(clickObservable),
    repeat(Number.MAX_SAFE_INTEGER));

var numberGeneratorBufferedObservable = 
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

        /* TODO the final check */
        console.log(lastItems[lastItems.length - 1] == gameIterations[gameIterations.length - 1].item)
    }
);

/*


clickObservable.subscribe(
    val => console.log(`CLICKED: ${val}`)
);

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

