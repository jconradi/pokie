import {
    CascadinglotWinCalculator, GameSession, GameSessionHandling,
    LinesDefinitionsDescribing, LinesPatternsDescribing, PaytableRepresenting,
    SymbolsCombination, SymbolsCombinationDescribing,
    SymbolsCombinationsGenerator, SymbolsSequenceDescribing, VideoSlotConfig, VideoSlotConfigDescribing, VideoSlotConfigRepresenting, WinningClusterDescribing, WinningLineDescribing, WinningScatterDescribing
} from "@jconradi/pokie";

export interface CascadingResult {
    winningLines: Record<string, WinningLineDescribing>;
    winningScatters: Record<string, WinningScatterDescribing>;
    winningClusters: Record<string, WinningClusterDescribing[]>;
    leftoverSymbols: SymbolsCombinationDescribing;
    nextReels: SymbolsCombinationDescribing | undefined;
    winAmount: number;
}

export class CascadingSlotSession implements VideoSlotConfigDescribing,
    GameSessionHandling {
    private readonly baseSession: GameSessionHandling;
    private readonly config: VideoSlotConfigRepresenting;
    private readonly combinationsGenerator: SymbolsCombinationsGenerator;
    private readonly winCalculator: CascadinglotWinCalculator;
    private winAmount = 0;
    private symbolsCombination: SymbolsCombinationDescribing = new SymbolsCombination();
    private initialSymbolsCombination: SymbolsCombinationDescribing = new SymbolsCombination();
    private cascadingResults: CascadingResult[] = [];
    private maximumWin = 1000;

    constructor(
        config: VideoSlotConfigRepresenting = new VideoSlotConfig(),
        combinationsGenerator: SymbolsCombinationsGenerator = new SymbolsCombinationsGenerator(config),
        winCalculator: CascadinglotWinCalculator = new CascadinglotWinCalculator(config),
        baseSession: GameSessionHandling = new GameSession(config),
    ) {
        this.config = config;
        this.combinationsGenerator = combinationsGenerator;
        this.winCalculator = winCalculator;
        this.baseSession = baseSession;
        this.symbolsCombination = this.combinationsGenerator.generateSymbolsCombination();
    }

    public getMaximumWin(): number {
        return this.maximumWin;
    }

    public setMaximumWin(amount: number) {
        this.maximumWin = amount;
    }

    public getInitialSymbolsCombination(): SymbolsCombinationDescribing {
        return this.initialSymbolsCombination;
    }

    public getCascadingResults(): CascadingResult[] {
        return [...this.cascadingResults];
    }

    public getPaytable(): PaytableRepresenting {
        return this.config.getPaytable();
    }

    public getSymbolsSequences(): SymbolsSequenceDescribing[] {
        return this.config.getSymbolsSequences();
    }

    public getReelsSymbolsNumber(): number {
        return this.config.getReelsSymbolsNumber();
    }

    public getReelsNumber(): number {
        return this.config.getReelsNumber();
    }

    public getAvailableSymbols(): string[] {
        return [...this.config.getAvailableSymbols()];
    }

    public getCreditsAmount(): number {
        return this.baseSession.getCreditsAmount();
    }

    public setCreditsAmount(creditsAmount: number): void {
        this.baseSession.setCreditsAmount(creditsAmount);
    }

    public getWinAmount(): number {
        return this.winAmount;
    }

    public getAvailableBets(): number[] {
        return [...this.config.getAvailableBets()];
    }

    public getBet(): number {
        return this.baseSession.getBet();
    }

    public setBet(bet: number): void {
        this.baseSession.setBet(bet);
    }

    public canPlayNextGame(): boolean {
        return this.baseSession.canPlayNextGame();
    }

    public play(): void {
        this.baseSession.play();
        this.initialSymbolsCombination = this.symbolsCombination = this.combinationsGenerator.generateSymbolsCombination();
        this.winAmount = 0;
        this.cascadingResults = [];
        
        let done = false;
        while (!done) {
            this.winCalculator.calculateWin(this.getBet(), this.symbolsCombination);

            this.cascadingResults.push({
                winningClusters: this.winCalculator.getWinningClusters(),
                winningLines: this.winCalculator.getWinningLines(),
                winningScatters: this.winCalculator.getWinningScatters(),
                leftoverSymbols: this.winCalculator.getLeftoverSymbols(),
                nextReels: undefined,
                winAmount: this.winCalculator.getWinAmount()
            });

            done = this.winCalculator.getIsDone();

            this.symbolsCombination = this.winCalculator.getLeftoverSymbols();

            const matrix = this.symbolsCombination.toMatrix(true);
            // Fill in empty symbols
            for (let col = 0; col < matrix.length; col++) {
                let row = 0;
                let hasReplacements = false;
                while (row < matrix[col].length && matrix[col][row] === CascadinglotWinCalculator.EmptyCell) {
                    row++;
                    hasReplacements = true;
                }


                if (!hasReplacements) {
                    continue;
                }

                const replacementAmount = row;

                // Make replacements
                const replacements = this.combinationsGenerator.generateNextSymbolCombination(col, replacementAmount);
                for (let i = 0; i < replacements.length; i++) {
                    matrix[col][i] = replacements[i];
                }
            }

            this.symbolsCombination = new SymbolsCombination().fromMatrix(matrix, true);
            this.cascadingResults[this.cascadingResults.length - 1].nextReels = this.symbolsCombination;

            this.winAmount += this.winCalculator.getWinAmount();
            if (this.winAmount >= this.getMaximumWin()) {
                this.winAmount = this.getMaximumWin();
                break;
            }
        }
        this.setCreditsAmount(this.getCreditsAmount() + this.winAmount);
        this.winCalculator.reset();
    }

    public isSymbolWild(symbolId: string): boolean {
        return this.config.isSymbolWild(symbolId);
    }

    public isSymbolScatter(symbolId: string): boolean {
        return this.config.isSymbolScatter(symbolId);
    }

    public getWildSymbols(): string[] {
        return this.config.getWildSymbols();
    }

    public getScatterSymbols(): string[] {
        return this.config.getScatterSymbols();
    }

    public getLinesDefinitions(): LinesDefinitionsDescribing {
        return this.config.getLinesDefinitions();
    }

    public getLinesPatterns(): LinesPatternsDescribing {
        return this.config.getLinesPatterns();
    }
}