import {WinAmountDetermining} from "@jconradi/pokie";

export interface WinningScatterDescribing extends WinAmountDetermining {
    getSymbolId(): string;
    getSymbolsPositions(): number[][];
}
