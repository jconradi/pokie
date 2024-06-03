import {GameWithFreeGamesSessionHandling, GameInitialNetworkData, GameRoundNetworkData} from "@jconradi/pokie";

export interface GameWithFreeGamesSessionSerializing {
    getInitialData(session: GameWithFreeGamesSessionHandling): GameInitialNetworkData;

    getRoundData(session: GameWithFreeGamesSessionHandling): GameRoundNetworkData;
}
