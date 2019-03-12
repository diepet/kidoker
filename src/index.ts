import { Observable } from 'rxjs';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators'

const DEFAULT_SETTINGS = {
    startScrollMs: 3000,
    scrollFrequencyMs: 1000,
}

const DEFAULT_KIDOKER_ALPHABET = [ "1", "2", "3", "4", "5", "6", "7", "8", "9"]

var settings = DEFAULT_SETTINGS
var kidokerAlphabet = DEFAULT_KIDOKER_ALPHABET

var numberGeneratorObservable = timer(3000, 1000).pipe(map( (x : any) => randomItem(kidokerAlphabet, 1)[0] ))

numberGeneratorObservable.subscribe(
    (x:any) => logItem(x),
    (error: any) => logItem ('Error: ' + error),
    () => logItem('Completed')
);

function logItem(val:any) {
    document.getElementById("numberScrollerPanel").innerHTML = val;
}

function randomItem(array : any, n : number) {
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