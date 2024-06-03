import {
    GameSessionSerializing,
    VideoSlotInitialNetworkData,
    VideoSlotSessionHandling,
    VideoSlotRoundNetworkData,
} from "@jconradi/pokie";

export interface VideoSlotSessionSerializing extends GameSessionSerializing {
    getInitialData(session: VideoSlotSessionHandling): VideoSlotInitialNetworkData;

    getRoundData(session: VideoSlotSessionHandling): VideoSlotRoundNetworkData;
}
