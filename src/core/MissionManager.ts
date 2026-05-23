import { GameManager } from './GameManager';
import { audioManager } from './AudioManager';

export interface BonusMission {
    id: string;
    label: string;
    rewardText: string;
    rewardKind: 'money' | 'time' | 'bomb' | 'discount' | 'buff';
    rewardValue?: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

export class MissionManager {
    public static ALL_MISSIONS: BonusMission[] = [
        // Easy difficulty
        { id: 'rock_lover', label: '任务: 收集 3 块废石', rewardText: '奖励: 下关点石成金效果', rewardKind: 'buff', difficulty: 'easy' },
        { id: 'pig_buster', label: '任务: 抓到 3 只小猪', rewardText: '奖励: 猪只收购高额奖金', rewardKind: 'money', rewardValue: 150, difficulty: 'easy' },
        { id: 'p1_empty_hooks', label: '任务: P1 故意勾空 2 次', rewardText: '奖励: 勾爪练习小额奖金', rewardKind: 'money', rewardValue: 120, difficulty: 'easy' },
        { id: 'p2_empty_hooks', label: '任务: P2 故意勾空 2 次', rewardText: '奖励: 勾爪练习小额奖金', rewardKind: 'money', rewardValue: 120, difficulty: 'easy' },
        { id: 'no_rocks', label: '任务: 全关不抓任何石头', rewardText: '奖励: 下关石头全部点化为黄金！', rewardKind: 'buff', difficulty: 'easy' },

        // Medium difficulty
        { id: 'fast_finish', label: '任务: 剩余 12 秒以上通关', rewardText: '奖励: 下关时限增加 3 秒', rewardKind: 'time', rewardValue: 3, difficulty: 'medium' },
        { id: 'diamond_hunter', label: '任务: 收集 2 颗钻石', rewardText: '奖励: 下关开局增援 1 个炸弹', rewardKind: 'bomb', rewardValue: 1, difficulty: 'medium' },
        { id: 'mystery_hunter', label: '任务: 收集 2 个神秘袋', rewardText: '奖励: 下关赠送幸运符', rewardKind: 'buff', difficulty: 'medium' },
        { id: 'heavy_lifter', label: '任务: 收集 3 个大型重物', rewardText: '奖励: 下关获得神力药水', rewardKind: 'buff', difficulty: 'medium' },
        { id: 'tnt_master', label: '任务: 用炸弹成功炸毁 2 个物品', rewardText: '奖励: +3炸弹 并额外奖金', rewardKind: 'bomb', rewardValue: 3, difficulty: 'medium' },
        { id: 'brass_deception', label: '合同: 辨别真金 (不抓任何黄铜矿石)', rewardText: '奖励: 声望+1 并奖金 $200', rewardKind: 'money', rewardValue: 200, difficulty: 'medium' },
        { id: 'clear_all_rocks', label: '扫荡: 清除所有废石', rewardText: '奖励: 声望+1 并下关点石成金书', rewardKind: 'buff', difficulty: 'medium' },
        { id: 'clear_all_pigs', label: '扫荡: 清理所有野猪', rewardText: '奖励: 声望+1 并下关获得怪力药水', rewardKind: 'buff', difficulty: 'medium' },
        { id: 'no_diamonds', label: '戒律: 不抓取任何钻石', rewardText: '奖励: 声望+1 且下关黄金价值+30%', rewardKind: 'money', rewardValue: 300, difficulty: 'medium' },

        // Hard difficulty
        { id: 'precise_aim', label: '任务: 百发百中 (本关 0 空钩)', rewardText: '奖励: 获得超额奖金 ($500)', rewardKind: 'money', rewardValue: 500, difficulty: 'hard' },
        { id: 'combo_master', label: '任务: 达成 3 次以上连击', rewardText: '奖励: 下关黑市商店 7 折', rewardKind: 'discount', rewardValue: 0.7, difficulty: 'hard' },
        { id: 'clean_catches', label: '任务: 不用任何炸弹通关', rewardText: '奖励: 环保达人 7 折扣', rewardKind: 'discount', rewardValue: 0.7, difficulty: 'hard' },
        { id: 'diamond_pigs', label: '任务: 收集 2 只钻石猪', rewardText: '奖励: 濒危物种丰厚奖金', rewardKind: 'money', rewardValue: 600, difficulty: 'hard' },
        { id: 'speed_runner', label: '任务: 剩余 25 秒时完成过关目标', rewardText: '奖励: 下关凝时沙漏 + $400', rewardKind: 'time', rewardValue: 8, difficulty: 'hard' },
        { id: 'combo_5', label: '任务: 本关达成 5 连击以上', rewardText: '奖励: $600 + 下关幸运符', rewardKind: 'money', rewardValue: 600, difficulty: 'hard' },
        { id: 'coop_alternation', label: '合同: 交替抓取 (P1/P2交替成功抓取)', rewardText: '奖励: 声望+2 并奖金 $400，下关黑市8折', rewardKind: 'discount', rewardValue: 0.8, difficulty: 'hard' },
        { id: 'early_speed_capture', label: '限时: 20秒速抓3个大件', rewardText: '奖励: 声望+2, 下关黑市8折 并奖金 $400', rewardKind: 'discount', rewardValue: 0.8, difficulty: 'hard' },
        { id: 'sync_hooks_launch', label: '协作: 达成3次双人同步收线', rewardText: '奖励: 声望+2, 下关获得同步带 并奖金 $300', rewardKind: 'buff', difficulty: 'hard' },
    ];

