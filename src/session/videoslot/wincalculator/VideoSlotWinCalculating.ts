import {SymbolsCombinationDescribing, VideoSlotWinDetermining} from "@jconradi/pokie";

export interface VideoSlotWinCalculating extends VideoSlotWinDetermining {
    calculateWin(bet: number, symbolsCombination: SymbolsCombinationDescribing): void;
}
