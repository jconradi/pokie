import {GameSessionHandling, GameInitialNetworkData, GameRoundNetworkData} from "@jconradi/pokie";

export interface GameSessionSerializing {
    getInitialData(session: GameSessionHandling): GameInitialNetworkData;

    getRoundData(session: GameSessionHandling): GameRoundNetworkData;
}
