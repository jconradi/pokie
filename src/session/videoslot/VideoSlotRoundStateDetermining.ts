import {SymbolsCombinationDescribing, VideoSlotWinDetermining} from "@jconradi/pokie";

export interface VideoSlotRoundStateDetermining extends VideoSlotWinDetermining {
    getSymbolsCombination(): SymbolsCombinationDescribing;
}
