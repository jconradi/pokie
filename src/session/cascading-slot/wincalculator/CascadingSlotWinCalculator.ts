import {
    SymbolsCombination,
    SymbolsCombinationDescribing,
    SymbolsCombinationsAnalyzer,
    VideoSlotConfigDescribing,
    VideoSlotWinCalculating,
    WinningCluster,
    WinningClusterDescribing,
    WinningLine,
    WinningLineDescribing,
    WinningScatter,
    WinningScatterDescribing,
} from "pokie";

export class CascadinglotWinCalculator implements VideoSlotWinCalculating {
    public static readonly EmptyCell: string = "";
    private isDone = false;

    private readonly config: VideoSlotConfigDescribing;

    private leftoverSymbols!: SymbolsCombinationDescribing;
    private symbolsCombination!: SymbolsCombinationDescribing;
    private winningLines: Record<string, WinningLine> = {};
    private winningScatters: Record<string, WinningScatter> = {};
    private winningClusters: Record<string, WinningCluster[]> = {};


    constructor(conf: VideoSlotConfigDescribing) {
        this.config = conf;
    }

    public reset() {
        this.isDone = false;
        this.winningScatters = {};
        this.winningLines = {};
        this.winningClusters = {};
    }

    public calculateWin(bet: number, symbolsCombination: SymbolsCombinationDescribing): void {
        if (this.config.getAvailableBets().some((availableBet) => availableBet === bet)) {
            this.symbolsCombination = symbolsCombination;
            const lineDefinitions = this.config.getLinesDefinitions();
            const hasLines = lineDefinitions.getLinesIds().length > 0;

            if (hasLines) {
                this.calculateWinningLines(bet); 
            } else {
                this.winningClusters = this.calculateWinningClusters(bet);
            }
            this.leftoverSymbols = this.applyGravity();

            if (this.getIsDone()) {
                this.winningScatters = this.generateWinningScatters(bet);
            }
        } else {
            throw new Error(`Bet ${bet} is not specified at paytable`);
        }
    }

    public getLeftoverSymbols(): SymbolsCombinationDescribing {
        return this.leftoverSymbols;
    }

    public getIsDone(): boolean {
        return this.isDone;
    }

    public getWinningLines(): Record<string, WinningLineDescribing> {
        return this.winningLines;
    }

    public getWinningScatters(): Record<string, WinningScatterDescribing> {
        return this.winningScatters;
    }

    public getWinningClusters(): Record<string, WinningClusterDescribing[]> {
        return this.winningClusters;
    }

    public getWinAmount(): number {
        return this.getLinesWinning() + this.getScattersWinning() + this.getClustersWinning();
    }

    public getLinesWinning(): number {
        return Object.values(this.getWinningLines()).reduce((sum, line) => sum + line.getWinAmount(), 0);
    }

    public getScattersWinning(): number {
        return Object.values(this.getWinningScatters()).reduce((sum, scatter) => sum + scatter.getWinAmount(), 0);
    }

    public getClustersWinning(): number {
        return Object.values(this.getWinningClusters())
            .reduce((sum, winningClusters) =>
                sum + winningClusters.reduce((prev, curr) => prev + curr.getWinAmount(), 0), 0);
    }

    private calculateWinningLines(bet: number) {
        this.isDone = true;
        let line: WinningLine;
        this.winningLines = {};
        const winningLinesIds = SymbolsCombinationsAnalyzer.getWinningLinesIds(
            this.symbolsCombination.toMatrix(),
            this.config.getLinesDefinitions(),
            this.config.getLinesPatterns().toArray(),
            this.config.getWildSymbols(),
        );
        const matrix = this.symbolsCombination.toMatrix(true);
        winningLinesIds.forEach((lineId) => {
            line = this.generateWinningLine(bet, lineId);
            if (
                !this.config.getScatterSymbols().some((scatter) => scatter === line.getSymbolId()) &&
                line.getWinAmount() > 0
            ) {
                this.isDone = false;
                this.winningLines[line.getLineId()] = line;
                const winningPattern = line.getPattern();
                for (let i = 0; i < line.getDefinition().length; i++) {
                    const col = line.getDefinition()[i];

                    if (winningPattern[i] !== 0) {
                        matrix[col][i] = CascadinglotWinCalculator.EmptyCell;
                    }
                }
            }
        });

        this.leftoverSymbols = new SymbolsCombination().fromMatrix(matrix, true);

    }

    private generateWinningLine(bet: number, lineId: string): WinningLine {
        const definition = this.config.getLinesDefinitions().getLineDefinition(lineId);
        const symbolsLine = SymbolsCombinationsAnalyzer.getSymbolsForDefinition(
            this.symbolsCombination.toMatrix(),
            definition,
        );
        const pattern = SymbolsCombinationsAnalyzer.getMatchingPattern(
            symbolsLine,
            this.config.getLinesPatterns().toArray(),
            this.config.getWildSymbols(),
        )!;
        const symbolsPositions = pattern.reduce((acc: number[], value: number, index: number) => {
            if (value === 1) {
                acc.push(index);
            }
            return acc;
        }, []);
        const symbolId = SymbolsCombinationsAnalyzer.getWinningSymbolId(
            symbolsLine,
            pattern,
            this.config.getWildSymbols(),
        )!;
        const wildSymbolsPositions = SymbolsCombinationsAnalyzer.getWildSymbolsPositions(
            symbolsLine,
            pattern,
            this.config.getWildSymbols(),
        );
        const winAmount = this.getWinAmountForSymbol(bet, symbolId, symbolsPositions.length);
        return new WinningLine(
            winAmount,
            definition,
            pattern,
            lineId,
            symbolsPositions,
            wildSymbolsPositions,
            symbolId,
        );
    }

