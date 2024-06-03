import {GameSessionHandling, NextSessionRoundPlayableDetermining} from "@jconradi/pokie";

export class PlayUntilAnyWinStrategy implements NextSessionRoundPlayableDetermining {
    public canPlayNextSimulationRound(session: GameSessionHandling): boolean {
        return session.getWinAmount() === 0;
    }
}
