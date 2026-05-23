import { Item } from '../entities/Item';
import { Gold, Rock, Diamond, TNTBarrel, MysteryBag, BrassGold } from '../entities/StaticItems';
import { Pig } from '../entities/Pig';
import { AncientKey, SealedChest, Gopher } from '../entities/SpecialEntities';
import { GameManager } from './GameManager';
import { BonusMission } from './MissionManager';
import { BALANCE } from './BalanceConfig';

export class LevelGenerator {
    /**
     * Generates all items for the given level, themed selection, and active mission constraints.
     */
    public static generateLevelItems(
        level: number,
        levelType: string,
        levelDelta: number,
        gameManager: GameManager,
        activeMission: BonusMission | null
    ): Item[] {
        const items: Item[] = [];

        // Procedural generator positioning bounds with minimal overlap control.
        const usedPositions: Array<{ x: number; y: number }> = [];
        const randPos = (riskBand: 'top' | 'mid' | 'deep' = 'mid') => {
            for (let attempt = 0; attempt < BALANCE.spawnAttempts; attempt++) {
                let yBase = 250;
                let yRange = 560;
                if (riskBand === 'top') { yBase = 250; yRange = 180; }
                if (riskBand === 'mid') { yBase = 370; yRange = 220; }
                if (riskBand === 'deep') { yBase = 560; yRange = 250; }
                const candidate = {
                    x: 80 + Math.random() * 1040,
                    y: yBase + Math.random() * yRange
                };
                const ok = usedPositions.every(p => {
                    const dx = p.x - candidate.x;
                    const dy = p.y - candidate.y;
                    return (dx * dx + dy * dy) >= BALANCE.spawnMinDistance * BALANCE.spawnMinDistance;
                });
                if (ok) {
                    usedPositions.push(candidate);
                    return candidate;
                }
            }
            const fallback = {
                x: 80 + Math.random() * 1040,
                y: 250 + Math.random() * 560
            };
            usedPositions.push(fallback);
            return fallback;
        };

        // Spawn Helpers
        const addGold = (size: 'large' | 'medium' | 'small'): number => {
            const band = size === 'large' ? 'deep' : size === 'small' ? 'top' : 'mid';
            const p = randPos(band);
            const gold = new Gold(p.x, p.y, size);
            items.push(gold);
            return gold.value;
        };

        const addRock = (size: 'large' | 'small'): number => {
            const p = randPos(size === 'large' ? 'deep' : 'mid');
            const rock = new Rock(p.x, p.y, size);
            items.push(rock);
            return rock.value;
        };

        const addDiamond = (): number => {
            const p = randPos('deep');
            const dia = new Diamond(p.x, p.y);
            items.push(dia);
            return dia.value;
        };

        const addPig = (hasDiamond: boolean = false, hasTNT: boolean = false, hasMystery: boolean = false): number => {
            const p = randPos(hasDiamond ? 'deep' : 'mid');
            const pig = new Pig(p.x, p.y, hasDiamond, hasTNT, hasMystery);
            items.push(pig);
            return pig.value;
        };

        const addTNT = (): number => {
            const p = randPos('deep');
            const tnt = new TNTBarrel(p.x, p.y);
            items.push(tnt);
            return 0;
        };

        let placedValue = 0;

        // Spawn budget calculation: target field value ≈ 1.7x levelDelta
        const spawnBudget = Math.round(levelDelta * BALANCE.levelFieldValueTargetRatio * gameManager.levelDirectorFactor);

        switch (levelType) {
            case 'gold_rush': {
                let budget = spawnBudget;
                const maxLarge = 2 + Math.floor(level / 2);
                const maxMedium = 2 + Math.floor(level * 0.7);
                let countLarge = 0, countMedium = 0;
                while (budget >= 550 && countLarge < Math.min(maxLarge, 10)) {
                    placedValue += addGold('large');
                    budget -= 550;
                    countLarge++;
                }
                while (budget >= 220 && countMedium < Math.min(maxMedium, 10)) {
                    placedValue += addGold('medium');
                    budget -= 220;
                    countMedium++;
                }
                for (let i = 0; i < Math.min(4, Math.floor(budget / 75)); i++) {
                    placedValue += addGold('small');
                }
                break;
            }
            case 'diamond_mine': {
                const numDiamonds = Math.min(5, 2 + Math.floor(level / 4));
                for (let i = 0; i < numDiamonds; i++) {
                    placedValue += addDiamond();
                }
                let dBudget = spawnBudget - numDiamonds * 800;
                if (dBudget > 0) {
                    const numMed = Math.min(5, Math.floor(dBudget / 220));
                    for (let i = 0; i < numMed; i++) {
                        placedValue += addGold('medium');
                        dBudget -= 220;
                    }
                    const numSm = Math.min(3, Math.floor(dBudget / 75));
                    for (let i = 0; i < numSm; i++) {
                        placedValue += addGold('small');
                    }
                }
                break;
            }
            case 'mystery_box': {
                const numMystery = Math.min(7, 2 + Math.floor(level / 3));
                for (let i = 0; i < numMystery; i++) {
                    const p = randPos();
                    items.push(new MysteryBag(p.x, p.y));
                    placedValue += 200; // estimated budget cost
                }
                let mBudget = spawnBudget - numMystery * 200;
                if (mBudget > 0) {
                    const numMed = Math.min(4, Math.floor(mBudget / 220));
                    for (let i = 0; i < numMed; i++) {
                        placedValue += addGold('medium');
                    }
                }
                break;
            }
            case 'pig_parade': {
                const numPigs = Math.min(10, 4 + Math.floor(level / 3));
                for (let i = 0; i < numPigs; i++) {
                    const rnd = Math.random();
                    const hasDiamond = rnd < 0.15;
                    const hasMystery = !hasDiamond && rnd < 0.30;
                    placedValue += addPig(hasDiamond, false, hasMystery);
                }
                for (let i = 0; i < 2; i++) {
                    placedValue += addGold('medium');
                }
                break;
            }
            case 'treasure_vault': {
                const numD = Math.min(5, 2 + Math.floor(level / 4));
                for (let i = 0; i < numD; i++) {
                    placedValue += addDiamond();
                }
                let vBudget = spawnBudget - numD * 800;
                const numLarge = Math.min(4, Math.max(1, Math.floor(vBudget / 550)));
                for (let i = 0; i < numLarge; i++) {
                    placedValue += addGold('large');
                }
                break;
            }
            case 'minefield': {
                const numTNT = Math.min(12, 5 + Math.floor(level / 3));
                for (let i = 0; i < numTNT; i++) {
                    addTNT();
                }
                placedValue += addDiamond();
                placedValue += addDiamond();
                placedValue += addGold('large');
                placedValue += addGold('large');
                let mfBudget = spawnBudget - 800 * 2 - 550 * 2;
                if (mfBudget > 0) {
                    const numMed = Math.min(4, Math.floor(mfBudget / 220));
                    for (let i = 0; i < numMed; i++) {
                        placedValue += addGold('medium');
                    }
                }
                break;
            }
            case 'fossil_dig': {
                const numRocks = Math.min(14, 5 + Math.floor(level / 2));
                for (let i = 0; i < numRocks; i++) {
                    placedValue += addRock(Math.random() > 0.5 ? 'large' : 'small');
                }
                const keyPos = randPos();
                items.push(new AncientKey(keyPos.x, keyPos.y));
                const chestPos = randPos();
                items.push(new SealedChest(chestPos.x, chestPos.y));
                placedValue += 1500;
                placedValue += addGold('large');
                if (level >= 3) {
                    placedValue += addDiamond();
                }
                break;
            }
            case 'tiny_treasures': {
                let ttBudget = spawnBudget;
                const numD = Math.min(4, Math.max(1, Math.floor(level / 4)));
                for (let i = 0; i < numD; i++) {
                    placedValue += addDiamond();
                    ttBudget -= 800;
                }
                const numSm = Math.min(14, Math.max(4, Math.floor(ttBudget / 75)));
                for (let i = 0; i < numSm; i++) {
                    placedValue += addGold('small');
                    ttBudget -= 75;
                }
                const gopherPos = randPos();
                items.push(new Gopher(gopherPos.x, gopherPos.y));
                placedValue += 800;
                break;
            }
            case 'tnt_gauntlet': {
                const numTNT = Math.min(10, 3 + Math.floor(level / 3));
                for (let i = 0; i < numTNT; i++) {
                    addTNT();
                }
                let tgBudget = spawnBudget;
                const numLg = Math.min(6, Math.floor((tgBudget * 0.55) / 550));
                for (let i = 0; i < numLg; i++) {
                    placedValue += addGold('large');
                    tgBudget -= 550;
                }
                const numMd = Math.min(6, Math.floor((tgBudget * 0.7) / 220));
                for (let i = 0; i < numMd; i++) {
                    placedValue += addGold('medium');
                }
                break;
            }
            default: { // normal level
                let budget = spawnBudget;
                const diamondChance = Math.min(0.85, 0.10 * level);
                if (Math.random() < diamondChance) {
                    placedValue += addDiamond();
                    budget -= 800;
                }
                const numLg = Math.min(3 + Math.floor(level / 3), Math.max(0, Math.floor((budget * 0.40) / 550)));
                for (let i = 0; i < numLg; i++) {
                    placedValue += addGold('large');
                    budget -= 550;
                }
                const numMd = Math.min(4 + Math.floor(level / 2), Math.max(2, Math.floor((budget * 0.55) / 220)));
                for (let i = 0; i < numMd; i++) {
                    placedValue += addGold('medium');
                    budget -= 220;
                }
                placedValue += addGold('small');
                placedValue += addGold('small');
                const numRocks = 1 + Math.floor(level / 5);
                for (let i = 0; i < numRocks; i++) {
                    placedValue += addRock(Math.random() > 0.6 ? 'large' : 'small');
                }
                if (Math.random() < 0.35) {
                    const rnd = Math.random();
                    placedValue += addPig(rnd > 0.85, false, rnd > 0.90);
                }
            }
        }

        // Apply Treasure Map bonus
        if (gameManager.treasureMapActive) {
            placedValue += addDiamond();
            placedValue += addDiamond();
            placedValue += addGold('large');
        }

        // Apply Mission Guarantees
        if (activeMission) {
            if (activeMission.id === 'brass_deception') {
                for (let i = 0; i < 3; i++) {
                    const p = randPos();
                    const brass = new BrassGold(p.x, p.y);
                    items.push(brass);
                }
            } else if (activeMission.id === 'rock_lover') {
                const count = items.filter(i => i.type === 'rock').length;
                const required = 4;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addRock(Math.random() > 0.5 ? 'large' : 'small');
                    }
                }
            } else if (activeMission.id === 'pig_buster') {
                const count = items.filter(i => i.type === 'pig').length;
                const required = 4;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addPig(false);
                    }
                }
            } else if (activeMission.id === 'diamond_hunter') {
                const count = items.filter(i => i.type === 'diamond').length;
                const required = 3;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addDiamond();
                    }
                }
            } else if (activeMission.id === 'mystery_hunter') {
                const count = items.filter(i => i.type === 'mystery_bag').length;
                const required = 3;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        const p = randPos();
                        items.push(new MysteryBag(p.x, p.y));
                        placedValue += 200;
                    }
                }
            } else if (activeMission.id === 'heavy_lifter') {
                const count = items.filter(i => i.width >= 70).length;
                const required = 4;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += Math.random() > 0.5 ? addGold('large') : addRock('large');
                    }
                }
            } else if (activeMission.id === 'diamond_pigs') {
                const count = items.filter(i => i.type === 'pig' && (i as any).hasDiamond).length;
                const required = 3;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addPig(true);
                    }
                }
            } else if (activeMission.id === 'tnt_master') {
                if (gameManager.bombCount < 2) {
                    gameManager.bombCount = 2;
                }
            } else if (activeMission.id === 'combo_5') {
                const totalItems = items.filter(i => i.value > 0).length;
                if (totalItems < 8) {
                    for (let i = 0; i < (8 - totalItems); i++) {
                        placedValue += addGold('small');
                    }
                }
            } else if (activeMission.id === 'clear_all_rocks') {
                const count = items.filter(i => i.type === 'rock').length;
                const required = 5;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addRock(Math.random() > 0.5 ? 'large' : 'small');
                    }
                }
            } else if (activeMission.id === 'clear_all_pigs') {
                const count = items.filter(i => i.type === 'pig').length;
                const required = 4;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addPig(false);
                    }
                }
            } else if (activeMission.id === 'early_speed_capture') {
                const count = items.filter(i => i.value >= 200).length;
                const required = 4;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addGold('large');
                    }
                }
            } else if (activeMission.id === 'no_diamonds') {
                const count = items.filter(i => i.type === 'diamond').length;
                const required = 3;
                if (count < required) {
                    for (let i = 0; i < (required - count); i++) {
                        placedValue += addDiamond();
                    }
                }
            }
        }

        // Economy Pity: ensure min 1.2x delta in the field.
        const minFieldValue = levelDelta * BALANCE.levelFieldValueMinRatio * gameManager.levelDirectorFactor;
        let safeGuard = 0;
        while (placedValue < minFieldValue && safeGuard < 12) {
            placedValue += Math.random() > 0.6 ? addGold('medium') : addGold('small');
            safeGuard++;
        }

        return items;
    }
}
