const fs = require('fs');
let content = fs.readFileSync('src/main.ts', 'utf8');

// 1. dynamic difficulty
content = content.replace(
    /const baseTarget = Math.round\(getBaseLevelTarget\(level\) \* targetScale\);\s*const step = Math.round\(getTargetIncreaseForLevel\(level\) \* targetScale\);\s*const actualTarget = baseTarget;\s*const requiredDelta = Math.max\(0, actualTarget - gameManager.score\);/,
    \const baseTarget = Math.round(getBaseLevelTarget(level) * targetScale);
    const step = Math.round(getTargetIncreaseForLevel(level) * targetScale);
    let actualTarget = baseTarget;
    const minimalEffort = Math.floor(step * 0.85);
    if (gameManager.score + minimalEffort > baseTarget) {
        const wealthLead = Math.max(0, gameManager.score - baseTarget);
        const wealthTax = Math.floor(wealthLead * 0.12);
        actualTarget = gameManager.score + minimalEffort + wealthTax;
    }
    const requiredDelta = Math.max(0, actualTarget - gameManager.score);\
);

// 1.5 currentLevelDelta
content = content.replace(
    /gameManager.initLevel\(economy.actualTarget, economy.timeLimit\);/,
    \gameManager.initLevel(economy.actualTarget, economy.timeLimit);\n    gameManager.currentLevelDelta = economy.requiredDelta;\
);

// 2. HUD target display
content = content.replace(
    /document.getElementById\('target-val'\)!.innerText = gameManager.targetScore.toString\(\);/,
    \document.getElementById('target-val')!.innerHTML = \\\\ <span style="font-size:0.65em; opacity:0.85; font-weight:normal">(需赚: $\)</span>\\\;\
);

// 3. BonusMissionId and levelStats
content = content.replace(
    /type BonusMissionId = 'fast_finish' \| 'diamond_hunter' \| 'mystery_hunter' \| 'blast_master' \| 'diamond_pigs' \| 'big_haul' \| 'clean_catches' \| 'gold_focus' \| 'p1_tnt_hit' \| 'p2_tnt_hit' \| 'p1_empty_hooks' \| 'p2_empty_hooks';/,
    \	ype BonusMissionId = 'fast_finish' | 'diamond_hunter' | 'mystery_hunter' | 'blast_master' | 'diamond_pigs' | 'big_haul' | 'clean_catches' | 'gold_focus' | 'p1_tnt_hit' | 'p2_tnt_hit' | 'p1_empty_hooks' | 'p2_empty_hooks' | 'pacifist' | 'rock_lover' | 'combo_master' | 'precise_aim' | 'heavy_lifter';\
);

content = content.replace(
    /let levelStats = \{\s*collected: 0,\s*diamonds: 0,\s*mystery: 0,\s*diamondPigs: 0,\s*tntExplosions: 0,\s*gold: 0,\s*rocks: 0,\s*bombsUsed: 0,\s*\};/,
    \let levelStats = {
    collected: 0,
    diamonds: 0,
    mystery: 0,
    diamondPigs: 0,
    tntExplosions: 0,
    gold: 0,
    rocks: 0,
    bombsUsed: 0,
    heavyItems: 0,
    pigs: 0,
    maxCombo: 0,
};\
);

content = content.replace(
    /levelStats = \{\s*collected: 0,\s*diamonds: 0,\s*mystery: 0,\s*diamondPigs: 0,\s*tntExplosions: 0,\s*gold: 0,\s*rocks: 0,\s*bombsUsed: 0,\s*\};/,
    \levelStats = {
        collected: 0,
        diamonds: 0,
        mystery: 0,
        diamondPigs: 0,
        tntExplosions: 0,
        gold: 0,
        rocks: 0,
        bombsUsed: 0,
        heavyItems: 0,
        pigs: 0,
        maxCombo: 0,
    };\
);

// 4. Track heavy items and pigs
content = content.replace(
    /if \(item.type === 'diamond'\) levelStats.diamonds\+\+;\s*if \(item.type === 'pig' && \(item as any\).hasDiamond\) levelStats.diamondPigs\+\+;\s*if \(item.type === 'gold'\) levelStats.gold\+\+;\s*if \(item.type === 'rock'\) levelStats.rocks\+\+;/,
    \if (item.type === 'diamond') levelStats.diamonds++;
    if (item.type === 'pig') {
        levelStats.pigs++;
        if ((item as any).hasDiamond) levelStats.diamondPigs++;
    }
    if (item.type === 'gold') levelStats.gold++;
    if (item.type === 'rock') levelStats.rocks++;
    if (item.width >= 70) levelStats.heavyItems++;\
);

