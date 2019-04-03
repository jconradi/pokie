import {IReelGameSessionConfig} from "./IReelGameSessionConfig";
import {IReelGameSessionReelsController} from "./reelscontroller/IReelGameSessionReelsController";
import {IReelGameSessionWinCalculator} from "./wincalculator/IReelGameSessionWinCalculator";
import {IReelGameWithFreeGamesSession} from "./IReelGameWithFreeGamesSession";
import {IReelGameSession} from "./IReelGameSession";
import {ReelGameSession} from "./ReelGameSession";
import {IReelGameWithFreeGamesSessionConfig} from "./IReelGameWithFreeGamesSessionConfig";

export class ReelGameWithFreeGamesSession implements IReelGameWithFreeGamesSession {
    private readonly _config: IReelGameWithFreeGamesSessionConfig;
    private readonly _reelsController: IReelGameSessionReelsController;
    private readonly _winningCalculator: IReelGameSessionWinCalculator;
    private readonly _adaptee: IReelGameSession;

    private _freeGamesNum: number;
    private _freeGamesSum: number;
    private _freeBank: number;

    constructor(config: IReelGameWithFreeGamesSessionConfig, reelsController: IReelGameSessionReelsController, winningCalculator: IReelGameSessionWinCalculator) {
        this._config = config;
        this._reelsController = reelsController;
        this._winningCalculator = winningCalculator;
        this._adaptee = new ReelGameSession(this._config, reelsController, winningCalculator);
    }

    public getReelsItems(): string[][] {
        return this._adaptee.getReelsItems();
    }
    
    public getWinningLines(): {} {
        return this._winningCalculator.getWinningLines();
    }
    
    public getWinningScatters(): {} {
        return this._winningCalculator.getWinningScatters();
    }
    
    public getPaytable(): { [p: string]: { [p: number]: number } } {
        return this._config.paytable[this.getBet()];
    }
    
    public getReelsItemsSequences(): string[][] {
        return this._config.reelsItemsSequences;
    }
    
    public getReelsItemsNumber(): number {
        return this._config.reelsItemsNumber;
    }
    
    public getReelsNumber(): number {
        return this._config.reelsNumber;
    }

    public canPlayNextGame(): boolean {
        return this._adaptee.canPlayNextGame();
    }

    public getAvailableBets(): number[] {
        return this._config.availableBets;
    }

    public getBet(): number {
        return this._adaptee.getBet();
    }

    public getCreditsAmount(): number {
        return this._adaptee.getCreditsAmount();
    }

    public setCreditsAmount(value: number): void {
        this._adaptee.setCreditsAmount(value);
    }

    public getWinningAmount(): number {
        return this._adaptee.getWinningAmount();
    }

    public isBetAvailable(bet: number): boolean {
        return this._adaptee.isBetAvailable(bet);
    }

    public play(): void {
        let creditsBeforePlay: number;
        let wonFreeGames: number;
        if (this._freeGamesNum === this._freeGamesSum) {
            this._freeBank = 0;
            this._freeGamesNum = 0;
            this._freeGamesSum = 0;
        }
        creditsBeforePlay = this.getCreditsAmount();
        this._adaptee.play();
        if (this._freeGamesSum > 0 && this._freeGamesNum < this._freeGamesSum) {
            this._freeGamesNum++;
            this._freeBank += this.getWinningAmount();
            this.setCreditsAmount(creditsBeforePlay);
        }
        if (this._freeGamesSum > 0 && this._freeGamesNum === this._freeGamesSum) {
            this.setCreditsAmount(this.getCreditsAmount()+ this._freeBank);
        }
        wonFreeGames = this.getWonFreeGamesNumber();
        if (wonFreeGames) {
            this._freeGamesSum += wonFreeGames;
        }
    }

    public getWonFreeGamesNumber(): number {
        let rv: number;
        let scatterId: string;
        let scatterTimes: number;
        let i: string;
        let wonScatters: {};
        rv = 0;
        if (this._config.freeGamesForScatters) {
            wonScatters = this.getWinningScatters();
            for (i in wonScatters) {
                scatterId = wonScatters[i].itemId;
                scatterTimes = wonScatters[i].itemsPositions.length;
                if (this._config.freeGamesForScatters.hasOwnProperty(scatterId)) {
                    if (this._config.freeGamesForScatters[scatterId].hasOwnProperty(scatterTimes.toString())) {
                        rv = this._config.freeGamesForScatters[scatterId][scatterTimes];
                    }
                }
            }
        }
        return rv;
    }

    public setBet(bet: number): void {
        this._adaptee.setBet(bet);
    }

    public getFreeGameBank(): number {
        return this._freeBank;
    }

    public getFreeGameNum(): number {
        return this._freeGamesNum;
    }

    public getFreeGameSum(): number {
        return this._freeGamesSum;
    }
    
}
