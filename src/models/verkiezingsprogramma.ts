import { WordCount } from "./word-count";

export interface Verkiezingsprogramma {
    party: string,
    rawText: string,
    filtered: string,
    wordArray: string[],
    wordCounter: Map<string, number>,
    orderedWordCounter: any[],
    orderedList: WordCount[]
}