import {
    AvailableBetsDescribing,
    GameSessionStateDetermining,
    GameSessionStateSetting,
    PlayableGame,
    WinAmountDetermining,
} from "@jconradi/pokie";

export interface GameSessionHandling
    extends GameSessionStateDetermining,
        GameSessionStateSetting,
        PlayableGame,
        WinAmountDetermining,
        AvailableBetsDescribing {}
