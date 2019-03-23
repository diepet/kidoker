import { Observable, Observer } from 'rxjs';
import { timer, fromEvent, from } from 'rxjs';
import { map, bufferCount, share, takeUntil, repeat } from 'rxjs/operators'


interface Settings {
    startScrollMs : number;
    scrollFrequencyMs : number;
    sequenceLength : number;
    minItemsForGame : number;
    maxItemsForGame : number;
    alphabet : string[];
}

interface Game {
    randomSequence : string[];
    winningSequence : string[]
}

const DEFAULT_KIDOKER_ALPHABET : string[] = [ "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const DEFAULT_SETTINGS : Settings = {
    startScrollMs: 3000,
    scrollFrequencyMs: 1000,
    sequenceLength: 3,
    minItemsForGame: 2,
    maxItemsForGame: 10,
    alphabet: DEFAULT_KIDOKER_ALPHABET
}

let settings : Settings = DEFAULT_SETTINGS

// share() it is needed for avoiding a second call to randomItems() when the events of the piped 
// observable 'numberGeneratorBufferedObservable' are generated (no double 'side effect')
var clickObservable = fromEvent(document, 'click')
var numberGeneratorObservable = Observable.create(function(observer  : any) {
    var game : Game = generateGame(settings);
    game.randomSequence.forEach(function(value) {
        observer.next(value);
    });
    observer.complete();
});

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

//numberGeneratorObservable = from(DEFAULT_KIDOKER_ALPHABET)

//numberGeneratorObservable = numberGeneratorObservable.pipe(takeUntil(clickObservable))

numberGeneratorObservable.subscribe(
    (x:any) => logItem(x)
);

7/*
numberGeneratorBufferedObservable.subscribe(
    (x:any) => console.log(x)
);
*/

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


function logItem(val:any) {
    //document.getElementById("numberScrollerPanel").innerHTML = val;
    var html = document.getElementById("numberScrollerPanel").innerHTML;
    document.getElementById("numberScrollerPanel").innerHTML = html + '<br>' + val;
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

