export enum GameState {
    START_MENU,
    PLAYING,
    PAUSED,
    SHOP,
    LEVEL_TRANSITION,
    GAME_OVER
}

export class GameManager {
    public currentState: GameState = GameState.START_MENU;
    public score: number = 0;
    public targetScore: number = 0;
    public level: number = 1;
    public timeRemaining: number = 60; // seconds
    public playerCount: 1 | 2 = 2;

    // Shared Team Inventory and Buffs
    public bombCount: number = 0;
    public strengthBuff: number = 0;
    public rockBuff: number = 0;
    public diamondBuff: number = 0;
    public luckyCharm: boolean = false;   // next mystery bag guaranteed jackpot
    public magnetBuff: number = 0;   // small gold nuggets auto-attract
    public alchemyBuff: number = 0;  // rocks become gold/diamond next level
    public fossilDemolisher: number = 0;
    public geologySledgehammer: number = 0;
    public cloverBuff: number = 0;
    public drillHookBuff: number = 0;
    public pendingStrengthBuff: boolean = false;
    public pendingRockBuff: boolean = false;
    public pendingDiamondBuff: boolean = false;
    public pendingLuckyCharm: boolean = false;
    public pendingMagnetBuff: boolean = false;
    public pendingAlchemyBuff: boolean = false;
    public pendingFossilDemolisher: boolean = false;
    public pendingGeologySledgehammer: boolean = false;
    public pendingCloverBuff: boolean = false;
    public pendingDrillHookBuff: boolean = false;
    public pendingTimeBonus: number = 0;
    public shopDiscountCharges: number = 0;
    public shopDiscountRate: number = 1.0;
    public pendingShopInflation: number = 0;
    public insuranceCharges: number = 0;
    public hookLockRemaining: number = 0;
    public nextCatchValueMultiplier: number = 1;
    public activeLayerEvent: 'none' | 'quicksand' | 'fragile' | 'lucky' | 'magma' | 'ice' = 'none';
    public p1SwingBoost: number = 0;
    public p2SwingBoost: number = 0;
    public levelRequiredDelta: number = 0; // Fresh target increment required for current level
    public feverTimer: number = 0; // Fever Mode remaining duration
    public teamHasKey: boolean = false; // Key acquired for locked chest
    
    // Explicit dynamic properties
    public timeLimitBonus: number = 0;
    public hookLockTime: number = 0;
    public activeLevelType: string = 'normal';
    public shieldJustActivated: boolean = false;
    public freezeJustActivated: boolean = false;
    public shopDiscount: number = 1.0;
    public currentLevelDelta: number = 0;
    public hardTargetScore: number = 0;
    public hasAchievedHardTarget: boolean = false;
    public levelEndRemainingTime: number = 0;
    public hardTargetRewardMessage: string = '';
    public reputation: number = 0;
    public goldValueMultiplier: number = 1.0;
    public pendingGoldValueMultiplier: boolean = false;

    // Co-op Buffs
    public syncGearBuff: number = 0;
    public tributeAmpBuff: number = 0;
    public pendingSyncGear: boolean = false;
    public pendingTributeAmp: boolean = false;

    // === New shop item effect fields ===
    public crystalShieldActive: boolean = false;  // Prevents one Game Over with +20s
    public goldRadarActive: boolean = false;       // Shows item value labels for one level
    public treasureMapActive: boolean = false;     // Spawns 2 diamonds + 1 large gold bonus
    public freezeTimeActive: boolean = false;      // Gives 8s bonus when time hits 0
    public chainBombActive: boolean = false;       // Bombs chain-explode nearby TNT (permanent)
    public pendingCrystalShield: boolean = false;
    public pendingGoldRadar: boolean = false;
    public pendingTreasureMap: boolean = false;
    public pendingFreezeTime: boolean = false;
    public pendingChainBomb: boolean = false;
    public lowYieldStreak: number = 0;
    public highYieldStreak: number = 0;
    public levelDirectorFactor: number = 1.0;
    public directorLastReason: string = 'stable';

    constructor() {
        this.currentState = GameState.START_MENU;
    }

    private getBuffChineseName(key: string): string {
        switch (key) {
            case 'strengthBuff': return '怪力药水';
            case 'rockBuff': return '点石成金书';
            case 'diamondBuff': return '钻石大亨印记';
            case 'magnetBuff': return '磁铁信标';
            case 'alchemyBuff': return '炼金洗剂';
            case 'fossilDemolisher': return '化石爆破雷';
            case 'geologySledgehammer': return '地质重锤';
            case 'cloverBuff': return '幸运四叶草';
            case 'drillHookBuff': return '喷气钢钻';
            case 'syncGearBuff': return '传动同步带';
            case 'tributeAmpBuff': return '反向增幅器';
            default: return '未知Buff';
        }
    }