    public static generateMissionChoices(playerCount: number = 2): BonusMission[] {
        const filtered = MissionManager.ALL_MISSIONS.filter(m => {
            if (playerCount === 1) {
                if (m.id === 'p2_empty_hooks' || m.id === 'coop_alternation' || m.id === 'sync_hooks_launch') return false;
            }
            return true;
        });
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        const m1 = shuffled.find(m => m.difficulty !== 'hard') ?? shuffled[0];
        const m2 = shuffled.find(m => m.difficulty === 'hard') ?? shuffled[1];
        return [m1, m2];
    }

    public static getMissionPenaltyText(m: BonusMission, level: number): string {
        switch (m.difficulty) {
            case 'easy': return `扣除固定违约金 $${50 + 10 * level}`;
            case 'medium': return `扣除固定违约金 $${80 + 15 * level}，下关时间减少 3 秒`;
            case 'hard': return `扣除高额违约金 $${150 + 25 * level}，且下关起手禁钩 3 秒！`;
        }
    }

    public static getMissionRewardText(m: BonusMission, level: number): string {
        switch (m.id) {
            case 'rock_lover':
                return `下关点石成金效果 并额外奖金 +$${50 * level}`;
            case 'pig_buster':
                return `猪只收购奖金 +$${150 + 15 * level}`;
            case 'p1_empty_hooks':
            case 'p2_empty_hooks':
                return `勾爪练习奖金 +$${120 + 15 * level}`;
            case 'no_rocks':
                return `下关所有石头点化为黄金 并奖金 +$${60 * level}`;
            case 'fast_finish':
                return `下关时限 +3s 并额外奖金 +$${80 * level}`;
            case 'diamond_hunter':
                return `下关开局增援 1个炸弹 并额外奖金 +$${80 * level}`;
            case 'mystery_hunter':
                return `下关赠送幸运符 并额外奖金 +$${80 * level}`;
            case 'heavy_lifter':
                return `下关获得神力药水 并额外奖金 +$${80 * level}`;
            case 'tnt_master':
                return `获得 3 个炸弹 并额外奖金 +$${150 + 30 * level}`;
            case 'precise_aim':
                return `获得超额奖金 +$${500 + 80 * level}`;
            case 'combo_master':
                return `下关黑市商店 7折特惠 并奖金 +$${200 * level}`;
            case 'clean_catches':
                return `下关黑市商店 7折特惠 并奖金 +$${200 * level}`;
            case 'diamond_pigs':
                return `濒危物种丰厚奖金 +$${600 + 80 * level}`;
            case 'speed_runner':
                return `下关凝时沙漏 并奖金 +$${400 + 60 * level}`;
            case 'combo_5':
                return `下关幸运符 并奖金 +$${600 + 80 * level}`;
            case 'brass_deception':
                return `声望+1, 下关黄金+30% 并奖金 +$200`;
            case 'coop_alternation':
                return `声望+2, 下关黑市8折 且奖金 +$400`;
            case 'clear_all_rocks':
                return `声望+1, 下关点石成金 并奖金 +$150`;
            case 'clear_all_pigs':
                return `声望+1, 下关获得怪力 并奖金 +$180`;
            case 'no_diamonds':
                return `声望+1, 下关黄金增值1.3倍 并奖金 +$300`;
            case 'early_speed_capture':
                return `声望+2, 下关黑市8折 并奖金 +$400`;
            case 'sync_hooks_launch':
                return `声望+2, 下关获得传动同步带 并奖金 +$300`;
            default:
                return m.rewardText;
        }
    }

