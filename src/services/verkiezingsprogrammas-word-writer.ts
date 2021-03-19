import { ProgrammasReader } from "./programmas-reader/programmas-reader";
import { Verkiezingsprogramma } from "../models/verkiezingsprogramma";
import { WordCount } from "../models/word-count";
import * as fs from 'fs';
import { filterwoorden } from "./filter/filterwoorden";
import { filterzinnen } from "./filter/filterzinnen";


export class VerkiezingsprogrammaWordWriter {

    public async parseProgrammas() {
        console.log('start read');
        const verkiezingsprogrammas: Verkiezingsprogramma[] = await new ProgrammasReader().readProgrammas();
        console.log('end read');

        var separators = ['\\\+', ' ', '\n'];
        var regex = new RegExp(separators.join('|'),'g');
        var illegalChars = new Array('▶', '•', '\\|', '\\(', '\\)', '\\.', '\[0-9\]+', ':', ',',  '\\?');
        var illegalRegex = new RegExp(illegalChars.join('|'), 'g');
        const stopWords = filterwoorden;
        console.log(`filterwoorden: ${stopWords}`);
        const illegalSentences = filterzinnen;
        const sentenceRegex = new RegExp(illegalSentences.join('|'), 'g');

        await Promise.all(verkiezingsprogrammas.map(async(verkiezingsprogramma: Verkiezingsprogramma) => {
            let filtered = verkiezingsprogramma.rawText.replace(sentenceRegex, "");
            filtered = filtered.toLowerCase();
            filtered = filtered.replace(illegalRegex, "");
            let wordArray = filtered.split(regex);
            wordArray = wordArray.filter((word) => word != '' && !stopWords.has(word));
            const wordCounter = new Map<string, number>();
            wordArray.forEach(word => {
                if (!wordCounter.has(word)) {
                    wordCounter.set(word, 1);
                } else {
                    wordCounter.set(word, wordCounter.get(word)! + 1);
                }
            })
            const orderedWordCounter = new Array([...wordCounter.entries()].sort((a, b) => b[1] - a[1])); 
            verkiezingsprogramma.orderedList = await Promise.all(orderedWordCounter[0].
                map((entry: any) => { 
                    return { word: entry[0], count: entry[1]} as WordCount
                }));
        }));
        verkiezingsprogrammas.forEach((verkiezingsprogramma) => {
            verkiezingsprogramma.rawText = "haven't saved rawtext";
            const json = JSON.stringify(verkiezingsprogramma);
            fs.writeFileSync(`output/${verkiezingsprogramma.party}.json`, json);

            console.log(`${verkiezingsprogramma.party}:`)
            for (let i = 0; i < 10; i++) {
                console.log(`${verkiezingsprogramma.orderedList[i].word}`)
            }
            console.log('')
        } );
    }

    
    
}