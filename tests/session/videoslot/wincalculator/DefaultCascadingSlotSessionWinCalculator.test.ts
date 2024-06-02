import {VideoSlotConfig, SymbolsCombinationsGenerator, CascadinglotWinCalculator, SymbolsCombination, CascadingSlotPaytable, CascadingSlotSession, CustomLinesDefinitions, SymbolsSequence} from "pokie";

describe("DefaultCascadingSlotSessionWinCalculator - Cluster Tests", () => {
    const config = new VideoSlotConfig();
    config.setLinesDefinitions(new CustomLinesDefinitions());
    const regularSymbols = ['CircleCandy', 'HeartCandy', 'BeanCandy', 'StarCandy'];
    const scatterSymbols = ['Scatter1'];
    const wildSymbols = ['Wild'];
    config.setAvailableSymbols([...regularSymbols, ...scatterSymbols, ...wildSymbols]);
    config.setScatterSymbols(scatterSymbols);
    config.setWildSymbols(wildSymbols);

    const sequences: SymbolsSequence[] = [];
    for (let i = 0; i < config.getReelsNumber(); i++) {
        const sequence = new SymbolsSequence();

        sequence.fromNumbersOfSymbols({
            CircleCandy: 20,
            HeartCandy: 20,
            BeanCandy: 20,
            StarCandy: 20,
            Wild: 5,
            Scatter1: 2,
        });

        /*
        The sequence we've just created will contain the stacks of the size of the number of every symbol we've provided.
        We need to shuffle it to have symbols distributed randomly on the sequence.
        */
        sequence.shuffle();

        /*
        Once we have the properly built sequence, we save it for the current reel.
        */
        sequences.push(sequence);
    }
    config.setSymbolsSequences(sequences);


    const winCalculator = new CascadinglotWinCalculator(config);
    const paytable = new CascadingSlotPaytable(config.getAvailableBets(), config.getAvailableSymbols(), 
        config.getWildSymbols());
    
    paytable.setPayoutForSymbol('CircleCandy', 5, 1);
    paytable.setPayoutForSymbol('CircleCandy', 6, 2);
    paytable.setPayoutForSymbol('CircleCandy', 7, 3);
    paytable.setPayoutForSymbol('HeartCandy', 5, 1.5);
    paytable.setPayoutForSymbol('HeartCandy', 6, 2);
    paytable.setPayoutForSymbol('BeanCandy', 5, 3);
    paytable.setPayoutForSymbol('StarCandy', 5, 4);
    paytable.setPayoutForSymbol("Scatter1", 3, 10);
    paytable.setPayoutForSymbol("Scatter1", 4, 20);

    config.setPaytable(paytable);

    const testLeftoverClusterReel = (symbols: string[], expectedEmpty: number) => {
        for (let i = 0; i < expectedEmpty; i++) {
            expect(symbols[i]).toBe(CascadinglotWinCalculator.EmptyCell);
        }
        for (let i = expectedEmpty; i < symbols.length; i++) {
            expect(symbols[i]).not.toBe(CascadinglotWinCalculator.EmptyCell);
        }
    };
    
    test('winningClustersWithSameSymbols', () => {
        config.getAvailableBets().forEach((bet) => {
            config.getAvailableSymbols().forEach(symbol => {
                if (!config.isSymbolWild(symbol) && !config.isSymbolScatter(symbol)) {
                    winCalculator.calculateWin(bet, new SymbolsCombination().fromMatrix(
                        [
                            [symbol, symbol, symbol, symbol, symbol],
                            [symbol, symbol, symbol, symbol, symbol],
                            [symbol, symbol, symbol, symbol, symbol],
                        ],
                        true
                    ));

                    const leftoverSymbols = winCalculator.getLeftoverSymbols().toMatrix(true);

                    expect(Object.keys(winCalculator.getWinningClusters())).toHaveLength(1);
                    expect(winCalculator.getWinningClusters()[symbol]).toHaveLength(1);
                    expect(winCalculator.getWinningClusters()[symbol][0].getSymbolsPositions()).toHaveLength(15);
                    expect(winCalculator.getIsDone()).toBe(false);

                    for (let i = 0; i < leftoverSymbols.length; i++) {
                        testLeftoverClusterReel(leftoverSymbols[i], 3);       
                    }
                }

            });
        });
    });

    test('winningClustersWithSameSymbols', () => {
        const [symbol1, symbol2] = regularSymbols;

        config.getAvailableBets().forEach((bet) => {
            winCalculator.calculateWin(bet, new SymbolsCombination().fromMatrix(
                [
                    [symbol1, symbol1, symbol2, symbol1, symbol1],
                    [symbol1, symbol1, symbol2, symbol2, symbol1],
                    [symbol1, symbol2, symbol1, symbol1, symbol2],
                ],
                true
            ));

            const leftoverSymbols = winCalculator.getLeftoverSymbols().toMatrix(true);

            expect(Object.keys(winCalculator.getWinningClusters())).toHaveLength(1);
            expect(winCalculator.getWinningClusters()[symbol1]).toHaveLength(1);
            expect(winCalculator.getWinningClusters()[symbol1][0].getSymbolsPositions()).toHaveLength(5);
            expect(winCalculator.getIsDone()).toBe(false);

            testLeftoverClusterReel(leftoverSymbols[0], 3);
            testLeftoverClusterReel(leftoverSymbols[1], 2);
            testLeftoverClusterReel(leftoverSymbols[2], 0);
            testLeftoverClusterReel(leftoverSymbols[3], 0);
            testLeftoverClusterReel(leftoverSymbols[4], 0);
        });
    });

    test('playWithClustersHit', () => {
        const [symbol1, symbol2, symbol3] = regularSymbols;
        const generator = new SymbolsCombinationsGenerator(config);
        jest.spyOn(generator, 'generateSymbolsCombination').mockImplementation(() => {
            return new SymbolsCombination().fromMatrix([
                [symbol1, symbol1, symbol1, symbol1, symbol1],
                [symbol3, symbol3, symbol2, symbol2, symbol3],
                [symbol2, symbol2, symbol3, symbol3, symbol2],
            ], true);       
        });
        const nextSymbolsSpy = jest.spyOn(generator, 'generateNextSymbolCombination').mockImplementation((reelId: number, symbols: number) => {
            switch (reelId) {
                case 0:
                case 2:
                    return [symbol1, symbol2, symbol3, symbol2, symbol1].slice(0, symbols);
                case 1:
                case 3:
                    return [symbol2, symbol1, symbol1, symbol2, symbol3].slice(0, symbols);
                case 4:
                default:
                    return [symbol3, symbol3, symbol1, symbol2, symbol2].slice(0, symbols);

            }
        });
        const session = new CascadingSlotSession(config, generator, winCalculator);

        session.play();

        expect(nextSymbolsSpy).toBeCalledTimes(5);
        expect(session.getWinAmount()).toBe(1);
        expect(session.getCascadingResults()).toHaveLength(2);
        expect(session.getCascadingResults()[0].winAmount).toBe(1);
        expect(session.getCascadingResults()[1].winAmount).toBe(0);
    });

    test('playWithClustersAndScattersHit - Scatters awarded on last spin', () => {
        const [symbol1, symbol2, symbol3] = regularSymbols;
        const [scatter1] = scatterSymbols;
        const generator = new SymbolsCombinationsGenerator(config);
        jest.spyOn(generator, 'generateSymbolsCombination').mockImplementation(() => {
            return new SymbolsCombination().fromMatrix([
                [symbol1, symbol1, symbol1, symbol1, symbol1],
                [symbol3, symbol3, symbol2, symbol2, symbol3],
                [symbol2, symbol2, scatter1, scatter1, scatter1],
            ], true);       
        });
        const nextSymbolsSpy = jest.spyOn(generator, 'generateNextSymbolCombination').mockImplementation((reelId: number, symbols: number) => {
            switch (reelId) {
                case 0:
                case 2:
                    return [symbol1, symbol2, symbol3, symbol2, symbol1].slice(0, symbols);
                case 1:
                case 3:
                    return [symbol2, symbol1, symbol1, symbol2, symbol3].slice(0, symbols);
                case 4:
                default:
                    return [symbol3, symbol3, symbol1, symbol2, symbol2].slice(0, symbols);

            }
        });
        const session = new CascadingSlotSession(config, generator, winCalculator);

        session.play();

        expect(nextSymbolsSpy).toBeCalledTimes(5);
        expect(session.getWinAmount()).toBe(11);
        expect(session.getCascadingResults()).toHaveLength(2);
        expect(session.getCascadingResults()[0].winAmount).toBe(1);
        expect(session.getCascadingResults()[1].winAmount).toBe(10);
    });

    test('playWithClustersAndWilds - Wilds awarded to all clusters touching wild', () => {
        const [symbol1, symbol2, symbol3] = regularSymbols;
        const [scatter1] = scatterSymbols;
        const [wild] = wildSymbols;
        const generator = new SymbolsCombinationsGenerator(config);
        jest.spyOn(generator, 'generateSymbolsCombination').mockImplementation(() => {
            return new SymbolsCombination().fromMatrix([
                [symbol1, symbol1, symbol1, symbol1, symbol1],
                [symbol3, symbol2, symbol2, symbol2, wild],
                [symbol2, symbol2, scatter1, scatter1, scatter1],
            ], true);       
        });
        const nextSymbolsSpy = jest.spyOn(generator, 'generateNextSymbolCombination').mockImplementation((reelId: number, symbols: number) => {
            switch (reelId) {
                case 0:
                case 2:
                    return [symbol1, symbol2, symbol3, symbol2, symbol1].slice(0, symbols);
                case 1:
                case 3:
                    return [symbol2, symbol1, symbol1, symbol2, symbol3].slice(0, symbols);
                case 4:
                default:
                    return [symbol3, symbol3, symbol1, symbol2, symbol2].slice(0, symbols);

            }
        });
        const session = new CascadingSlotSession(config, generator, winCalculator);

        session.play();

        expect(nextSymbolsSpy).toBeCalledTimes(5);
        expect(session.getWinAmount()).toBe(14);
        expect(session.getCascadingResults()).toHaveLength(2);
        expect(session.getCascadingResults()[0].winAmount).toBe(4);
        expect(session.getCascadingResults()[1].winAmount).toBe(10);
    });

    test('playWithClustersAndWilds - Multiple touching wilds eventually end calculating', () => {
        const [symbol1, symbol2, symbol3] = regularSymbols;
        const [scatter1] = scatterSymbols;
        const [wild] = wildSymbols;
        const generator = new SymbolsCombinationsGenerator(config);
        jest.spyOn(generator, 'generateSymbolsCombination').mockImplementation(() => {
            return new SymbolsCombination().fromMatrix([
                [scatter1, symbol1, symbol1, wild, wild],
                [scatter1, symbol1, symbol1, symbol1, symbol2],
                [scatter1, symbol3, scatter1, symbol2, symbol1],
            ], true);       
        });
        const nextSymbolsSpy = jest.spyOn(generator, 'generateNextSymbolCombination').mockImplementation((reelId: number, symbols: number) => {
            switch (reelId) {
                case 0:
                case 2:
                    return [symbol1, symbol2, symbol3, symbol2, symbol1].slice(0, symbols);
                case 1:
                case 3:
                    return [symbol2, symbol1, symbol1, symbol2, symbol3].slice(0, symbols);
                case 4:
                default:
                    return [symbol3, symbol3, symbol1, symbol2, symbol2].slice(0, symbols);

            }
        });

        const session = new CascadingSlotSession(config, generator, winCalculator);

        session.play();

        expect(nextSymbolsSpy).toBeCalledTimes(4);
        expect(session.getWinAmount()).toBe(23);
        expect(session.getCascadingResults()).toHaveLength(2);
        expect(session.getCascadingResults()[0].winningClusters[symbol1][0].getSymbolsPositions()).toHaveLength(7);
        expect(session.getCascadingResults()[0].winAmount).toBe(3);
        expect(session.getCascadingResults()[1].winAmount).toBe(20);
    });

    test('playWithClustersDroppedIn - Scatters awarded once at end for total scatters', () => {
        const [symbol1, symbol2, symbol3] = regularSymbols;
        const [scatter1] = scatterSymbols;
        const generator = new SymbolsCombinationsGenerator(config);
        jest.spyOn(generator, 'generateSymbolsCombination').mockImplementation(() => {
            return new SymbolsCombination().fromMatrix([
                [symbol1, symbol1, symbol1, symbol1, symbol1],
                [symbol3, symbol3, symbol2, symbol2, symbol3],
                [symbol2, symbol2, scatter1, scatter1, scatter1],
            ], true);       
        });
        const nextSymbolsSpy = jest.spyOn(generator, 'generateNextSymbolCombination').mockImplementation((reelId: number, symbols: number) => {
            switch (reelId) {
                case 0:
                case 2:
                    return [scatter1, symbol2, symbol3, symbol2, symbol1].slice(0, symbols);
                case 1:
                case 3:
                    return [symbol2, symbol1, symbol1, symbol2, symbol3].slice(0, symbols);
                case 4:
                default:
                    return [symbol3, symbol3, symbol1, symbol2, symbol2].slice(0, symbols);

            }
        });
        const session = new CascadingSlotSession(config, generator, winCalculator);

        session.play();

        expect(nextSymbolsSpy).toBeCalledTimes(5);
        expect(session.getWinAmount()).toBe(21);
        expect(session.getCascadingResults()).toHaveLength(2);
        expect(session.getCascadingResults()[0].winAmount).toBe(1);
        expect(session.getCascadingResults()[1].winAmount).toBe(20);
    });
});

