import { Verkiezingsprogramma } from "../../models/verkiezingsprogramma";
import * as fs from 'fs';
var pdfreader = require('pdf-parse');

export class ProgrammasReader {
    public async readProgrammas(): Promise<Verkiezingsprogramma[]> {
        const folderPath = "verkiezingprogrammas/"
        const verkiezingprogrammaPDFS = fs.readdirSync(folderPath);
        return Promise.all(verkiezingprogrammaPDFS.map((pdf) => {
            const databuffer = fs.readFileSync(`${folderPath}/${pdf}`);
            return pdfreader(databuffer).then((data: any) => {
                return {party: pdf.replace('.pdf', ''), rawText: data.text} as Verkiezingsprogramma;
            })
        }));
        
    }   
}