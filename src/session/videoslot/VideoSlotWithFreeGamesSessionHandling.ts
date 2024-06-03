import {
    GameWithFreeGamesSessionHandling,
    VideoSlotSessionHandling,
    VideoSlotWithFreeGamesConfigDescribing,
} from "@jconradi/pokie";

export interface VideoSlotWithFreeGamesSessionHandling
    extends VideoSlotSessionHandling,
        GameWithFreeGamesSessionHandling,
        VideoSlotWithFreeGamesConfigDescribing {}
