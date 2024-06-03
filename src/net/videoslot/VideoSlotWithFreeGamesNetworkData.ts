import {
    GameWithFreeGamesInitialNetworkData,
    GameWithFreeGamesRoundNetworkData,
    VideoSlotInitialNetworkData,
    VideoSlotRoundNetworkData,
} from "@jconradi/pokie";

export type VideoSlotWithFreeGamesInitialNetworkData = {
    /** empty **/
} & VideoSlotInitialNetworkData &
    GameWithFreeGamesInitialNetworkData &
    VideoSlotWithFreeGamesRoundNetworkData;

export type VideoSlotWithFreeGamesRoundNetworkData = {
    /** empty **/
} & VideoSlotRoundNetworkData &
    GameWithFreeGamesRoundNetworkData;
