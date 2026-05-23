import re
import subprocess

# 1. Checkout clean main.ts
subprocess.run(['git', 'checkout', '--', 'src/main.ts'], cwd='e:/Work/Code/Web/Gold')

with open('src/main.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Miner constructor calls
content = content.replace("const player1 = new Miner('P1', canvas.width / 2 - 150, 100);", "const player1 = new Miner('P1', canvas.width / 2 - 150, 100, gameManager);")
content = content.replace("const player2 = new Miner('P2', canvas.width / 2 + 150, 100);", "const player2 = new Miner('P2', canvas.width / 2 + 150, 100, gameManager);")

# Fix handleItemCollected buff checks to use byPlayer.gameManager
content = content.replace("if (item.type === 'rock' && byPlayer.rockBuff) val *= 2;", "if (item.type === 'rock' && byPlayer.gameManager.rockBuff > 0) val *= 2;")
content = content.replace("if (item.type === 'diamond' && byPlayer.diamondBuff) val *= 2;", "if (item.type === 'diamond' && byPlayer.gameManager.diamondBuff > 0) val *= 2;")

# Apply patches from patch.py cleanly

# 1. dynamic difficulty
old_1 = r'''    const baseTarget = Math.round\(getBaseLevelTarget\(level\) \* targetScale\);
    const step = Math.round\(getTargetIncreaseForLevel\(level\) \* targetScale\);
    const actualTarget = baseTarget;
    const requiredDelta = Math.max\(0, actualTarget - gameManager.score\);'''
new_1 = r'''    const baseTarget = Math.round(getBaseLevelTarget(level) * targetScale);
    const step = Math.round(getTargetIncreaseForLevel(level) * targetScale);
    let actualTarget = baseTarget;
    const minimalEffort = Math.floor(step * 0.85);
    if (gameManager.score + minimalEffort > baseTarget) {
        const wealthLead = Math.max(0, gameManager.score - baseTarget);
        const wealthTax = Math.floor(wealthLead * 0.12);
        actualTarget = gameManager.score + minimalEffort + wealthTax;
    }
    const requiredDelta = Math.max(0, actualTarget - gameManager.score);'''
content = re.sub(old_1, new_1, content)

# 1.5 currentLevelDelta
content = content.replace(
    "gameManager.initLevel(economy.actualTarget, economy.timeLimit);",
    "gameManager.initLevel(economy.actualTarget, economy.timeLimit);\n    (gameManager as any).currentLevelDelta = economy.requiredDelta;"
)

# 2. HUD target display with correct backticks!
old_2 = r'''document.getElementById\('target-val'\)!.innerText = gameManager.targetScore.toString\(\);'''
new_2 = r'''document.getElementById('target-val')!.innerHTML = `${gameManager.targetScore} <span style="font-size:0.65em; opacity:0.85; font-weight:normal">(需赚: ${(gameManager as any).currentLevelDelta})</span>`;'''
content = re.sub(old_2, new_2, content)

# 3. BonusMissionId and levelStats
old_3 = r'''type BonusMissionId = 'fast_finish' \| 'diamond_hunter' \| 'mystery_hunter' \| 'blast_master' \| 'diamond_pigs' \| 'big_haul' \| 'clean_catches' \| 'gold_focus' \| 'p1_tnt_hit' \| 'p2_tnt_hit' \| 'p1_empty_hooks' \| 'p2_empty_hooks';'''
new_3 = r'''type BonusMissionId = 'fast_finish' | 'diamond_hunter' | 'mystery_hunter' | 'blast_master' | 'diamond_pigs' | 'big_haul' | 'clean_catches' | 'gold_focus' | 'p1_tnt_hit' | 'p2_tnt_hit' | 'p1_empty_hooks' | 'p2_empty_hooks' | 'pacifist' | 'rock_lover' | 'combo_master' | 'precise_aim' | 'heavy_lifter';'''
content = re.sub(old_3, new_3, content)

old_stats = r'''let levelStats = \{
    collected: 0,
    diamonds: 0,
    mystery: 0,
    diamondPigs: 0,
    tntExplosions: 0,
    gold: 0,
    rocks: 0,
    bombsUsed: 0,
\};'''
new_stats = r'''let levelStats = {
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
};'''
content = re.sub(old_stats, new_stats, content)

old_stats_reset = r'''levelStats = \{
        collected: 0,
        diamonds: 0,
        mystery: 0,
        diamondPigs: 0,
        tntExplosions: 0,
        gold: 0,
        rocks: 0,
        bombsUsed: 0,
    \};'''
new_stats_reset = r'''levelStats = {
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
    };'''
content = re.sub(old_stats_reset, new_stats_reset, content)

# 4. Track heavy items and pigs
old_track = r'''if \(item.type === 'diamond'\) levelStats.diamonds\+\+;
    if \(item.type === 'pig' && \(item as any\).hasDiamond\) levelStats.diamondPigs\+\+;
    if \(item.type === 'gold'\) levelStats.gold\+\+;
    if \(item.type === 'rock'\) levelStats.rocks\+\+;'''
new_track = r'''if (item.type === 'diamond') levelStats.diamonds++;
    if (item.type === 'pig') {
        levelStats.pigs++;
        if ((item as any).hasDiamond) levelStats.diamondPigs++;
    }
    if (item.type === 'gold') levelStats.gold++;
    if (item.type === 'rock') levelStats.rocks++;
    if (item.width >= 70) levelStats.heavyItems++;'''
content = re.sub(old_track, new_track, content)

# 5. Missions complete logic
old_bh = r'''case 'big_haul':
            return player1.gatheredValue \+ player2.gatheredValue >= gameManager.targetScore \* 0.35;'''
new_bh = r'''case 'big_haul':
            return player1.gatheredValue + player2.gatheredValue >= Math.ceil(spawnSummary.estimatedValue * 0.35);'''
content = re.sub(old_bh, new_bh, content)

old_emp = r'''case 'p2_empty_hooks':
            return playerRoundStats.P2.emptyHooks >= 2;'''
new_emp = r'''case 'p2_empty_hooks':
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
            return levelStats.heavyItems >= 3;'''
content = re.sub(old_emp, new_emp, content)

old_bh2 = r'''case 'big_haul': \{
            const current = player1.gatheredValue \+ player2.gatheredValue;
            const target = Math.ceil\(gameManager.targetScore \* 0.35\);
            return \$\{Math.min\(current, target\)\}/\$\{target\};
        \}'''
new_bh2 = r'''case 'big_haul': {
            const current = player1.gatheredValue + player2.gatheredValue;
            const target = Math.ceil(spawnSummary.estimatedValue * 0.35);
            return `${Math.min(current, target)}/${target}`;
        }'''
content = re.sub(old_bh2, new_bh2, content)

old_emp2 = r'''case 'p2_empty_hooks':
            return \$\{Math.min\(playerRoundStats.P2.emptyHooks, 2\)\}/2 P2 空钩;'''
new_emp2 = r'''case 'p2_empty_hooks':
            return `${Math.min(playerRoundStats.P2.emptyHooks, 2)}/2 P2 空钩`;
        case 'pacifist':
            return levelStats.pigs === 0 ? '和平保持' : '已伤害小猪';
        case 'rock_lover':
            return `${Math.min(levelStats.rocks, 3)}/3 石头`;
        case 'combo_master':
            return `最高连击 ${bestCombo}/3`;
        case 'precise_aim':
            return (playerRoundStats.P1.emptyHooks + playerRoundStats.P2.emptyHooks) === 0 ? '百发百中' : '已有空钩';
        case 'heavy_lifter':
            return `${Math.min(levelStats.heavyItems, 3)}/3 重物`;'''
content = re.sub(old_emp2, new_emp2, content)

# 6. Mission generation
old_bh3 = r'''if \(summary.estimatedValue >= gameManager.targetScore \* 0.45\) \{
        candidates.push\(\{ id: 'big_haul', label: '奖励任务: 本关收入达到目标 35%', rewardText: '奖励: \+\ 6%', rewardKind: 'money', rewardValue: 0.06 \}\);
    \}'''
new_bh3 = r'''if (summary.estimatedValue > 1000) {
        candidates.push({ id: 'big_haul', label: '奖励任务: 达到本关极高收入 (估值35%)', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.5 });
    }'''
content = re.sub(old_bh3, new_bh3, content)

old_ff = r'''candidates.push\(\{ id: 'fast_finish', label: '奖励任务: 剩余 12 秒过关', rewardText: '奖励: 下关 \+3 秒', rewardKind: 'time', rewardValue: 3 \}\);'''
new_ff = r'''candidates.push({ id: 'fast_finish', label: '奖励任务: 剩余 12 秒过关', rewardText: '奖励: 下关 +3 秒', rewardKind: 'time', rewardValue: 3 });
    
    candidates.push({ id: 'rock_lover', label: '奖励任务: 收集 3 块石头', rewardText: '奖励: 下关石头升值', rewardKind: 'buff' });
    candidates.push({ id: 'combo_master', label: '奖励任务: 达成 3 连击', rewardText: '奖励: 下关幸运符', rewardKind: 'buff' });
    candidates.push({ id: 'precise_aim', label: '奖励任务: 全局 0 空钩', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.2 });
    candidates.push({ id: 'heavy_lifter', label: '奖励任务: 收集 3 个重物', rewardText: '奖励: 下关神力', rewardKind: 'buff' });
    
    if (levelType !== 'pig_parade') {
        candidates.push({ id: 'pacifist', label: '奖励任务: 不伤害 any 小猪', rewardText: '奖励: 额外任务奖金', rewardKind: 'money', rewardValue: 0.8 });
    }'''
content = re.sub(old_ff, new_ff, content)

old_bh4 = r'''\{ id: 'big_haul', label: '奖励任务: 本关收入达到目标 35%', rewardText: '奖励: \+\ 6%', rewardKind: 'money', rewardValue: 0.06 \},'''
new_bh4 = r'''{ id: 'big_haul', label: '奖励任务: 达到本关极高收入', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.5 },'''
content = re.sub(old_bh4, new_bh4, content)

old_emp3 = r'''\{ id: 'p1_empty_hooks', label: '奖励任务: P1 故意勾空 2 次', rewardText: '奖励: \+\ 4%', rewardKind: 'money', rewardValue: 0.04 \},'''
new_emp3 = r'''{ id: 'p1_empty_hooks', label: '奖励任务: P1 故意勾空 2 次', rewardText: '奖励: 小额奖金', rewardKind: 'money', rewardValue: 0.5 },
        { id: 'rock_lover', label: '奖励任务: 收集 3 块石头', rewardText: '奖励: 下关石头升值', rewardKind: 'buff' },
        { id: 'combo_master', label: '奖励任务: 达成 3 连击', rewardText: '奖励: 下关幸运符', rewardKind: 'buff' },
        { id: 'precise_aim', label: '奖励任务: 全局 0 空钩', rewardText: '奖励: 丰厚任务奖金', rewardKind: 'money', rewardValue: 1.2 },
        { id: 'heavy_lifter', label: '奖励任务: 收集 3 个重物', rewardText: '奖励: 下关神力', rewardKind: 'buff' },
        { id: 'pacifist', label: '奖励任务: 不伤害 any 小猪', rewardText: '奖励: 额外任务奖金', rewardKind: 'money', rewardValue: 0.8 },'''
content = re.sub(old_emp3, new_emp3, content)

old_money = r'''const amount = Math.max\(60, Math.floor\(gameManager.targetScore \* \(mission.rewardValue \?\? 0.06\)\)\);'''
new_money = r'''const baseAmount = Math.max(gameManager.currentLevelDelta * 0.15, spawnSummary.estimatedValue * 0.08);
            const amount = Math.max(60, Math.floor(baseAmount * (mission.rewardValue ?? 1)));'''
content = re.sub(old_money, new_money, content)

# 7. New Level Types
old_lt = r'''type LevelType = 'normal' \| 'gold_rush' \| 'diamond_mine' \| 'tnt_gauntlet' \| 'pig_parade' \| 'mystery_box' \| 'treasure_vault';'''
new_lt = r'''type LevelType = 'normal' | 'gold_rush' | 'diamond_mine' | 'tnt_gauntlet' | 'pig_parade' | 'mystery_box' | 'treasure_vault' | 'minefield' | 'tiny_treasures' | 'fossil_dig';'''
content = re.sub(old_lt, new_lt, content)

old_glt = r'''function getLevelType\(level: number\): LevelType \{
    // Special levels follow a pattern
    if \(level % 10 === 0\) return 'treasure_vault';'''
new_glt = r'''function getLevelType(level: number): LevelType {
    // Special levels follow a pattern
    if (level % 12 === 0) return 'minefield';
    if (level % 11 === 0) return 'fossil_dig';
    if (level % 10 === 0) return 'treasure_vault';'''
content = re.sub(old_glt, new_glt, content)

old_glt2 = r'''if \(level % 10 === 0\) return 'treasure_vault'; // Every 10th: vault of gems
    if \(level % 6 === 0\) return 'mystery_box';'''
new_glt2 = r'''if (level % 10 === 0) return 'treasure_vault'; // Every 10th: vault of gems
    if (level % 9 === 0) return 'tiny_treasures';
    if (level % 6 === 0) return 'mystery_box';'''
content = re.sub(old_glt2, new_glt2, content)

old_label = r'''treasure_vault:\s*'👑 宝藏金库',
    \};'''
new_label = r'''treasure_vault: '👑 宝藏金库',
        minefield:      '⚡ 极限雷区',
        tiny_treasures: '🔍 微缩珍宝',
        fossil_dig:     '🪨 顽石矿脉',
    };'''
content = re.sub(old_label, new_label, content)

# 8. New Level Spawning
content = content.replace("default: { // 'normal'", "case 'minefield': {\n            const numTNT = 8 + Math.floor(level / 3);\n            for (let i = 0; i < numTNT; i++) addTNT();\n            for (let i = 0; i < 4; i++) placedValue += addDiamond();\n            for (let i = 0; i < 3; i++) placedValue += addGold('large');\n            break;\n        }\n        case 'tiny_treasures': {\n            const numSmallGold = 10 + Math.floor(level / 2);\n            for (let i = 0; i < numSmallGold; i++) placedValue += addGold('small');\n            const numDiamonds = 3 + Math.floor(level / 4);\n            for (let i = 0; i < numDiamonds; i++) placedValue += addDiamond();\n            const numPigs = 2 + Math.floor(level / 5);\n            for (let i = 0; i < numPigs; i++) placedValue += addPig(false);\n            break;\n        }\n        case 'fossil_dig': {\n            const numRocks = 12 + Math.floor(level / 2);\n            for (let i = 0; i < numRocks; i++) {\n                placedValue += addRock(Math.random() > 0.6 ? 'large' : 'small');\n            }\n            placedValue += addGold('large');\n            placedValue += addDiamond();\n            placedValue += addMystery();\n            break;\n        }\n        default: { // 'normal'")

with open('src/main.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied cleanly in UTF-8 with constructor & buff fixes!")
