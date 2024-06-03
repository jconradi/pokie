import {
    VideoSlotConfigRepresenting,
    VideoSlotWithFreeGamesConfigDescribing,
    VideoSlotWithFreeGamesConfigSetting,
} from "@jconradi/pokie";

export interface VideoSlotWithFreeGamesConfigRepresenting
    extends VideoSlotConfigRepresenting,
        VideoSlotWithFreeGamesConfigDescribing,
        VideoSlotWithFreeGamesConfigSetting {}