// 5. Missions complete logic
content = content.replace(
    /case 'big_haul':\s*return player1.gatheredValue \+ player2.gatheredValue >= gameManager.targetScore \* 0.35;/,
    \case 'big_haul':
            return player1.gatheredValue + player2.gatheredValue >= Math.ceil(spawnSummary.estimatedValue * 0.35);\
);

content = content.replace(
    /case 'p2_empty_hooks':\s*return playerRoundStats.P2.emptyHooks >= 2;/,
    \case 'p2_empty_hooks':
            return playerRoundStats.P2.emptyHooks >= 2;
        case 'pacifist':
            return levelStats.pigs === 0;
        case 'rock_lover':
            return levelStats.rocks >= 3;
        case 'combo_master':
            return bestCombo >= 3;
        case 'precise_aim':
            return (playerRoundStats.P1.emptyHooks + playerRoundStats.P2.emptyHooks) === 0;
        case 'heavy_lifter':
            return levelStats.heavyItems >= 3;\
);

content = content.replace(
    /case 'big_haul': \{\s*const current = player1.gatheredValue \+ player2.gatheredValue;\s*const target = Math.ceil\(gameManager.targetScore \* 0.35\);\s*return \\\\\\$\\\$\{Math.min\(current, target\)\}\/\\\$\\\$\{target\}\\\;\s*\}/,
    \case 'big_haul': {
            const current = player1.gatheredValue + player2.gatheredValue;
            const target = Math.ceil(spawnSummary.estimatedValue * 0.35);
            return \\\\\$\\\/\\$\\\\\\;
        }\
);

content = content.replace(
    /case 'p2_empty_hooks':\s*return \\\\\\$\\\{Math.min\(playerRoundStats.P2.emptyHooks, 2\)\}\/2 P2 空钩\\\;/,
    \case 'p2_empty_hooks':
            return \\\\\\/2 P2 空钩\\\;
        case 'pacifist':
            return levelStats.pigs === 0 ? '和平保持' : '已伤害小猪';
        case 'rock_lover':
            return \\\\\\/3 石头\\\;
        case 'combo_master':
            return \\\最高连击 x\\\/3\\\;
        case 'precise_aim':
            return (playerRoundStats.P1.emptyHooks + playerRoundStats.P2.emptyHooks) === 0 ? '百发百中' : '已有空钩';
        case 'heavy_lifter':
            return \\\\\\/3 重物\\\;\
);

// 6. Mission generation
content = content.replace(
    /if \(summary.estimatedValue >= gameManager.targetScore \* 0.45\) \{\s*candidates.push\(\{ id: 'big_haul', label: '奖励任务: 本关收入达到目标 35%', rewardText: '奖励: \+\\\ 6%', rewardKind: 'money', rewardValue: 0.06 \}\);\s*\}/,
    \if (summary.estimatedValue > 1000) {
        candidates.push({ id: 'big_haul', label: '奖励任务: 达到本关极高收入 (估值35%)', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.5 });
    }\
);

content = content.replace(
    /candidates.push\(\{ id: 'fast_finish', label: '奖励任务: 剩余 12 秒过关', rewardText: '奖励: 下关 \+3 秒', rewardKind: 'time', rewardValue: 3 \}\);/,
    \candidates.push({ id: 'fast_finish', label: '奖励任务: 剩余 12 秒过关', rewardText: '奖励: 下关 +3 秒', rewardKind: 'time', rewardValue: 3 });
    
    candidates.push({ id: 'rock_lover', label: '奖励任务: 收集 3 块石头', rewardText: '奖励: 下关石头升值', rewardKind: 'buff' });
    candidates.push({ id: 'combo_master', label: '奖励任务: 达成 3 连击', rewardText: '奖励: 下关幸运符', rewardKind: 'buff' });
    candidates.push({ id: 'precise_aim', label: '奖励任务: 全局 0 空钩', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.2 });
    candidates.push({ id: 'heavy_lifter', label: '奖励任务: 收集 3 个重物', rewardText: '奖励: 下关神力', rewardKind: 'buff' });
    
    if (levelType !== 'pig_parade') {
        candidates.push({ id: 'pacifist', label: '奖励任务: 不伤害任何小猪', rewardText: '奖励: 额外任务奖金', rewardKind: 'money', rewardValue: 0.8 });
    }\
);

content = content.replace(
    /\{ id: 'big_haul', label: '奖励任务: 本关收入达到目标 35%', rewardText: '奖励: \+\\\ 6%', rewardKind: 'money', rewardValue: 0.06 \},/,
    \{ id: 'big_haul', label: '奖励任务: 达到本关极高收入', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.5 },\
);