    public static isBonusMissionComplete(
        m: BonusMission,
        gameManager: GameManager,
        levelStats: any,
        playerRoundStats: any
    ): boolean {
        switch (m.id) {
            case 'rock_lover': return levelStats.rocks >= 3;
            case 'pig_buster': return levelStats.pigs >= 3;
            case 'p1_empty_hooks': return playerRoundStats.P1.emptyHooks >= 2;
            case 'p2_empty_hooks': return playerRoundStats.P2.emptyHooks >= 2;
            case 'no_rocks': return levelStats.rocks === 0;
            case 'fast_finish': return gameManager.timeRemaining >= 12.0;
            case 'diamond_hunter': return levelStats.diamonds >= 2;
            case 'mystery_hunter': return levelStats.mystery >= 2;
            case 'heavy_lifter': return levelStats.heavyItems >= 3;
            case 'tnt_master': return levelStats.bombsUsed >= 2;
            case 'precise_aim': return (playerRoundStats.P1.emptyHooks + playerRoundStats.P2.emptyHooks) === 0;
            case 'combo_master': return levelStats.maxCombo >= 3;
            case 'clean_catches': return levelStats.bombsUsed === 0;
            case 'diamond_pigs': return levelStats.diamondPigs >= 2;
            case 'speed_runner': return gameManager.timeRemaining >= 25.0;
            case 'combo_5': return levelStats.maxCombo >= 5;
            case 'brass_deception': return (levelStats.brassGoldCatches ?? 0) === 0;
            case 'coop_alternation': return !(levelStats.coopAlternationFailed ?? false);
            case 'clear_all_rocks': return (levelStats.remainingRocks ?? 1) === 0;
            case 'clear_all_pigs': return (levelStats.remainingPigs ?? 1) === 0;
            case 'early_speed_capture': return levelStats.earlyHighValueCatches >= 3;
            case 'sync_hooks_launch': return levelStats.syncCatches >= 3;
            case 'no_diamonds': return levelStats.diamonds === 0;
            default: return false;
        }
    }

    public static getBonusMissionProgress(
        m: BonusMission,
        gameManager: GameManager,
        levelStats: any,
        playerRoundStats: any
    ): string {
        switch (m.id) {
            case 'rock_lover': return `${Math.min(levelStats.rocks, 3)}/3 石头`;
            case 'pig_buster': return `${Math.min(levelStats.pigs, 3)}/3 猪只`;
            case 'p1_empty_hooks': return `${Math.min(playerRoundStats.P1.emptyHooks, 2)}/2 P1 空钩`;
            case 'p2_empty_hooks': return `${Math.min(playerRoundStats.P2.emptyHooks, 2)}/2 P2 空钩`;
            case 'no_rocks': return levelStats.rocks === 0 ? '✅ 干净如新' : `❌ 已抓 ${levelStats.rocks} 块石头`;
            case 'fast_finish': return `剩余 ${Math.floor(Math.max(0, gameManager.timeRemaining))}/12s`;
            case 'diamond_hunter': return `${Math.min(levelStats.diamonds, 2)}/2 钻石`;
            case 'mystery_hunter': return `${Math.min(levelStats.mystery, 2)}/2 神秘袋`;
            case 'heavy_lifter': return `${Math.min(levelStats.heavyItems, 3)}/3 大型重物`;
            case 'tnt_master': return `${Math.min(levelStats.bombsUsed, 2)}/2 炸弹使用`;
            case 'precise_aim': return (playerRoundStats.P1.emptyHooks + playerRoundStats.P2.emptyHooks) === 0 ? '全中保持中' : '已勾空';
            case 'combo_master': return `最高连击 ${levelStats.maxCombo}/3`;
            case 'clean_catches': return levelStats.bombsUsed === 0 ? '未使用炸弹' : '已使用炸弹';
            case 'diamond_pigs': return `${Math.min(levelStats.diamondPigs, 2)}/2 钻石猪`;
            case 'speed_runner': return `剩余 ${Math.floor(Math.max(0, gameManager.timeRemaining))}/25s`;
            case 'combo_5': return `最高连击 ${levelStats.maxCombo}/5`;
            case 'brass_deception': return (levelStats.brassGoldCatches ?? 0) === 0 ? '未抓取黄铜矿' : `❌ 已抓 ${levelStats.brassGoldCatches} 个黄铜矿`;
            case 'coop_alternation': return (levelStats.coopAlternationFailed ?? false) ? '❌ 违规' : '✅ 正常交替中';
            case 'clear_all_rocks': return `剩余 ${levelStats.remainingRocks ?? 0} 块废石`;
            case 'clear_all_pigs': return `剩余 ${levelStats.remainingPigs ?? 0} 只野猪`;
            case 'early_speed_capture': return `已抓 ${levelStats.earlyHighValueCatches}/3 (20s内)`;
            case 'sync_hooks_launch': return `同步收线 ${levelStats.syncCatches}/3`;
            case 'no_diamonds': return levelStats.diamonds === 0 ? '未抓取钻石' : '❌ 已违规';
            default: return '';
        }
    }

