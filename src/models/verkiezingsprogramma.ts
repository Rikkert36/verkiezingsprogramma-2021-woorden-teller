import { WordCount } from "./word-count";

export interface Verkiezingsprogramma {
    party: string,
    rawText: string,
    orderedList: WordCount[]
}