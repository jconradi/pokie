import {ClustWinLocation, GameInitialNetworkData, GameRoundNetworkData, WinningLineNetworkData, WinningScatterNetworkData} from "@jconradi/pokie";

export type CascadingSlotInitialNetworkData = {
    availableSymbols: string[];
    reelsNumber: number;
    reelsSymbolsNumber: number;
    paytable: Record<number, Record<string, Record<number, number>>>;
    linesDefinitions: Record<string, number[]>;
} & GameInitialNetworkData &
CascadingSlotRoundNetworkData;

export type CascadingSlotRoundNetworkData = {
    reelsSymbols: string[][];
    cascadingResults: CascadingSlotResultsNetworkData[];
    winAmount: number;
} & GameRoundNetworkData;

export type CascadingSlotResultsNetworkData = {
    winningLines: Record<string, WinningLineNetworkData>;
    winningScatters: Record<string, WinningScatterNetworkData>;
    winningClusters: Record<string, WinningClusterNetworkData[]>;
    replacements: string[][];
    nextReels: string[][];
    winAmount: number;
}

export type WinningClusterNetworkData = {
    winAmount: number;
    symbolsPositions: ClustWinLocation[];
    wildSymbolsPositions: ClustWinLocation[];
    symbolId: string;
}
