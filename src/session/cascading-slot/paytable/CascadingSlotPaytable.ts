import {Paytable} from "../../videoslot/paytable/Paytable.js";

export class CascadingSlotPaytable extends Paytable {
    public getWinAmountForSymbol(symbolId: string, numberOfSymbols: number, bet: number): number {
        let rv = 0;
        if (
            this.paytableMap[bet] &&
            this.paytableMap[bet][symbolId]
        ) {
            const availableSymbolCount = Object.keys(this.paytableMap[bet][symbolId]);
            const highestSymbol = +availableSymbolCount[availableSymbolCount.length - 1];
            const numSymbols = Math.min(numberOfSymbols, highestSymbol);
            rv = this.paytableMap[bet][symbolId][numSymbols];
        }
        return rv;
    }
}