describe("DefaultCascadingSlotSessionWinCalculator - Line Tests", () => {
    const config = new VideoSlotConfig();
    const regularSymbols = ['CircleCandy', 'HeartCandy', 'BeanCandy', 'StarCandy'];
    const scatterSymbols = ['Scatter1'];
    const wildSymbols = ['Wild'];
    config.setAvailableSymbols([...regularSymbols, ...scatterSymbols, ...wildSymbols]);
    config.setScatterSymbols(scatterSymbols);
    config.setWildSymbols(wildSymbols);
    const winCalculator = new CascadinglotWinCalculator(config);
    const paytable = new CascadingSlotPaytable(config.getAvailableBets(), config.getAvailableSymbols(), 
        config.getWildSymbols());
    
    paytable.setPayoutForSymbol('CircleCandy', 3, 1);
    paytable.setPayoutForSymbol('HeartCandy', 3, 2);
    paytable.setPayoutForSymbol('BeanCandy', 3, 3);
    paytable.setPayoutForSymbol('StarCandy', 3, 4);
    paytable.setPayoutForSymbol("Scatter1", 3, 10);
    paytable.setPayoutForSymbol("Scatter1", 4, 20);

    config.setPaytable(paytable);

    test('playWithClusters - Lines are awarded', () => {
        const [symbol1, symbol2, symbol3] = regularSymbols;
        const [scatter1] = scatterSymbols;
        const generator = new SymbolsCombinationsGenerator(config);
        jest.spyOn(generator, 'generateSymbolsCombination').mockImplementation(() => {
            return new SymbolsCombination().fromMatrix([
                [symbol1, symbol1, symbol1, symbol2, symbol3],
                [symbol3, symbol3, symbol2, symbol2, symbol3],
                [symbol2, symbol2, scatter1, scatter1, scatter1],
            ], true);       
        });
        const nextSymbolsSpy = jest.spyOn(generator, 'generateNextSymbolCombination').mockImplementation((reelId: number, symbols: number) => {
            switch (reelId) {
                case 0:
                case 2:
                    return [scatter1, symbol2, symbol3, symbol2, symbol1].slice(0, symbols);
                case 1:
                case 3:
                    return [symbol2, symbol1, symbol1, symbol2, symbol3].slice(0, symbols);
                case 4:
                default:
                    return [symbol3, symbol3, symbol1, symbol2, symbol2].slice(0, symbols);

            }
        });
        const session = new CascadingSlotSession(config, generator, winCalculator);

        session.play();

        expect(nextSymbolsSpy).toBeCalledWith(0, 3);
        expect(nextSymbolsSpy).toBeCalledTimes(1);
        expect(session.getWinAmount()).toBe(21);
        expect(session.getCascadingResults()).toHaveLength(2);
        expect(session.getCascadingResults()[0].winAmount).toBe(1);
        expect(session.getCascadingResults()[1].winAmount).toBe(20);
        expect(Object.keys(session.getCascadingResults()[0].winningLines)).toHaveLength(1);
        expect(session.getCascadingResults()[0].winningLines[1]).toBeDefined();
        expect(Object.keys(session.getCascadingResults()[1].winningScatters)).toHaveLength(1);
        expect(session.getCascadingResults()[1].winningScatters['Scatter1']).toBeDefined();

    });

});