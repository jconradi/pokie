import {
    CascadingSlotSession,
    GameSessionSerializer,
    GameSessionSerializing,
} from "@jconradi/pokie";
import {CascadingSlotInitialNetworkData, CascadingSlotResultsNetworkData, CascadingSlotRoundNetworkData} from "./CascadingSlotNetworkData.js";

export class CascadingSlotSessionSerializer implements GameSessionSerializing {
    private readonly baseSerializer: GameSessionSerializing;

    constructor(baseSerializer: GameSessionSerializing = new GameSessionSerializer()) {
        this.baseSerializer = baseSerializer;
    }

    public getInitialData(session: CascadingSlotSession): CascadingSlotInitialNetworkData {
        const availableSymbols = session.getAvailableSymbols();
        const reelsNumber = session.getReelsNumber();
        const reelsSymbolsNumber = session.getReelsSymbolsNumber();
        const paytable = session.getPaytable().toMap();
        const linesDefinitions = {};
        session
            .getLinesDefinitions()
            .getLinesIds()
            .forEach((lineId) => {
                linesDefinitions[lineId] = session.getLinesDefinitions().getLineDefinition(lineId);
            });
        return {
            ...this.baseSerializer.getInitialData(session),
            ...this.getRoundData(session),
            availableSymbols,
            reelsNumber,
            reelsSymbolsNumber,
            paytable,
            linesDefinitions,
        };
    }

    public getRoundData(session: CascadingSlotSession): CascadingSlotRoundNetworkData {
        const results = session.getCascadingResults();
        const ret: CascadingSlotRoundNetworkData = {
            ...this.baseSerializer.getRoundData(session),
            cascadingResults: [],
            winAmount: session.getWinAmount()
        };

        for (const result of results) {
            const resultNetworkData: CascadingSlotResultsNetworkData = {
                winAmount: result.winAmount,
                nextReels: result.nextReels?.toMatrix() || [],
                leftoverSymbols: result.leftoverSymbols.toMatrix(),
                winningScatters: Object.values(result.winningScatters).reduce((acc, scatter) => {
                    return {
                        ...acc,
                        [scatter.getSymbolId()]: {
                            symbolId: scatter.getSymbolId(),
                            symbolsPositions: scatter.getSymbolsPositions(),
                            winAmount: scatter.getWinAmount(),
                        },
                    };
                }, {}),
                winningLines: Object.values(result.winningLines).reduce((acc, line) => {
                    return {
                        ...acc,
                        [line.getLineId()]: {
                            definition: line.getDefinition(),
                            pattern: line.getPattern(),
                            symbolId: line.getSymbolId(),
                            lineId: line.getLineId(),
                            symbolsPositions: line.getSymbolsPositions(),
                            wildSymbolsPositions: line.getWildSymbolsPositions(),
                            winAmount: line.getWinAmount(),
                        },
                    };
                }, {}),
                winningClusters: {},
            };

            for (const [symbolId, winningClusters] of Object.entries(result.winningClusters)) {
                if (!resultNetworkData.winningClusters[symbolId]) {
                    resultNetworkData.winningClusters[symbolId] = [];
                }

                for (const winningCluster of winningClusters) {
                    resultNetworkData.winningClusters[symbolId].push({
                        winAmount: winningCluster.getWinAmount(),
                        symbolsPositions: winningCluster.getSymbolsPositions(),
                        wildSymbolsPositions: winningCluster.getWildSymbolsPositions(),
                        symbolId: winningCluster.getSymbolId()
                    });
                }
            }

            ret.cascadingResults.push(resultNetworkData);
        }
       
        return ret;
    }
}