    public initLevel(targetScore: number, timeLimit: number) {
        this.targetScore = targetScore;
        this.levelRequiredDelta = Math.max(0, targetScore - this.score);
        this.timeRemaining = Math.min(timeLimit, 99);
        this.teamHasKey = false;
        
        // Reset/init Hard Target values
        this.hardTargetScore = targetScore + Math.round(this.currentLevelDelta * 0.4);
        this.levelEndRemainingTime = 0;
        this.hardTargetRewardMessage = '';

        // Single-level power-ups: activate from pending, then expire next level
        if (this.pendingGoldRadar)   { this.goldRadarActive = true;    this.pendingGoldRadar = false;   }
        else                           { this.goldRadarActive = false; }
        if (this.pendingTreasureMap) { this.treasureMapActive = true;  this.pendingTreasureMap = false; }
        else                           { this.treasureMapActive = false; }
        if (this.pendingFreezeTime)  { this.freezeTimeActive = true;   this.pendingFreezeTime = false;  }
        else                           { this.freezeTimeActive = false; }
        // Crystal shield persists until used; chain bomb is permanent once bought
        if (this.pendingCrystalShield) { this.crystalShieldActive = true; this.pendingCrystalShield = false; }
        if (this.pendingChainBomb)     { this.chainBombActive = true;    this.pendingChainBomb = false; }

        // Reset per-level activation flags
        this.freezeJustActivated = false;
        this.shieldJustActivated = false;
        
        // Retain / Decrement or Set Buff durations (3 levels duration for bought shop buffs!)
        if (this.pendingStrengthBuff) { this.strengthBuff = 3; this.pendingStrengthBuff = false; }
        else if (this.strengthBuff > 0) { this.strengthBuff--; }
        
        if (this.pendingRockBuff) { this.rockBuff = 3; this.pendingRockBuff = false; }
        else if (this.rockBuff > 0) { this.rockBuff--; }
        
        if (this.pendingDiamondBuff) { this.diamondBuff = 3; this.pendingDiamondBuff = false; }
        else if (this.diamondBuff > 0) { this.diamondBuff--; }
        
        if (this.pendingLuckyCharm) { this.luckyCharm = true; this.pendingLuckyCharm = false; }
        
        if (this.pendingMagnetBuff) { this.magnetBuff = 3; this.pendingMagnetBuff = false; }
        else if (this.magnetBuff > 0) { this.magnetBuff--; }
        
        if (this.pendingAlchemyBuff) { this.alchemyBuff = 3; this.pendingAlchemyBuff = false; }
        else if (this.alchemyBuff > 0) { this.alchemyBuff--; }
        
        if (this.pendingFossilDemolisher) { this.fossilDemolisher = 3; this.pendingFossilDemolisher = false; }
        else if (this.fossilDemolisher > 0) { this.fossilDemolisher--; }
        
        if (this.pendingGeologySledgehammer) { this.geologySledgehammer = 3; this.pendingGeologySledgehammer = false; }
        else if (this.geologySledgehammer > 0) { this.geologySledgehammer--; }
        
        if (this.pendingCloverBuff) { this.cloverBuff = 3; this.pendingCloverBuff = false; }
        else if (this.cloverBuff > 0) { this.cloverBuff--; }
        
        if (this.pendingDrillHookBuff) { this.drillHookBuff = 3; this.pendingDrillHookBuff = false; }
        else if (this.drillHookBuff > 0) { this.drillHookBuff--; }

        if (this.pendingSyncGear) { this.syncGearBuff = 3; this.pendingSyncGear = false; }
        else if (this.syncGearBuff > 0) { this.syncGearBuff--; }

        if (this.pendingTributeAmp) { this.tributeAmpBuff = 3; this.pendingTributeAmp = false; }
        else if (this.tributeAmpBuff > 0) { this.tributeAmpBuff--; }
        
        // Hard Target reward: if achieved, give a random buff extension or a free buff
        if (this.hasAchievedHardTarget) {
            const activeBuffs: ('strengthBuff' | 'rockBuff' | 'diamondBuff' | 'magnetBuff' | 'alchemyBuff' | 'fossilDemolisher' | 'geologySledgehammer' | 'cloverBuff' | 'drillHookBuff' | 'syncGearBuff' | 'tributeAmpBuff')[] = [];
            const allBuffs: ('strengthBuff' | 'rockBuff' | 'diamondBuff' | 'magnetBuff' | 'alchemyBuff' | 'fossilDemolisher' | 'geologySledgehammer' | 'cloverBuff' | 'drillHookBuff' | 'syncGearBuff' | 'tributeAmpBuff')[] = [
                'strengthBuff', 'rockBuff', 'diamondBuff', 'magnetBuff', 'alchemyBuff', 'fossilDemolisher', 'geologySledgehammer', 'cloverBuff', 'drillHookBuff', 'syncGearBuff', 'tributeAmpBuff'
            ];
            
            allBuffs.forEach(buffKey => {
                if (this[buffKey] > 0) {
                    activeBuffs.push(buffKey);
                }
            });

            if (activeBuffs.length > 0) {
                // Randomly extend one active buff
                const randomActive = activeBuffs[Math.floor(Math.random() * activeBuffs.length)];
                this[randomActive]++;
                this.hardTargetRewardMessage = `🏆 卓越目标达成! 已延长「${this.getBuffChineseName(randomActive)}」持续时间 1 关!`;
            } else {
                // No active buff: grant a free strength, clover, or diamond buff for 1 level
                const freeBuffs: ('strengthBuff' | 'cloverBuff' | 'diamondBuff')[] = ['strengthBuff', 'cloverBuff', 'diamondBuff'];
                const randomFree = freeBuffs[Math.floor(Math.random() * freeBuffs.length)];
                this[randomFree] = 1;
                this.hardTargetRewardMessage = `🏆 卓越目标达成! 获得免费「${this.getBuffChineseName(randomFree)}」Buff 1 关!`;
            }
            this.hasAchievedHardTarget = false; // Reset after awarding
        }

        // Low reputation penalty: random active buff reduced/disabled
        if (this.reputation <= -3) {
            const activeBuffs: ('strengthBuff' | 'rockBuff' | 'diamondBuff' | 'magnetBuff' | 'alchemyBuff' | 'fossilDemolisher' | 'geologySledgehammer' | 'cloverBuff' | 'drillHookBuff' | 'syncGearBuff' | 'tributeAmpBuff')[] = [];
            const allBuffs: ('strengthBuff' | 'rockBuff' | 'diamondBuff' | 'magnetBuff' | 'alchemyBuff' | 'fossilDemolisher' | 'geologySledgehammer' | 'cloverBuff' | 'drillHookBuff' | 'syncGearBuff' | 'tributeAmpBuff')[] = [
                'strengthBuff', 'rockBuff', 'diamondBuff', 'magnetBuff', 'alchemyBuff', 'fossilDemolisher', 'geologySledgehammer', 'cloverBuff', 'drillHookBuff', 'syncGearBuff', 'tributeAmpBuff'
            ];
            allBuffs.forEach(buffKey => {
                if (this[buffKey] > 0) {
                    activeBuffs.push(buffKey);
                }
            });
            let msg = '';
            if (activeBuffs.length > 0) {
                const randomActive = activeBuffs[Math.floor(Math.random() * activeBuffs.length)];
                this[randomActive] = Math.max(0, this[randomActive] - 1);
                msg = `💀 极低声望惩罚: 「${this.getBuffChineseName(randomActive)}」持续时间被撕毁 1 关!`;
            } else {
                msg = `💀 极低声望惩罚: 黑市对你们极度不信任!`;
            }
            if (this.hardTargetRewardMessage) {
                this.hardTargetRewardMessage += " | " + msg;
            } else {
                this.hardTargetRewardMessage = msg;
            }
        }

        if (this.pendingGoldValueMultiplier) {
            this.goldValueMultiplier = 1.3;
            this.pendingGoldValueMultiplier = false;
        } else {
            this.goldValueMultiplier = 1.0;
        }

        this.pendingTimeBonus = 0;
        this.shopDiscount = 1.0;
        this.currentState = GameState.PLAYING;
    }

