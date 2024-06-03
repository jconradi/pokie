import {WinAmountDetermining} from "@jconradi/pokie";

export class NoWinAmount implements WinAmountDetermining {
    public getWinAmount(): number {
        return 0;
    }
}