    private getWinAmountForSymbol(bet: number, symbolId: string, numOfWinningSymbols: number): number {
        return this.config.getPaytable().getWinAmountForSymbol(symbolId, numOfWinningSymbols, bet);
    }

    private generateWinningScatters(bet: number): Record<string, WinningScatter> {
        const rv: Record<string, WinningScatter> = {};
        if (this.config.getScatterSymbols() !== null) {
            for (const scatter of this.config.getScatterSymbols()) {
                const curScatterSymbolId = scatter;
                const curScatterSymbolsPositions = this.getScatterSymbolsPositions(curScatterSymbolId);
                const winAmount = this.getWinAmountForSymbol(
                    bet,
                    curScatterSymbolId,
                    curScatterSymbolsPositions.length,
                );
                if (winAmount > 0) {
                    rv[curScatterSymbolId] = new WinningScatter(
                        curScatterSymbolId,
                        curScatterSymbolsPositions,
                        winAmount,
                    );
                }
            }
        }
        return rv;
    }

    private getScatterSymbolsPositions(symbolId: string): number[][] {
        return SymbolsCombinationsAnalyzer.getScatterSymbolsPositions(this.symbolsCombination.toMatrix(), symbolId);
    }

    private floodFill(symbol: string, row: number, col: number, visited: Set<string>, wildsVisited: Set<string>, group: [number, number][]) {
        if (col < 0 || col >= this.config.getReelsNumber()) {
            return;
        }
        if (row < 0 || row >= this.config.getReelsSymbolsNumber()) {
            return;
        }

        const currSymbol = this.symbolsCombination.toMatrix(true)[row][col];

        if (currSymbol !== symbol && !this.config.isSymbolWild(currSymbol)) {
            return;
        }

        const key = `${row}x${col}`;
        if (visited.has(key)) {
            return;
        }
        visited.add(key);
        if (this.config.isSymbolWild(currSymbol)) {
            wildsVisited.add(key);
        }

        group.push([row, col]);

        this.floodFill(symbol, row + 1, col, visited, wildsVisited, group);
        this.floodFill(symbol, row - 1, col, visited, wildsVisited, group);
        this.floodFill(symbol, row, col + 1, visited, wildsVisited, group);
        this.floodFill(symbol, row, col - 1, visited, wildsVisited, group);

    }

    private calculateWinningClusters(bet: number): Record<string, WinningCluster[]> {
        const winningClusters: Record<string, WinningCluster[]> = {};
        // Symbols combination is randomly generated in COLUMN-echelon form.
        // Convert to row echelon to make calculations eaiser.
        const matrix = [...this.symbolsCombination.toMatrix(true)];
        this.isDone = true;

        const visited = new Set<string>();
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                const symbol = matrix[row][col];

                // Don't consider scatters
                // Don't consider wilds because they will be resolved via other symbols
                if (this.config.isSymbolScatter(symbol) || this.config.isSymbolWild(symbol)) {
                    continue;
                }

                const group: [number, number][] = [];
                const wildsVisited = new Set<string>();
                this.floodFill(symbol, row, col, visited, wildsVisited, group);

                // Remove the wilds to be used again from visited space
                wildsVisited.forEach(wildKey => visited.delete(wildKey));

                if (group.length > 0) {
                    const amount = this.config.getPaytable().getWinAmountForSymbol(symbol, group.length, bet);

                    if (amount > 0) {
                        this.isDone = false;

                        if (winningClusters[symbol] === undefined) {
                            winningClusters[symbol] = [];
                        }

                        winningClusters[symbol].push(new WinningCluster(amount, group, [], symbol));
                        // Mark spots for deletion
                        for (const [cellRow, cellCol] of group) {
                            matrix[cellRow][cellCol] = CascadinglotWinCalculator.EmptyCell;
                        }
                    }
                }
            }
        }

        this.leftoverSymbols = new SymbolsCombination().fromMatrix(matrix);

        return winningClusters;
    }

    private applyGravity() {
        const matrix = [...this.leftoverSymbols.toMatrix()];

        for (let col = 0; col < matrix[0].length; col++) {
            for (let row = matrix.length - 1; row >= 0; row--) {
                const symbol = matrix[row][col];

                if (symbol === CascadinglotWinCalculator.EmptyCell) {
                    // Search for next symbol
                    for (let k = row - 1; k >= 0; k--) {
                        const nextSymbol = matrix[k][col];

                        if (nextSymbol !== CascadinglotWinCalculator.EmptyCell) {
                            matrix[row][col] = nextSymbol;
                            matrix[k][col] = CascadinglotWinCalculator.EmptyCell;
                            break;
                        }
                    }
                }
            }
        }

        return new SymbolsCombination().fromMatrix(matrix);
    }
}
