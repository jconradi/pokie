import {
    GameWithFreeGamesSessionSerializing,
    VideoSlotSessionSerializing,
    VideoSlotWithFreeGamesInitialNetworkData,
    VideoSlotWithFreeGamesRoundNetworkData,
    VideoSlotWithFreeGamesSessionHandling,
} from "@jconradi/pokie";

export interface VideoSlotWithFreeGamesSessionSerializing
    extends VideoSlotSessionSerializing,
        GameWithFreeGamesSessionSerializing {
    getInitialData(session: VideoSlotWithFreeGamesSessionHandling): VideoSlotWithFreeGamesInitialNetworkData;

    getRoundData(session: VideoSlotWithFreeGamesSessionHandling): VideoSlotWithFreeGamesRoundNetworkData;
}
