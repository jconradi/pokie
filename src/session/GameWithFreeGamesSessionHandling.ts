import {
    FreeGamesStateDetermining,
    FreeGamesStateSetting,
    GameSessionHandling,
    WonFreeGamesNumberDetermining,
} from "@jconradi/pokie";

export interface GameWithFreeGamesSessionHandling
    extends GameSessionHandling,
        WonFreeGamesNumberDetermining,
        FreeGamesStateDetermining,
        FreeGamesStateSetting {}
