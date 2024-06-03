import {GameSessionHandling} from "@jconradi/pokie";

export interface NextSessionRoundPlayableDetermining {
    canPlayNextSimulationRound(session: GameSessionHandling): boolean;
}
