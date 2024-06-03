import {ClustWinLocation, WinningClusterDescribing} from "@jconradi/pokie";

export class WinningCluster implements WinningClusterDescribing {
    private readonly winAmount: number;
    private readonly symbolsPositions: ClustWinLocation[];
    private readonly wildSymbolsPositions: ClustWinLocation[];
    private readonly symbolId: string;

    constructor(
        winAmount: number,
        symbolsPositions: ClustWinLocation[],
        wildSymbolsPositions: ClustWinLocation[],
        symbolId: string,
    ) {
        this.winAmount = winAmount;
        this.symbolsPositions = [...symbolsPositions];
        this.wildSymbolsPositions = [...wildSymbolsPositions];
        this.symbolId = symbolId;
    }

    public getSymbolId(): string {
        return this.symbolId;
    }

    public getSymbolsPositions(): ClustWinLocation[] {
        return [...this.symbolsPositions];
    }

    public getWildSymbolsPositions(): ClustWinLocation[] {
        return [...this.wildSymbolsPositions];
    }

    public getWinAmount(): number {
        return this.winAmount;
    }
}
