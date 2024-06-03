import {WinAmountDetermining} from "@jconradi/pokie";

export type ClustWinLocation = [number, number];

export interface WinningClusterDescribing extends WinAmountDetermining {
    getSymbolId(): string;

    getSymbolsPositions(): ClustWinLocation[];

    getWildSymbolsPositions(): ClustWinLocation[];
}
