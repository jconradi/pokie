import {GameSessionConfigRepresenting, VideoSlotConfigDescribing, VideoSlotConfigSetting} from "@jconradi/pokie";

export interface VideoSlotConfigRepresenting
    extends GameSessionConfigRepresenting,
        VideoSlotConfigDescribing,
        VideoSlotConfigSetting {}
