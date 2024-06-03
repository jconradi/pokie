import {GameInitialNetworkData, GameRoundNetworkData} from "@jconradi/pokie";

export type GameWithFreeGamesInitialNetworkData = {
    /** empty **/
} & GameInitialNetworkData &
    GameWithFreeGamesRoundNetworkData;

export type GameWithFreeGamesRoundNetworkData = {
    freeGamesNum?: number;
    freeGamesSum?: number;
    freeGamesBank?: number;
    wonFreeGamesNumber?: number;
} & GameRoundNetworkData;
