import { ProgrammasReader } from "./programmas-reader/programmas-reader";
import { Verkiezingsprogramma } from "../models/verkiezingsprogramma";
import { WordCount } from "../models/word-count";
import * as fs from 'fs';
import { filterwoorden } from "../filterwoorden";
import { filterzinnen } from "../filterzinnen";


export class VerkiezingsprogrammaWordWriter {

    public async parseProgrammas() {
        console.log('start read');
        const verkiezingsprogrammas: Verkiezingsprogramma[] = await new ProgrammasReader().readProgrammas();
        console.log('end read');

        var separators = ['\\\+', ' ', '\n'];
        var regex = new RegExp(separators.join('|'),'g');
        var illegalChars = new Array('▶', '•', '\\|', '\\(', '\\)', '\\.', '\[0-9\]+', '/-/','–', ':', ',', '/-');
        var illegalRegex = new RegExp(illegalChars.join('|'), 'g');
        const stopWords = filterwoorden;
        console.log(`filterwoorden: ${stopWords}`);
        const illegalSentences = filterzinnen;
        const sentenceRegex = new RegExp(illegalSentences.join('|'), 'g');

        await Promise.all(verkiezingsprogrammas.map(async(verkiezingsprogramma: Verkiezingsprogramma) => {
            verkiezingsprogramma.filtered = verkiezingsprogramma.rawText.replace(sentenceRegex, "");
            verkiezingsprogramma.filtered = verkiezingsprogramma.filtered.toLowerCase();
            verkiezingsprogramma.filtered = verkiezingsprogramma.filtered.replace(illegalRegex, "");
            verkiezingsprogramma.wordArray = verkiezingsprogramma.filtered.split(regex)

            verkiezingsprogramma.wordArray = verkiezingsprogramma.wordArray.filter((word) => word != '' && !stopWords.has(word));

            verkiezingsprogramma.wordCounter = new Map<string, number>();
            verkiezingsprogramma.wordArray.forEach(word => {
                if (!verkiezingsprogramma.wordCounter.has(word)) {
                    verkiezingsprogramma.wordCounter.set(word, 1);
                } else {
                    verkiezingsprogramma.wordCounter.set(word, verkiezingsprogramma.wordCounter.get(word)! + 1);
                }
            })
            verkiezingsprogramma.orderedWordCounter = new Array([...verkiezingsprogramma.wordCounter.entries()].sort((a, b) => b[1] - a[1])); 
            verkiezingsprogramma.orderedList = await Promise.all(verkiezingsprogramma.orderedWordCounter[0].
                map((entry: any) => { 
                    return { word: entry[0], count: entry[1]} as WordCount
                }));
        }));
        verkiezingsprogrammas.forEach((verkiezingsprogramma) => {
            const json = JSON.stringify(verkiezingsprogramma);
            fs.writeFileSync(`output/${verkiezingsprogramma.party}.json`, json);

            console.log(`${verkiezingsprogramma.party}:`)
            for (let i = 0; i < 10; i++) {
                console.log(`${verkiezingsprogramma.orderedList[i].word}`)
            }
            console.log('')
        } );
        console.log(verkiezingsprogrammas[11].rawText)
    }

    
    
}