    public static applyBonusMissionReward(
        m: BonusMission,
        gameManager: GameManager,
        spawnFloatingText: (text: string, color: string, size?: number) => void
    ): void {
        const level = gameManager.level;
        switch (m.rewardKind) {
            case 'buff': {
                let extraCash = 50 * level;
                if (m.difficulty === 'medium') {
                    extraCash = 80 * level;
                }
                
                if (m.id === 'rock_lover') {
                    gameManager.addScore(extraCash);
                    gameManager.rockBuff = 1.0;
                    spawnFloatingText(`🎉 合同达成! 获得「点石成金」增益 并奖金 +$${extraCash}`, "#facc15", 24);
                } else if (m.id === 'no_rocks') {
                    gameManager.addScore(extraCash);
                    gameManager.pendingAlchemyBuff = true;
                    spawnFloatingText(`🎉 合同达成! 下关石头全部点石成金！ 并奖金 +$${extraCash}`, "#22c55e", 24);
                } else if (m.id === 'mystery_hunter') {
                    gameManager.addScore(extraCash);
                    gameManager.diamondBuff = 1.0;
                    spawnFloatingText(`🎉 合同达成! 获得「钻石大亨」增益 并奖金 +$${extraCash}`, "#22d3ee", 24);
                } else if (m.id === 'clear_all_rocks') {
                    gameManager.addScore(150);
                    gameManager.rockBuff = 1.0;
                    gameManager.reputation = Math.min(10, gameManager.reputation + 1);
                    spawnFloatingText(`🎉 合同达成! 声望+1, 顽石净空! +$150 并下关点石成金`, "#22c55e", 24);
                } else if (m.id === 'clear_all_pigs') {
                    gameManager.addScore(180);
                    gameManager.strengthBuff = 1.0;
                    gameManager.reputation = Math.min(10, gameManager.reputation + 1);
                    spawnFloatingText(`🎉 合同达成! 声望+1, 野猪净空! +$180 并下关获得怪力`, "#22c55e", 24);
                } else if (m.id === 'sync_hooks_launch') {
                    gameManager.addScore(300);
                    gameManager.pendingSyncGear = true;
                    gameManager.reputation = Math.min(10, gameManager.reputation + 2);
                    spawnFloatingText(`🎉 合同达成! 声望+2, 同步收线! +$300 并赠送同步带`, "#a78bfa", 24);
                } else {
                    gameManager.addScore(extraCash);
                    gameManager.strengthBuff = 1.0;
                    spawnFloatingText(`🎉 合同达成! 获得「怪力药水」增益 并奖金 +$${extraCash}`, "#fbbf24", 24);
                }
                audioManager.playMoney();
                break;
            }
            case 'bomb': {
                const bombs = m.rewardValue ?? 1;
                gameManager.bombCount += bombs;
                let extraCash: number;
                if (m.id === 'tnt_master') {
                    extraCash = 150 + 30 * level;
                    spawnFloatingText(`🎉 合同达成! 炸弹大师! +${bombs}炸弹 并奖金 +$${extraCash}`, "#fb7185", 24);
                } else {
                    extraCash = 80 * level;
                    spawnFloatingText(`🎉 合同达成! 获得炸弹 +${bombs} 并奖金 +$${extraCash}`, "#fb7185", 24);
                }
                gameManager.addScore(extraCash);
                audioManager.playMoney();
                break;
            }
            case 'discount': {
                const discount = m.rewardValue ?? 0.7;
                gameManager.shopDiscountRate = discount;
                gameManager.shopDiscountCharges = Math.max(gameManager.shopDiscountCharges, 1);
                let extraCash = 200 * level;
                if (m.id === 'coop_alternation') {
                    extraCash = 400;
                    gameManager.reputation = Math.min(10, gameManager.reputation + 2);
                    spawnFloatingText(`🎉 合同达成! 声望+2, 8折优惠 并额外奖金 +$400`, "#a78bfa", 24);
                } else if (m.id === 'early_speed_capture') {
                    extraCash = 400;
                    gameManager.reputation = Math.min(10, gameManager.reputation + 2);
                    spawnFloatingText(`🎉 合同达成! 声望+2, 开局速通! +$400 & 8折优惠`, "#38bdf8", 24);
                } else {
                    spawnFloatingText(`🎉 合同达成! 获得${Math.round(discount * 10)}折特惠 并额外奖金 +$${extraCash}`, "#a78bfa", 24);
                }
                gameManager.addScore(extraCash);
                audioManager.playMoney();
                break;
            }
            case 'money':
            default: {
                let baseRewardValue = m.rewardValue ?? 100;
                if (m.difficulty === 'easy') baseRewardValue += 15 * level;
                else if (m.difficulty === 'medium') baseRewardValue += 35 * level;
                else if (m.difficulty === 'hard') baseRewardValue += 80 * level;
                const roundedReward = Math.round(baseRewardValue);
                
                if (m.id === 'brass_deception') {
                    gameManager.reputation = Math.min(10, gameManager.reputation + 1);
                    gameManager.pendingGoldValueMultiplier = true;
                    gameManager.addScore(200);
                    spawnFloatingText(`🎉 合同达成! 声望+1, 下关黄金价值+30% 且奖金 +$200`, "#22c55e", 24);
                } else if (m.id === 'no_diamonds') {
                    gameManager.reputation = Math.min(10, gameManager.reputation + 1);
                    gameManager.pendingGoldValueMultiplier = true;
                    gameManager.addScore(300);
                    spawnFloatingText(`🎉 合同达成! 声望+1, 拒绝钻石! +$300 & 下关黄金价值+30%`, "#22c55e", 24);
                } else if (m.id === 'combo_5') {
                    gameManager.pendingLuckyCharm = true;
                    gameManager.addScore(roundedReward);
                    spawnFloatingText(`🎉 合同达成! 幸运符+奖金 +$${roundedReward}`, "#22c55e", 26);
                } else {
                    gameManager.addScore(roundedReward);
                    spawnFloatingText(`🎉 合同达成! 额外奖金 +$${roundedReward}`, "#22c55e", 26);
                }
                audioManager.playMoney();
                break;
            }
            case 'time': {
                const timeBonus = m.rewardValue ?? 3;
                gameManager.timeLimitBonus = timeBonus;
                let extraCash: number;
                if (m.id === 'speed_runner') {
                    gameManager.pendingFreezeTime = true;
                    extraCash = 400 + 60 * level;
                    spawnFloatingText(`🎉 合同达成! 下关凝时沙漏 并奖金 +$${extraCash}`, "#38bdf8", 24);
                } else {
                    extraCash = 80 * level;
                    spawnFloatingText(`🎉 合同达成! 下关时限 +${timeBonus}s 并奖金 +$${extraCash}`, "#38bdf8", 24);
                }
                gameManager.addScore(extraCash);
                audioManager.playMoney();
                break;
            }
        }
    }

    public static applyBonusMissionPenalty(
        m: BonusMission,
        gameManager: GameManager,
        spawnFloatingText: (text: string, color: string, size?: number) => void
    ): void {
        const level = gameManager.level;

        // Insurance vault check
        if (gameManager.insuranceCharges > 0) {
            gameManager.insuranceCharges--;
            spawnFloatingText(`🛡️ 保险券已生效! 免除声望降低与合同处罚!`, "#38bdf8", 24);
            return;
        }

        let penaltyMoney = 50 + 10 * level;
        if (m.difficulty === 'medium') penaltyMoney = 80 + 15 * level;
        if (m.difficulty === 'hard') penaltyMoney = 150 + 25 * level;

        gameManager.score = Math.max(0, gameManager.score - penaltyMoney);

        spawnFloatingText(`💀 合同违约! 扣除金币 -$${penaltyMoney}`, "#ef4444", 24);
        audioManager.playBomb();

        // Reduce reputation by 2 on failure
        gameManager.reputation = Math.max(-10, gameManager.reputation - 2);

        if (m.difficulty === 'medium') {
            gameManager.timeLimitBonus = -3;
        }
        if (m.difficulty === 'hard') {
            gameManager.hookLockTime = 3.0;
        }
    }
}