    public update(dt: number) {
        this.hookLockRemaining = Math.max(0, this.hookLockRemaining - dt);
        this.feverTimer = Math.max(0, this.feverTimer - dt);
        if (this.currentState === GameState.PLAYING) {
            this.timeRemaining -= dt;
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.checkLevelEnd();
            }
        }
    }

    public checkLevelEnd() {
        if (this.score >= this.targetScore) {
            if (this.levelEndRemainingTime <= 0) {
                this.levelEndRemainingTime = Math.max(0, this.timeRemaining);
            }
            this.hasAchievedHardTarget = this.score >= this.hardTargetScore;
            this.currentState = GameState.SHOP;
        } else if (this.freezeTimeActive) {
            // Freeze Time activates! 8 bonus seconds.
            this.freezeTimeActive = false;
            this.timeRemaining = 8;
            this.freezeJustActivated = true;
            // Don't change state — game continues!
        } else if (this.crystalShieldActive) {
            // Crystal Shield saves the team! 20 bonus seconds.
            this.crystalShieldActive = false;
            this.timeRemaining = 20;
            this.shieldJustActivated = true;
            // Don't change state — last chance!
        } else {
            this.currentState = GameState.GAME_OVER;
        }
    }

    public addScore(amount: number) {
        this.score += amount;
    }

    public reportLevelOutcome(earnedThisLevel: number, missionSucceeded: boolean, pressure: number) {
        const delta = Math.max(1, this.currentLevelDelta || 1);
        const ratio = earnedThisLevel / delta;
        const stressHigh = pressure >= 1.2;
        const stressLow = pressure <= 0.6;
        if (ratio < 0.92) {
            this.lowYieldStreak++;
            this.highYieldStreak = 0;
        } else if (ratio > 1.45) {
            this.highYieldStreak++;
            this.lowYieldStreak = 0;
        } else {
            this.lowYieldStreak = 0;
            this.highYieldStreak = 0;
        }
        if (!missionSucceeded || stressHigh) {
            this.lowYieldStreak++;
        } else if (missionSucceeded && stressLow && ratio > 1.1) {
            this.highYieldStreak++;
        }
        const boost = Math.min(0.16, this.lowYieldStreak * 0.04);
        const nerf = Math.min(0.12, this.highYieldStreak * 0.03);
        this.levelDirectorFactor = 1 + boost - nerf;
        if (!missionSucceeded) this.directorLastReason = 'mission_fail';
        else if (stressHigh) this.directorLastReason = 'high_pressure';
        else if (ratio < 0.92) this.directorLastReason = 'low_yield';
        else if (ratio > 1.45 && stressLow) this.directorLastReason = 'overperform';
        else this.directorLastReason = 'stable';
    }

    public resetRun(playerCount: 1 | 2 = this.playerCount) {
        this.playerCount = playerCount;
        this.score = 0;
        this.targetScore = 0;
        this.level = 1;
        this.timeRemaining = 60;
        this.bombCount = 0;
        this.strengthBuff = 0;
        this.rockBuff = 0;
        this.diamondBuff = 0;
        this.luckyCharm = false;
        this.magnetBuff = 0;
        this.alchemyBuff = 0;
        this.fossilDemolisher = 0;
        this.geologySledgehammer = 0;
        this.cloverBuff = 0;
        this.drillHookBuff = 0;
        this.pendingStrengthBuff = false;
        this.pendingRockBuff = false;
        this.pendingDiamondBuff = false;
        this.pendingLuckyCharm = false;
        this.pendingMagnetBuff = false;
        this.pendingAlchemyBuff = false;
        this.pendingFossilDemolisher = false;
        this.pendingGeologySledgehammer = false;
        this.pendingCloverBuff = false;
        this.pendingDrillHookBuff = false;
        this.pendingTimeBonus = 0;
        this.shopDiscountCharges = 0;
        this.shopDiscountRate = 1.0;
        this.pendingShopInflation = 0;
        this.insuranceCharges = 0;
        this.hookLockRemaining = 0;
        this.nextCatchValueMultiplier = 1;
        this.activeLayerEvent = 'none';
        this.p1SwingBoost = 0;
        this.p2SwingBoost = 0;
        this.levelRequiredDelta = 0;
        this.feverTimer = 0;
        this.teamHasKey = false;
        this.crystalShieldActive = false;
        this.goldRadarActive = false;
        this.treasureMapActive = false;
        this.freezeTimeActive = false;
        this.chainBombActive = false;
        this.pendingCrystalShield = false;
        this.pendingGoldRadar = false;
        this.pendingTreasureMap = false;
        this.pendingFreezeTime = false;
        this.pendingChainBomb = false;
        this.lowYieldStreak = 0;
        this.highYieldStreak = 0;
        this.levelDirectorFactor = 1.0;
        this.directorLastReason = 'stable';
        this.reputation = 0;
        this.syncGearBuff = 0;
        this.tributeAmpBuff = 0;
        this.pendingSyncGear = false;
        this.pendingTributeAmp = false;
        this.goldValueMultiplier = 1.0;
        this.pendingGoldValueMultiplier = false;
    }
}
