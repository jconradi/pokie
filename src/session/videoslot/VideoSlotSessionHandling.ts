import {GameSessionHandling, VideoSlotConfigDescribing, VideoSlotRoundStateDetermining} from "@jconradi/pokie";

export interface VideoSlotSessionHandling
    extends VideoSlotConfigDescribing,
        GameSessionHandling,
        VideoSlotRoundStateDetermining {}
