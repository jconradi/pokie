import {
    PseudorandomNumberGenerator,
    RandomNumberGenerating,
    SymbolsCombination,
    SymbolsCombinationDescribing,
    SymbolsCombinationsGenerating,
    VideoSlotConfigDescribing,
} from "@jconradi/pokie";

export class SymbolsCombinationsGenerator implements SymbolsCombinationsGenerating {
    private readonly rng: RandomNumberGenerating;
    private readonly config: VideoSlotConfigDescribing;
    private readonly lastStops: number[];

    constructor(config: VideoSlotConfigDescribing, rng: RandomNumberGenerating = new PseudorandomNumberGenerator()) {
        this.config = config;
        this.rng = rng;
        this.lastStops = Array(config.getReelsNumber());
    }

    public generateSymbolsCombination(): SymbolsCombinationDescribing {
        const arr: string[][] = new Array(this.config.getReelsNumber());
        for (let i = 0; i < this.config.getReelsNumber(); i++) {
            arr[i] = this.getRandomReelSymbols(i);
        }
        return new SymbolsCombination().fromMatrix(arr);
    }

    public generateNextSymbolCombination(reelId: number, symbols: number): string[] {
        const sequence = this.config.getSymbolsSequences()[reelId];
        const lastStop = this.lastStops[reelId] + 1;
        this.lastStops[reelId] = lastStop + symbols;
        return sequence.getSymbols(lastStop, symbols);
    }

    private getRandomReelSymbols(reelId: number): string[] {
        const sequence = this.config.getSymbolsSequences()[reelId];
        const random = this.rng.getRandomInt(0, sequence.getSize());
        this.lastStops[reelId] = random + this.config.getReelsSymbolsNumber();
        return sequence.getSymbols(random, this.config.getReelsSymbolsNumber());
    }
}
