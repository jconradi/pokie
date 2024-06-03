import {BetForNextSimulationRoundSetting, NextSessionRoundPlayableDetermining} from "@jconradi/pokie";

export interface SimulationConfigDescribing {
    getNumberOfRounds(): number;

    getPlayStrategy(): NextSessionRoundPlayableDetermining;

    getChangeBetStrategy(): BetForNextSimulationRoundSetting | undefined;
}
