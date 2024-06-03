import {GameSessionHandling} from "@jconradi/pokie";

export interface BetForNextSimulationRoundSetting {
    setBetForNextRound(session: GameSessionHandling): void;
}
