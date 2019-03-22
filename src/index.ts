import { Observable } from 'rxjs';
import { timer, fromEvent } from 'rxjs';
import { map, bufferCount, share } from 'rxjs/operators'

const DEFAULT_SETTINGS = {
    startScrollMs: 3000,
    scrollFrequencyMs: 1000,
}

const DEFAULT_KIDOKER_ALPHABET = [ "1", "2", "3", "4", "5", "6", "7", "8", "9"]

var settings = DEFAULT_SETTINGS
var kidokerAlphabet = DEFAULT_KIDOKER_ALPHABET

// share() it is needed for avoiding a second call to randomItems() when the events of the piped 
// observable 'numberGeneratorBufferedObservable' are generated (no double 'side effect')
var numberGeneratorObservable = timer(2000, 1000).pipe(map( (x : any) => randomItems(kidokerAlphabet, 1)[0] ), share())
var numberGeneratorBufferedObservable = numberGeneratorObservable.pipe(bufferCount(3, 1))
var clickObservable = fromEvent(document, 'click')

numberGeneratorObservable.subscribe(
    (x:any) => logItem(x)
);


numberGeneratorBufferedObservable.subscribe(
    (x:any) => console.log(x)
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


function logItem(val:any) {
    //document.getElementById("numberScrollerPanel").innerHTML = val;
    var html = document.getElementById("numberScrollerPanel").innerHTML;
    document.getElementById("numberScrollerPanel").innerHTML = html + '<br>' + val;
}

function randomItems(array : any, n : number) {
    var arrayToShuffle = Array.from(array)
    var j, x;
    for (let i = arrayToShuffle.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arrayToShuffle[i];
        arrayToShuffle[i] = arrayToShuffle[j];
        arrayToShuffle[j] = x;
    }
    return arrayToShuffle.slice(0, n);
}