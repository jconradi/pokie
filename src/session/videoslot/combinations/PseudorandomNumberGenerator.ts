import {RandomNumberGenerating} from "@jconradi/pokie";

export class PseudorandomNumberGenerator implements RandomNumberGenerating {
    public getRandomInt(min: number, max: number): number {
        return Math.floor(min + Math.random() * (max - min));
    }
}
