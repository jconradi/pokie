import {IGameSessionSimulationConfig} from "./IGameSessionSimulationConfig";
import {IGameSessionSimulation} from "./IGameSessionSimulation";
import {IGameSession} from "..";
import {GameSimulationChangeBetScenario} from "./GameSimulationChangeBetScenario";

export class GameSessionSimulation implements IGameSessionSimulation {
    private readonly _config: IGameSessionSimulationConfig;
    private readonly _session: IGameSession;
    private readonly _numberOfRounds: number;
    private readonly _changeBetScenario: GameSimulationChangeBetScenario;

    public beforePlayCallback: () => void;
    public afterPlayCallback: () => void;
    public onFinishedCallback: () => void;
    
    private _totalBet: number;
    private _totalReturn: number;
    private _rtp: number;
    
    private _currentGameNumber: number;
    
    constructor(config: IGameSessionSimulationConfig) {
        this._config = config;
        this._totalBet = 0;
        this._totalReturn = 0;
        this._currentGameNumber = 0;
        this._session = this._config.session;
        this._numberOfRounds = this._config.numberOfRounds;
        this._changeBetScenario = this._config.changeBetScenario;
        if (!this._changeBetScenario) {
            this._changeBetScenario = GameSimulationChangeBetScenario.DontChange;
        }
        if (!this._numberOfRounds) {
            this._numberOfRounds = 1000;
        }
    }
    
    public run(): void {
        let i: number;
        for (i = 0; i < this._numberOfRounds; i++) {
            this.doBeforePlay();
            if (this.canPlayNextGame()) {
                this.doPlay();
            } else {
                this.setBetOnCantPlayNextBet();
                if (this.canPlayNextGame()) {
                    this.doPlay();
                } else {
                    break;
                }
            }
        }
        this.onFinished();
    }
    
    private setBetOnCantPlayNextBet(): void {
        let bets: number[];
        bets = this._session.getAvailableBets();
        bets.sort();
        this._session.setBet(bets[0]);
    }
    
    private onFinished(): void {
        if (this.onFinishedCallback) {
            this.onFinishedCallback();
        }
    }
    
    private canPlayNextGame(): boolean {
        return this._session.canPlayNextGame();
    }
    
    private setBetBeforePlay(): void {
        switch (this._changeBetScenario) {
            case GameSimulationChangeBetScenario.ChangeRandomly:
                this.setRandomBet();
                break;
            default:
        }
    }
    
    private setRandomBet(): void {
        let bet: number;
        let bets: number[];
        bets = this._session.getAvailableBets();
        bet = bets[Math.floor(Math.random() * bets.length)];
        this._session.setBet(bet);
    }
    
    private doPlay(): void {
        this._currentGameNumber++;
        this.setBetBeforePlay();
        this._totalBet += this._session.getBet();
        this._session.play();
        this._totalReturn += this._session.getWinningAmount();
        this.calculateRtp();
        this.doAfterPlay();
    }
    
    private doBeforePlay(): void {
        if (this.beforePlayCallback) {
            this.beforePlayCallback();
        }
    }
    
    private doAfterPlay(): void {
        if (this.afterPlayCallback) {
            this.afterPlayCallback();
        }
    }
    
    private calculateRtp(): void {
        this._rtp = this._totalReturn / this._totalBet;
    }
    
    public getRtp(): number {
        return this._rtp;
    }
    
    public getTotalBetAmount(): number {
        return this._totalBet;
    }
    
    public getTotalReturn(): number {
        return this._totalReturn;
    }
    
    public getCurrentGameNumber(): number {
        return this._currentGameNumber;
    }

    public getTotalGameToPlayNumber(): number {
        return this._numberOfRounds;
    }
    
}