content = content.replace(
    /\{ id: 'p1_empty_hooks', label: '奖励任务: P1 故意勾空 2 次', rewardText: '奖励: \+\\\ 4%', rewardKind: 'money', rewardValue: 0.04 \},/,
    \{ id: 'p1_empty_hooks', label: '奖励任务: P1 故意勾空 2 次', rewardText: '奖励: 小额奖金', rewardKind: 'money', rewardValue: 0.5 },
        { id: 'rock_lover', label: '奖励任务: 收集 3 块石头', rewardText: '奖励: 下关石头升值', rewardKind: 'buff' },
        { id: 'combo_master', label: '奖励任务: 达成 3 连击', rewardText: '奖励: 下关幸运符', rewardKind: 'buff' },
        { id: 'precise_aim', label: '奖励任务: 全局 0 空钩', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.2 },
        { id: 'heavy_lifter', label: '奖励任务: 收集 3 个重物', rewardText: '奖励: 下关神力', rewardKind: 'buff' },
        { id: 'pacifist', label: '奖励任务: 不伤害任何小猪', rewardText: '奖励: 额外任务奖金', rewardKind: 'money', rewardValue: 0.8 },\
);

// Mission reward
content = content.replace(
    /const amount = Math.max\(60, Math.floor\(gameManager.targetScore \* \(mission.rewardValue \?\? 0.06\)\)\);/,
    \const baseAmount = Math.max(gameManager.currentLevelDelta * 0.15, spawnSummary.estimatedValue * 0.08);
            const amount = Math.max(60, Math.floor(baseAmount * (mission.rewardValue ?? 1)));\
);

// 7. New Level Types
content = content.replace(
    /type LevelType = 'normal' \| 'gold_rush' \| 'diamond_mine' \| 'tnt_gauntlet' \| 'pig_parade' \| 'mystery_box' \| 'treasure_vault';/,
    \	ype LevelType = 'normal' | 'gold_rush' | 'diamond_mine' | 'tnt_gauntlet' | 'pig_parade' | 'mystery_box' | 'treasure_vault' | 'minefield' | 'tiny_treasures' | 'fossil_dig';\
);

content = content.replace(
    /function getLevelType\(level: number\): LevelType \{\s*\/\/ Special levels follow a pattern\s*if \(level % 10 === 0\) return 'treasure_vault';/,
    \unction getLevelType(level: number): LevelType {
    // Special levels follow a pattern
    if (level % 12 === 0) return 'minefield';
    if (level % 11 === 0) return 'fossil_dig';
    if (level % 10 === 0) return 'treasure_vault';\
);

content = content.replace(
    /if \(level % 10 === 0\) return 'treasure_vault'; \/\/ Every 10th: vault of gems\s*if \(level % 6 === 0\) return 'mystery_box';/,
    \if (level % 10 === 0) return 'treasure_vault'; // Every 10th: vault of gems
    if (level % 9 === 0) return 'tiny_treasures';
    if (level % 6 === 0) return 'mystery_box';\
);

content = content.replace(
    /treasure_vault:\s*'👑 宝藏金库',\s*\};/,
    \	reasure_vault: '👑 宝藏金库',
        minefield:      '⚡ 极限雷区',
        tiny_treasures: '🔍 微缩珍宝',
        fossil_dig:     '🪨 顽石矿脉',
    };\
);

// 8. New Level Spawning
content = content.replace(
    /case 'normal':/,
    \case 'minefield': {
            const numTNT = 8 + Math.floor(level / 3);
            for (let i = 0; i < numTNT; i++) addTNT();
            for (let i = 0; i < 4; i++) placedValue += addDiamond();
            for (let i = 0; i < 3; i++) placedValue += addGold('large');
            break;
        }
        case 'tiny_treasures': {
            const numSmallGold = 10 + Math.floor(level / 2);
            for (let i = 0; i < numSmallGold; i++) placedValue += addGold('small');
            const numDiamonds = 3 + Math.floor(level / 4);
            for (let i = 0; i < numDiamonds; i++) placedValue += addDiamond();
            const numPigs = 2 + Math.floor(level / 5);
            for (let i = 0; i < numPigs; i++) placedValue += addPig(false);
            break;
        }
        case 'fossil_dig': {
            const numRocks = 12 + Math.floor(level / 2);
            for (let i = 0; i < numRocks; i++) {
                placedValue += addRock(Math.random() > 0.6 ? 'large' : 'small');
            }
            placedValue += addGold('large');
            placedValue += addDiamond();
            placedValue += addMystery();
            break;
        }
        default: // 'normal'\
);
content = content.replace(/default: \{ \/\/ 'normal'/g, "default: { // 'normal'");

fs.writeFileSync('src/main.ts', content, 'utf8');
console.log('Patch complete.');
