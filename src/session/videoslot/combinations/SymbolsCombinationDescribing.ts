import {BuildableFromMatrix, ConvertableToMatrix} from "@jconradi/pokie";

export interface SymbolsCombinationDescribing extends ConvertableToMatrix, BuildableFromMatrix {
    getSymbols(reelId: number): string[];
}
