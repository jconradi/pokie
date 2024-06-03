import {
    AvailableBetDetermining,
    AvailableBetsDescribing,
    AvailableBetsSetting,
    GameSessionStateDetermining,
    GameSessionStateSetting,
} from "@jconradi/pokie";

export interface GameSessionConfigRepresenting
    extends GameSessionStateDetermining,
        GameSessionStateSetting,
        AvailableBetsDescribing,
        AvailableBetsSetting,
        AvailableBetDetermining {}
