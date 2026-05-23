import { GameManager, GameState } from './core/GameManager';
import { Miner } from './entities/Miner';
import { Item } from './entities/Item';
import { Pig } from './entities/Pig';
import { ShopManager } from './core/ShopManager';
import { audioManager } from './core/AudioManager';
import { InputManager } from './core/InputManager';
import { ParticleSystem, FloatingText } from './core/ParticleSystem';
import { LevelGenerator } from './core/LevelGenerator';
import { MissionManager, BonusMission } from './core/MissionManager';
import { HookState } from './entities/Hook';
import { BALANCE } from './core/BalanceConfig';

// Instantiate managers and systems
const gameManager = new GameManager();
const particleSystem = new ParticleSystem();
const inputManager = new InputManager();

// Assign array references to retain compatibility with in-place mutations in main.ts
let floatingTexts = particleSystem.floatingTexts;

// Setup global callbacks/properties on window for reference from other modules
(window as any).spawnSparkles = (x: number, y: number, color: string, count: number) => {
    particleSystem.spawnSparkles(x, y, color, count);
};
(window as any).floatingTexts = floatingTexts;
(window as any).FloatingText = FloatingText;

let currentState: GameState = GameState.START_MENU;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let items: Item[] = [];

// Entities
const player1 = new Miner('P1', canvas.width / 2 - 150, 77, gameManager);
const player2 = new Miner('P2', canvas.width / 2 + 150, 77, gameManager);

(window as any).player1 = player1;
(window as any).player2 = player2;
(window as any).gameManager = gameManager;

const shopManager = new ShopManager(gameManager, player1, player2);

// Mission states
let plannedMission: BonusMission | null = null;
let activeMission: BonusMission | null = null;
let missionChoices: BonusMission[] = [];

// Cumulative career statistics (Lifetime)
let playerCumulativeStats = {
    P1: { totalScore: 0, totalShots: 0, totalHits: 0, totalBombs: 0, totalPigs: 0, totalRocks: 0, totalDiamonds: 0 },
    P2: { totalScore: 0, totalShots: 0, totalHits: 0, totalBombs: 0, totalPigs: 0, totalRocks: 0, totalDiamonds: 0 },
};

// Round specific stats
let levelStats = {
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
    brassGoldCatches: 0,
    coopAlternationFailed: false,
    earlyHighValueCatches: 0,
    syncCatches: 0,
    earlySpeedLimitFailed: false,
    remainingRocks: 0,
    remainingPigs: 0,
};

let playerRoundStats = {
    P1: { gold: 0, diamonds: 0, mystery: 0, diamondPigs: 0, rocks: 0, bombsUsed: 0, tntHits: 0, emptyHooks: 0, pigs: 0, shotsFired: 0 },
    P2: { gold: 0, diamonds: 0, mystery: 0, diamondPigs: 0, rocks: 0, bombsUsed: 0, tntHits: 0, emptyHooks: 0, pigs: 0, shotsFired: 0 },
};

let bestCombo = 0;
let currentCombo = 0;
let comboTimer = 0;
let lastRetrieveMinerName: string | null = null;
let hadLuckyCharmThisLevel = false;
let levelStartScore = 0;
let levelEndBaseMiningGain = 0;
let levelEndTimeBonus = 0;
let levelMissionSucceeded = false;
let debugPanelVisible = false;
let directorPressureMetric = 0;
let prevHudScore = -1;
let prevHudTime = -1;

// Collision Helper
function checkGlobalCollisions(hx: number, hy: number): Item | null {
    for (let item of items) {
        if (item.isGrabbed) continue;
        const dx = hx - item.x;
        const dy = hy - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (item.width / 2) + 8) {
            return item;
        }
    }
    return null;
}

// Sparkle utility on collect
function getSparkleColor(type: string): string {
    switch (type) {
        case 'diamond': return '#22d3ee';
        case 'gold': return '#facc15';
        case 'brass_gold': return '#d97706';
        case 'ancient_key': return '#fbbf24';
        case 'sealed_chest': return '#a78bfa';
        case 'pig': return '#fbcfe8';
        case 'gopher': return '#fecdd3';
        default: return '#e2e8f0';
    }
}

function openMysteryBag(_byPlayer: Miner): { value: number; msg: string; color: string } {
    const level = gameManager.level;
    const isLucky = gameManager.luckyCharm;
    
    if (isLucky) {
        gameManager.luckyCharm = false; // consume it
        const rand = Math.random();
        if (rand < 0.6) {
            const cash = Math.round(400 + Math.floor(Math.random() * 200) + level * 25);  // $400-600 + level scaling
            return { value: cash, msg: `🍀 幸运大奖: 获得奖金 +$${cash}!`, color: '#ffd700' };
        } else if (rand < 0.8) {
            gameManager.bombCount += 3;
            return { value: 0, msg: `🍀 幸运大奖: 获得 3 个大炸弹!`, color: '#f87171' };
        } else {
            gameManager.strengthBuff = Math.max(gameManager.strengthBuff, 3);
            return { value: 0, msg: `🍀 幸运大奖: 获得 3关神力药水!`, color: '#fbbf24' };
        }
    } else {
        const rand = Math.random();
        if (rand < 0.55) {
            const cash = Math.round(150 + Math.floor(Math.random() * 130));  // $150-$280, no level inflation
            return { value: cash, msg: `🎁 神秘袋: 获得奖金 +$${cash}!`, color: '#c084fc' };
        } else if (rand < 0.78) {
            const bombs = Math.random() > 0.5 ? 2 : 1;
            gameManager.bombCount += bombs;
            return { value: 0, msg: `🎁 神秘袋: 获得 ${bombs} 个炸弹!`, color: '#f87171' };
        } else {
            const buffRand = Math.random();
            if (buffRand < 0.4) {
                gameManager.strengthBuff = Math.max(gameManager.strengthBuff, 3);
                return { value: 0, msg: `🎁 神秘袋: 获得 3关神力药水!`, color: '#fbbf24' };
            } else if (buffRand < 0.7) {
                gameManager.cloverBuff = Math.max(gameManager.cloverBuff, 3);
                return { value: 0, msg: `🎁 神秘袋: 获得 3关幸运草!`, color: '#34d399' };
            } else {
                gameManager.diamondBuff = Math.max(gameManager.diamondBuff, 3);
                return { value: 0, msg: `🎁 神秘袋: 获得 3关钻石大亨!`, color: '#22d3ee' };
            }
        }
    }
}

function handleItemCollected(item: Item, byPlayer: Miner) {
    const pKey = byPlayer.name as 'P1' | 'P2';
    playerCumulativeStats[pKey].totalHits++;

    // Alternation Monitoring for co-op
    if (activeMission?.id === 'coop_alternation') {
        if (lastRetrieveMinerName !== null && lastRetrieveMinerName === byPlayer.name) {
            levelStats.coopAlternationFailed = true;
            floatingTexts.push(new FloatingText(canvas.width / 2, 280, "⚠️ 连带违约! P1与P2未能交替抓取!", "#ef4444", 24));
            
            // Apply penalty immediately
            const spawnFT = (text: string, color: string, size?: number) => {
                floatingTexts.push(new FloatingText(canvas.width / 2, 320, text, color, size ?? 20));
            };
            MissionManager.applyBonusMissionPenalty(activeMission, gameManager, spawnFT);
            activeMission = null; // Clear so it doesn't trigger end-of-level penalty again
        } else {
            lastRetrieveMinerName = byPlayer.name;
        }
    }
    
    // Add points & apply buffs
    let val = item.value;
    let mysteryMsg: string | null = null;
    let mysteryColor = '#c084fc';
    let customCollectMsg: string | null = null;
    let customColor = '#4ade80';

    // Open mystery bag if collected directly
    if (item.type === 'mystery') {
        const res = openMysteryBag(byPlayer);
        val = res.value;
        mysteryMsg = res.msg;
        mysteryColor = res.color;
    }

    // Apply synergies / geology buffs
    if (item.type === 'rock') {
        const gm = byPlayer.gameManager;
        if (gm.rockBuff > 0 && gm.alchemyBuff > 0 && gm.geologySledgehammer > 0) {
            val *= 3;
            customCollectMsg = `✨ 炼金废石流 x3!`;
            customColor = '#facc15';
        } else if (gm.rockBuff > 0) {
            val *= 2;
        }
    }

    if (item.type === 'diamond') {
        const gm = byPlayer.gameManager;
        if (gm.diamondBuff > 0 && gm.cloverBuff > 0 && gm.luckyCharm) {
            val = Math.round(val * 2.5);
            customCollectMsg = `💎 幸运钻石流 x2.5!`;
            customColor = '#22d3ee';
        } else if (gm.diamondBuff > 0) {
            val *= 2;
        }
    }

    if (item.type === 'gold' && item.width <= 30) {
        const gm = byPlayer.gameManager;
        if (gm.magnetBuff > 0 && gm.goldRadarActive) {
            val = Math.round(val * 1.2);
            customCollectMsg = `🧲 磁吸雷达增幅 x1.2!`;
            customColor = '#60a5fa';
        }
    }

    if (item.type === 'gold') {
        const gm = byPlayer.gameManager;
        if (gm.goldValueMultiplier > 1.0) {
            val = Math.round(val * gm.goldValueMultiplier);
            customCollectMsg = `✨ 黄金加成 x1.3!`;
            customColor = '#ffd700';
        }
    }

    // Track round and lifetime stats
    levelStats.collected++;
    if (item.type === 'diamond') {
        levelStats.diamonds++;
        playerRoundStats[pKey].diamonds++;
        playerCumulativeStats[pKey].totalDiamonds++;
        
        if (activeMission?.id === 'no_diamonds') {
            floatingTexts.push(new FloatingText(canvas.width / 2, 280, "❌ 违背戒律! 误勾了钻石!", "#ef4444", 24));
            
            // Apply penalty immediately
            const spawnFT = (text: string, color: string, size?: number) => {
                floatingTexts.push(new FloatingText(canvas.width / 2, 320, text, color, size ?? 20));
            };
            MissionManager.applyBonusMissionPenalty(activeMission, gameManager, spawnFT);
            activeMission = null; // Clear active mission immediately
        }
    }
    if (item.type === 'mystery') {
        levelStats.mystery++;
        playerRoundStats[pKey].mystery++;
    }
    if (item.type === 'pig') {
        levelStats.pigs++;
        playerRoundStats[pKey].pigs++;
        playerCumulativeStats[pKey].totalPigs++;
        if ((item as any).hasDiamond) {
            levelStats.diamondPigs++;
            playerRoundStats[pKey].diamondPigs++;
        }
        // Pig carrying a mystery bag triggers mystery open
        if ((item as Pig).hasMystery) {
            const res = openMysteryBag(byPlayer);
            val += res.value;
            mysteryMsg = `🐷 捕获神秘猪! ${res.msg}`;
            mysteryColor = res.color;
            levelStats.mystery++;
            playerRoundStats[pKey].mystery++;
        }
    }
    if (item.type === 'gold') {
        levelStats.gold++;
        playerRoundStats[pKey].gold++;
    }
    if (item.type === 'rock') {
        levelStats.rocks++;
        playerRoundStats[pKey].rocks++;
        playerCumulativeStats[pKey].totalRocks++;
    }
    if (item.width >= 70) {
        levelStats.heavyItems++;
    }
    
    // Phase 3: early_speed_capture check
    if (activeMission?.id === 'early_speed_capture' && gameManager.timeRemaining >= 40.0) {
        if (item.value >= 200 || val >= 200) {
            levelStats.earlyHighValueCatches = (levelStats.earlyHighValueCatches ?? 0) + 1;
            floatingTexts.push(new FloatingText(item.x, item.y - 60, `⚡ 速抓成功! (${levelStats.earlyHighValueCatches}/3)`, "#38bdf8", 22));
        }
    }

    // Phase 3: sync_hooks_launch check
    if (activeMission?.id === 'sync_hooks_launch' && gameManager.playerCount === 2) {
        const otherPlayer = byPlayer === player1 ? player2 : player1;
        if (otherPlayer.hook.state === HookState.RETRACTING && otherPlayer.hook.grabbedItem !== null) {
            levelStats.syncCatches = (levelStats.syncCatches ?? 0) + 1;
            floatingTexts.push(new FloatingText(canvas.width / 2, 260, `💜 同步收线! (${levelStats.syncCatches}/3)`, "#c084fc", 24));
        }
    }
    if (item.type === 'ancient_key') {
        (gameManager as any).teamHasKey = true;
        floatingTexts.push(new FloatingText(item.x, item.y - 20, "🔑 获得古老钥匙! 宝箱已解锁", "#22c55e", 20));
    }
    if (item.type === 'sealed_chest') {
        floatingTexts.push(new FloatingText(item.x, item.y - 20, "💎 打开远古宝箱! 获得 $1500", "#a78bfa", 22));
    }
    if (item.type === 'brass_gold') {
        levelStats.brassGoldCatches = (levelStats.brassGoldCatches ?? 0) + 1;
        if (activeMission?.id === 'brass_deception') {
            floatingTexts.push(new FloatingText(canvas.width / 2, 280, "❌ 欺诈违约! 抓到了黄铜矿石!", "#ef4444", 24));
            
            // Shatter animation
            (window as any).spawnSparkles(item.x, item.y, '#7c2d12', 20);
            (window as any).spawnSparkles(item.x, item.y, '#4b5563', 15);
            
            // Apply penalty immediately
            const spawnFT = (text: string, color: string, size?: number) => {
                floatingTexts.push(new FloatingText(canvas.width / 2, 320, text, color, size ?? 20));
            };
            MissionManager.applyBonusMissionPenalty(activeMission, gameManager, spawnFT);
            activeMission = null; // Clear so it doesn't trigger end-of-level penalty again
        }
    }

    // Fever Mode Value Multiplier: +30% earnings (reduced from 1.5x)
    if (gameManager.feverTimer > 0) {
        val = Math.round(val * BALANCE.feverValueMultiplier);
    }

    gameManager.addScore(val);
    byPlayer.gatheredValue += val;

    // Apply Tribute Amp Co-op bonus
    if (item.type === 'diamond' && byPlayer.gameManager.tributeAmpBuff > 0 && byPlayer.gameManager.playerCount === 2) {
        const shareVal = Math.round(val * 0.5);
        const otherKey = pKey === 'P1' ? 'P2' : 'P1';
        const otherPlayer = byPlayer.name === 'P1' ? player2 : player1;
        
        gameManager.addScore(shareVal);
        otherPlayer.gatheredValue += shareVal;
        playerRoundStats[otherKey].gold += shareVal;
        
        floatingTexts.push(new FloatingText(item.x, item.y - 50, `📡 协作分红: 给 ${otherKey} +$${shareVal}!`, "#a78bfa", 22));
    }

    // Sparkles
    (window as any).spawnSparkles(item.x, item.y, getSparkleColor(item.type), 15);
    
    // Combo Handling
    currentCombo++;
    comboTimer = 3.5; // combo stays for 3.5 seconds
    if (currentCombo > bestCombo) {
        bestCombo = currentCombo;
        levelStats.maxCombo = bestCombo;
    }

    // Trigger Fever Mode — requires x5 combo or a diamond (x3 was too easy)
    let isFeverTriggered = false;
    if (currentCombo >= 5) {
        if (gameManager.feverTimer <= 0) isFeverTriggered = true;
        gameManager.feverTimer = Math.min(gameManager.feverTimer + 3.0, 8.0); // max 8s
    } else if (item.type === 'diamond') {
        if (gameManager.feverTimer <= 0) isFeverTriggered = true;
        gameManager.feverTimer = Math.min(gameManager.feverTimer + 3.0, 8.0); // diamond gives +3s
    }

    if (isFeverTriggered) {
        floatingTexts.push(new FloatingText(canvas.width / 2, 200, "🔥 FEVER MODE! 狂热降临!", "#facc15", 36));
        floatingTexts.push(new FloatingText(canvas.width / 2, 240, "拉速 1.3x ⚡ & 价值 1.3x 💰", "#ffd700", 22));
    }
    
    if (mysteryMsg) {
        floatingTexts.push(new FloatingText(item.x, item.y - 30, mysteryMsg, mysteryColor, 22));
    } else if (customCollectMsg) {
        floatingTexts.push(new FloatingText(item.x, item.y - 30, `${customCollectMsg} +$${val}`, customColor, 22));
    } else if (currentCombo >= 2) {
        // Combo bonus capped at 2% of level delta (prevents runaway inflation)
        const levelDeltaRef = (gameManager as any).currentLevelDelta ?? 600;
        const comboBonus = Math.min(
            Math.round(BALANCE.comboBonusPerStack * currentCombo),
            Math.round(levelDeltaRef * BALANCE.comboBonusMaxDeltaRatio)
        );
        floatingTexts.push(new FloatingText(item.x, item.y - 45, `Combo x${currentCombo}! +$${comboBonus}`, "#fbbf24", 24));
        gameManager.addScore(comboBonus);
        byPlayer.gatheredValue += comboBonus;
    } else {
        floatingTexts.push(new FloatingText(item.x, item.y - 30, `+$${val}`, "#4ade80", 20));
    }

    audioManager.playMoney();

    const index = items.indexOf(item);
    if (index > -1) {
        items.splice(index, 1);
    }
}

function handleBombUsed(item: Item) {
    levelStats.bombsUsed++;
    floatingTexts.push(new FloatingText(item.x, item.y - 20, "💥 爆破成功!", "#f87171", 20));
    (window as any).spawnSparkles(item.x, item.y, '#f87171', 20);
    
    const index = items.indexOf(item);
    if (index > -1) {
        items.splice(index, 1);
    }

    // Chain Bomb: if active, nearby TNT barrels also explode!
    if (gameManager.chainBombActive) {
        const nearbyTNT = items.filter(i => {
            if (i.type !== 'tnt') return false;
            const d = Math.sqrt((i.x - item.x) ** 2 + (i.y - item.y) ** 2);
            return d < 180;
        });
        nearbyTNT.forEach(tntItem => {
            floatingTexts.push(new FloatingText(tntItem.x, tntItem.y - 10, "🔗💥 连锁引爆!", "#f97316", 22));
            (window as any).spawnSparkles(tntItem.x, tntItem.y, '#f87171', 28);
            // TNT blast radius
            items.filter(i => {
                const d = Math.sqrt((i.x - tntItem.x) ** 2 + (i.y - tntItem.y) ** 2);
                return d < 130 && i !== tntItem;
            }).forEach(i => {
                (window as any).spawnSparkles(i.x, i.y, '#fbbf24', 8);
                const idx = items.indexOf(i);
                if (idx > -1) items.splice(idx, 1);
            });
            const idx = items.indexOf(tntItem);
            if (idx > -1) items.splice(idx, 1);
        });
        if (nearbyTNT.length > 0) audioManager.playBomb();
    }
}

player1.hook.checkCollision = checkGlobalCollisions;
player1.hook.onCollected = (item) => handleItemCollected(item, player1);
player1.hook.onBombUsed = handleBombUsed;
player1.hook.onTNTHit = (tntItem) => {
    levelStats.tntExplosions++;
    playerRoundStats.P1.tntHits++;
    audioManager.playBomb();
    floatingTexts.push(new FloatingText(tntItem.x, tntItem.y, "💣 炸药桶引爆!", "#ef4444", 20));
    (window as any).spawnSparkles(tntItem.x, tntItem.y, '#f87171', 30);
    // Destroy items within range
    items.filter(i => {
        const d = Math.sqrt((i.x - tntItem.x) ** 2 + (i.y - tntItem.y) ** 2);
        return d < 130 && i !== tntItem;
    }).forEach(i => {
        (window as any).spawnSparkles(i.x, i.y, '#fbbf24', 8);
        const idx = items.indexOf(i);
        if (idx > -1) items.splice(idx, 1);
    });
    const idx = items.indexOf(tntItem);
    if (idx > -1) items.splice(idx, 1);
};
player1.hook.onMiss = () => {
    playerRoundStats.P1.emptyHooks++;
};

player2.hook.checkCollision = checkGlobalCollisions;
player2.hook.onCollected = (item) => handleItemCollected(item, player2);
player2.hook.onBombUsed = handleBombUsed;
player2.hook.onTNTHit = (tntItem) => {
    levelStats.tntExplosions++;
    playerRoundStats.P2.tntHits++;
    audioManager.playBomb();
    floatingTexts.push(new FloatingText(tntItem.x, tntItem.y, "💣 炸药桶引爆!", "#ef4444", 20));
    (window as any).spawnSparkles(tntItem.x, tntItem.y, '#f87171', 30);
    items.filter(i => {
        const d = Math.sqrt((i.x - tntItem.x) ** 2 + (i.y - tntItem.y) ** 2);
        return d < 130 && i !== tntItem;
    }).forEach(i => {
        (window as any).spawnSparkles(i.x, i.y, '#fbbf24', 8);
        const idx = items.indexOf(i);
        if (idx > -1) items.splice(idx, 1);
    });
    const idx = items.indexOf(tntItem);
    if (idx > -1) items.splice(idx, 1);
};
player2.hook.onMiss = () => {
    playerRoundStats.P2.emptyHooks++;
};

// Controls
inputManager.bindInputs(
    player1,
    player2,
    gameManager,
    () => {
        playerCumulativeStats.P1.totalShots++;
        playerRoundStats.P1.shotsFired++;
    },
    () => {
        playerCumulativeStats.P2.totalShots++;
        playerRoundStats.P2.shotsFired++;
    },
    () => {
        playerCumulativeStats.P1.totalBombs++;
        levelStats.bombsUsed++;
        playerRoundStats.P1.bombsUsed++;
    },
    () => {
        playerCumulativeStats.P2.totalBombs++;
        levelStats.bombsUsed++;
        playerRoundStats.P2.bombsUsed++;
    }
);

// UI
const uiStartMenu = document.getElementById('start-menu')!;
const uiHud = document.getElementById('hud')!;
const uiShopMenu = document.getElementById('shop-menu')!;
const uiGameOver = document.getElementById('game-over-menu')!;
const btnStart = document.getElementById('btn-start')!;
const btnSingle = document.getElementById('btn-single')!;
const btnCoop = document.getElementById('btn-coop')!;

btnSingle.addEventListener('click', () => {
    gameManager.playerCount = 1;
    btnSingle.classList.add('selected');
    btnCoop.classList.remove('selected');
});

btnCoop.addEventListener('click', () => {
    gameManager.playerCount = 2;
    btnCoop.classList.add('selected');
    btnSingle.classList.remove('selected');
});

btnStart.addEventListener('click', () => {
    uiStartMenu.classList.add('hidden');
    uiHud.classList.remove('hidden');
    audioManager.playBuy();
    startGame();
});

document.getElementById('btn-next-level')!.addEventListener('click', () => {
    uiShopMenu.classList.add('hidden');
    uiHud.classList.remove('hidden');
    audioManager.playBuy();
    gameManager.level++;
    startGame();
});

document.getElementById('btn-restart')!.addEventListener('click', () => {
    uiGameOver.classList.add('hidden');
    uiHud.classList.remove('hidden');
    audioManager.playBuy();
    gameManager.level = 1;
    gameManager.score = 0;
    
    // Reset cumulative stats
    playerCumulativeStats.P1 = { totalScore: 0, totalShots: 0, totalHits: 0, totalBombs: 0, totalPigs: 0, totalRocks: 0, totalDiamonds: 0 };
    playerCumulativeStats.P2 = { totalScore: 0, totalShots: 0, totalHits: 0, totalBombs: 0, totalPigs: 0, totalRocks: 0, totalDiamonds: 0 };

    startGame();
});

// PAUSE SYSTEM
const uiPauseMenu = document.getElementById('pause-menu')!;
const btnPause = document.getElementById('btn-pause')!;
let isPaused = false;

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        uiPauseMenu.classList.remove('hidden');
        audioManager.playGrab();
    } else {
        uiPauseMenu.classList.add('hidden');
        audioManager.playBuy();
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

btnPause.addEventListener('click', togglePause);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        togglePause();
    }
});
document.getElementById('btn-resume')?.addEventListener('click', togglePause);
document.addEventListener('keydown', (e) => {
    if (e.key === 'F9') {
        debugPanelVisible = !debugPanelVisible;
    }
});

function nt() {
    const preview = document.getElementById('next-mission-preview');
    if (!preview || missionChoices.length === 0) return;

    preview.innerHTML = `
        <span>⚙️ 选择下一关黑市合同 (挑战任务)</span>
        <div class="mission-choice-grid">
            ${missionChoices.map((m, idx) => {
                const isSelected = plannedMission?.id === m.id;
                let diffBadge = '';
                if (m.difficulty === 'easy') diffBadge = '<span class="diff-badge easy">简单</span>';
                if (m.difficulty === 'medium') diffBadge = '<span class="diff-badge medium">中等</span>';
                if (m.difficulty === 'hard') diffBadge = '<span class="diff-badge hard">极难</span>';

                return `
                    <button class="mission-choice ${isSelected ? 'selected' : ''}" data-mission-index="${idx}">
                        <div class="mission-header-row">
                            <strong>🎯 ${m.label.replace('任务: ', '')}</strong>
                            ${diffBadge}
                        </div>
                        <div class="mission-details">
                            <span class="mission-reward">🎁 ${MissionManager.getMissionRewardText(m, gameManager.level)}</span>
                            <span class="mission-penalty">💀 惩罚: ${MissionManager.getMissionPenaltyText(m, gameManager.level)}</span>
                        </div>
                    </button>
                `;
            }).join('')}
        </div>
        <small class="shop-hint">💡 难度越高，黑市奖励越惊人，但合同违约惩罚将面临巨额金币罚款 and 禁钩限制！</small>
    `;

    preview.querySelectorAll('.mission-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number((btn as HTMLElement).dataset.missionIndex ?? 0);
            plannedMission = missionChoices[idx] ?? missionChoices[0];
            audioManager.playBuy();
            nt();
        });
    });
}


let lastTime = 0;

function gameLoop(timestamp: number) {
    if (isPaused) return;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    if (currentState === GameState.PLAYING) {
        requestAnimationFrame(gameLoop);
    }
}

// Side Panels Cumulative Stats Render helper
function updateDetailPanels() {
    // P1
    const p1Share = gameManager.score > 0 ? Math.round((player1.gatheredValue / gameManager.score) * 100) : 0;
    document.getElementById('p1-detail-score')!.innerText = `$${playerCumulativeStats.P1.totalScore}`;
    document.getElementById('p1-detail-share')!.innerText = `${p1Share}%`;
    document.getElementById('p1-detail-gems')!.innerText = `${playerCumulativeStats.P1.totalRocks} / ${playerCumulativeStats.P1.totalDiamonds}`;
    document.getElementById('p1-detail-special')!.innerText = `0 / ${playerCumulativeStats.P1.totalPigs}`;
    document.getElementById('p1-detail-risk')!.innerText = `${playerCumulativeStats.P1.totalBombs} / 0`;
    document.getElementById('p1-detail-empty')!.innerText = `${playerRoundStats.P1.emptyHooks}`;

    // P2
    const p2Share = gameManager.score > 0 ? Math.round((player2.gatheredValue / gameManager.score) * 100) : 0;
    document.getElementById('p2-detail-score')!.innerText = `$${playerCumulativeStats.P2.totalScore}`;
    document.getElementById('p2-detail-share')!.innerText = `${p2Share}%`;
    document.getElementById('p2-detail-gems')!.innerText = `${playerCumulativeStats.P2.totalRocks} / ${playerCumulativeStats.P2.totalDiamonds}`;
    document.getElementById('p2-detail-special')!.innerText = `0 / ${playerCumulativeStats.P2.totalPigs}`;
    document.getElementById('p2-detail-risk')!.innerText = `${playerCumulativeStats.P2.totalBombs} / 0`;
    document.getElementById('p2-detail-empty')!.innerText = `${playerRoundStats.P2.emptyHooks}`;
}

function update(dt: number) {
    gameManager.update(dt);
    
    // update combo timers
    if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) {
            currentCombo = 0;
        }
    }

    // Sparkles & Floating texts updates
    particleSystem.update(dt);

    // Crystal Shield / Freeze Time activation notifications
    if ((gameManager as any).shieldJustActivated) {
        (gameManager as any).shieldJustActivated = false;
        floatingTexts.push(new FloatingText(canvas.width / 2, 230, '💎 晶石护盾激活! 获得 20 秒紧急时间!', '#a78bfa', 30));
        floatingTexts.push(new FloatingText(canvas.width / 2, 270, '⚡ 最后机会 — 全力出击!', '#f9a8d4', 20));
        (window as any).spawnSparkles(canvas.width / 2, 300, '#a78bfa', 40);
    }
    if ((gameManager as any).freezeJustActivated) {
        (gameManager as any).freezeJustActivated = false;
        floatingTexts.push(new FloatingText(canvas.width / 2, 230, '⏱️ 凝时沙漏触发! 额外 8 秒!', '#38bdf8', 30));
        floatingTexts.push(new FloatingText(canvas.width / 2, 270, '🌊 时间凝固 — 抢收最后一批!', '#7dd3fc', 20));
        (window as any).spawnSparkles(canvas.width / 2, 300, '#38bdf8', 35);
    }

    // V2: Early level finish check (when all grabable items are empty)
    if (currentState === GameState.PLAYING && items.length === 0 && player1.hook.grabbedItem === null && player2.hook.grabbedItem === null) {
        gameManager.timeRemaining = 0;
    }

    if (currentState !== gameManager.currentState) {
        currentState = gameManager.currentState;
        if (currentState === GameState.SHOP) {
            uiHud.classList.add('hidden');
            uiShopMenu.classList.remove('hidden');
            
            // Sync career cumulative round score
            playerCumulativeStats.P1.totalScore += player1.gatheredValue;
            playerCumulativeStats.P2.totalScore += player2.gatheredValue;
            
            // Check active mission contract result
            if (activeMission) {
                const complete = MissionManager.isBonusMissionComplete(activeMission, gameManager, levelStats, playerRoundStats);
                levelMissionSucceeded = complete;
                const spawnFT = (text: string, color: string, size?: number) => {
                    floatingTexts.push(new FloatingText(canvas.width / 2, 240, text, color, size ?? 20));
                };
                if (complete) {
                    MissionManager.applyBonusMissionReward(activeMission, gameManager, spawnFT);
                } else {
                    MissionManager.applyBonusMissionPenalty(activeMission, gameManager, spawnFT);
                }
            }

            // Lucky Diamond Synergy: 50% chance to retain luckyCharm at end of level (so it isn't consumed/cleared).
            if (gameManager.luckyCharm || hadLuckyCharmThisLevel) {
                if (gameManager.diamondBuff > 0 && gameManager.cloverBuff > 0) {
                    if (Math.random() < 0.5) {
                        gameManager.luckyCharm = true;
                        floatingTexts.push(new FloatingText(canvas.width / 2, 260, "🍀 幸运钻石流: 成功保留幸运符!", "#34d399", 22));
                    } else {
                        gameManager.luckyCharm = false;
                    }
                } else {
                    gameManager.luckyCharm = false; // expires
                }
            }

            // Prep next level mission contracts
            missionChoices = MissionManager.generateMissionChoices();
            plannedMission = missionChoices[0]; // default to left easy/med option
            nt();

            // Calculate level end time remaining bonus:
            // $15/s remaining if Soft Target is cleared, and $30/s if Hard Target is cleared.
            const multiplier = gameManager.hasAchievedHardTarget
                ? BALANCE.hardTimeBonusPerSecond
                : BALANCE.softTimeBonusPerSecond;
            const timeBonusEarned = Math.round(gameManager.levelEndRemainingTime * multiplier);
            levelEndBaseMiningGain = Math.max(0, gameManager.score - levelStartScore);
            levelEndTimeBonus = timeBonusEarned;
            if (timeBonusEarned > 0) {
                gameManager.addScore(timeBonusEarned);
            }
            const emptyHooks = playerRoundStats.P1.emptyHooks + playerRoundStats.P2.emptyHooks;
            const bombsUsed = levelStats.bombsUsed;
            directorPressureMetric = emptyHooks * 0.22 + bombsUsed * 0.18;
            gameManager.reportLevelOutcome(
                levelEndBaseMiningGain + levelEndTimeBonus,
                levelMissionSucceeded,
                directorPressureMetric
            );

            // Level summary details
            const summary = document.getElementById('level-summary')!;
            const cols = gameManager.playerCount === 2 ? 9 : 8;
            summary.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
            
            const p2Cell = gameManager.playerCount === 2 ? `
                <div class="summary-cell">
                    <span>💰 P2 采矿所得</span>
                    <strong>$${player2.gatheredValue}</strong>
                </div>
            ` : '';
            
            let repColor = '#facc15'; // yellow for 0
            if (gameManager.reputation > 0) {
                repColor = '#22c55e'; // green
            } else if (gameManager.reputation < 0) {
                repColor = '#ef4444'; // red
            }

            summary.innerHTML = `
                <div class="summary-cell">
                    <span>💰 P1 采矿所得</span>
                    <strong>$${player1.gatheredValue}</strong>
                </div>
                ${p2Cell}
                <div class="summary-cell">
                    <span>⏱️ 时间奖励${gameManager.hasAchievedHardTarget ? ' (双倍!)' : ''}</span>
                    <strong>$${timeBonusEarned} <small style="font-size:0.6em; font-weight:normal">(${Math.ceil(gameManager.levelEndRemainingTime)}s × $${multiplier})</small></strong>
                </div>
                <div class="summary-cell">
                    <span>💣 炸弹库存</span>
                    <strong>${gameManager.bombCount} 个</strong>
                </div>
                <div class="summary-cell">
                    <span>⭐ 黑市声望</span>
                    <strong style="color: ${repColor}">${gameManager.reputation}</strong>
                </div>
                <div class="summary-cell">
                    <span>📍 当前关卡</span>
                    <strong>第 ${gameManager.level} 关</strong>
                </div>
                <div class="summary-cell">
                    <span>✨ 全队总资产</span>
                    <strong class="val-green">$${gameManager.score}</strong>
                </div>
                <div class="summary-cell">
                    <span>📊 本关矿层收益</span>
                    <strong>$${levelEndBaseMiningGain}</strong>
                </div>
                <div class="summary-cell">
                    <span>🧠 随机调节系数</span>
                    <strong>x${gameManager.levelDirectorFactor.toFixed(2)}</strong>
                </div>
                <div class="summary-cell">
                    <span>🧪 Director 原因</span>
                    <strong>${gameManager.directorLastReason}</strong>
                </div>
            `;

            shopManager.renderShop(document.querySelector('.shop-items') as HTMLElement);
        } else if (currentState === GameState.GAME_OVER) {
            uiHud.classList.add('hidden');
            uiGameOver.classList.remove('hidden');
            audioManager.playBomb();
            document.getElementById('final-score')!.innerText = gameManager.score.toString();
        }
    }

    if (currentState === GameState.PLAYING) {
        player1.update(dt);
        if (gameManager.playerCount === 2) {
            player2.update(dt);
        }
        items.forEach(i => i.update(dt));

        // update remaining count stats for contracts
        if (activeMission) {
            levelStats.remainingRocks = items.filter(i => i.type === 'rock').length;
            levelStats.remainingPigs = items.filter(i => i.type === 'pig').length;
        }

        // Check if early speed capture failed
        if (activeMission?.id === 'early_speed_capture' && !levelStats.earlySpeedLimitFailed) {
            if (gameManager.timeRemaining < 40.0) {
                if (levelStats.earlyHighValueCatches < 3) {
                    levelStats.earlySpeedLimitFailed = true;
                    floatingTexts.push(new FloatingText(canvas.width / 2, 280, "❌ 限时违约! 开局 20 秒内未能速抓 3 个大件!", "#ef4444", 24));
                    
                    const spawnFT = (text: string, color: string, size?: number) => {
                        floatingTexts.push(new FloatingText(canvas.width / 2, 320, text, color, size ?? 20));
                    };
                    MissionManager.applyBonusMissionPenalty(activeMission, gameManager, spawnFT);
                    activeMission = null; // Clear active mission immediately
                }
            }
        }
        
        // hook lock reduction
        if ((gameManager as any).hookLockRemaining > 0) {
            (gameManager as any).hookLockRemaining -= dt;
        }

        // track active mission HUD card
        if (activeMission) {
            const card = document.getElementById('mission-card')!;
            card.classList.remove('hidden');
            document.getElementById('mission-title')!.innerText = activeMission.label.replace('任务: ', '');
            const isDone = MissionManager.isBonusMissionComplete(activeMission, gameManager, levelStats, playerRoundStats);
            const statusNode = document.getElementById('mission-status')!;
            statusNode.className = `mission-status ${isDone ? 'done' : 'running'}`;
            statusNode.innerText = isDone ? '🟢 已达成' : `🔴 进行中 (${MissionManager.getBonusMissionProgress(activeMission, gameManager, levelStats, playerRoundStats)})`;
        } else {
            document.getElementById('mission-card')!.classList.add('hidden');
        }

        // detail panels live update
        updateDetailPanels();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw elegant light warm ivory cream earth background
    ctx.fillStyle = '#ebdccb'; // Light champagne warm earth
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw beautiful geology wavy layers to give premium texture
    ctx.save();
    ctx.strokeStyle = 'rgba(223, 205, 186, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.bezierCurveTo(280, 290, 720, 360, canvas.width, 310);
    ctx.moveTo(0, 540);
    ctx.bezierCurveTo(320, 580, 680, 500, canvas.width, 550);
    ctx.stroke();
    ctx.restore();

    // Draw sky line (warm pastel light sky)
    ctx.fillStyle = '#fef6e4';
    ctx.fillRect(0, 0, canvas.width, 120);

    // Draw a nice polished golden divider at the bottom of the sky/top of earth
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 118, canvas.width, 3);

    // Draw nice cloud decorations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(150, 45, 20, 0, Math.PI * 2);
    ctx.arc(180, 35, 30, 0, Math.PI * 2);
    ctx.arc(210, 45, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(800, 55, 18, 0, Math.PI * 2);
    ctx.arc(825, 45, 25, 0, Math.PI * 2);
    ctx.arc(850, 55, 18, 0, Math.PI * 2);
    ctx.fill();

    // Draw procedural items
    items.forEach(i => i.draw(ctx));

    // Draw miners
    player1.draw(ctx);
    if (gameManager.playerCount === 2) {
        player2.draw(ctx);
    }

    // Sparkles and text effects
    particleSystem.draw(ctx);

    // Gold Radar: draw value labels on all visible items
    if (currentState === GameState.PLAYING && gameManager.goldRadarActive) {
        ctx.save();
        items.forEach(item => {
            if (item.value > 0) {
                const label = `$${item.value}`;
                ctx.font = 'bold 11px "Outfit", Arial';
                const w = ctx.measureText(label).width + 8;
                // Background pill
                ctx.fillStyle = 'rgba(0,0,0,0.62)';
                const bx = item.x - w / 2;
                const by = item.y - (item.height ?? 30) / 2 - 22;
                ctx.beginPath();
                ctx.roundRect(bx, by, w, 16, 4);
                ctx.fill();
                // Gold text
                ctx.fillStyle = '#fbbf24';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, item.x, by + 8);
            }
        });
        ctx.restore();
    }

    // Update HUD labels with pulse feedback on key number changes
    const scoreEl = document.getElementById('score-val')!;
    scoreEl.innerText = gameManager.score.toString();
    if (prevHudScore >= 0 && gameManager.score !== prevHudScore) {
        scoreEl.classList.remove('hud-pulse');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('hud-pulse');
    }
    prevHudScore = gameManager.score;
    
    // Target display with Required Delta and Hard Target
    const needToSoft = Math.max(0, gameManager.targetScore - gameManager.score);
    document.getElementById('target-val')!.innerHTML = `${gameManager.targetScore} / 卓越: $${gameManager.hardTargetScore} <span style="font-size:0.65em; opacity:0.85; font-weight:normal">(需: $${needToSoft})</span>`;
    
    const timeEl = document.getElementById('time-val')!;
    const ceilTime = Math.ceil(gameManager.timeRemaining);
    timeEl.innerText = ceilTime.toString();
    if (prevHudTime >= 0 && ceilTime < prevHudTime && ceilTime <= 10) {
        timeEl.classList.remove('hud-critical');
        void timeEl.offsetWidth;
        timeEl.classList.add('hud-critical');
    }
    prevHudTime = ceilTime;
    document.getElementById('level-val')!.innerText = gameManager.level.toString();

    // Update reputation value on HUD
    const repValEl = document.getElementById('reputation-val');
    if (repValEl) {
        repValEl.innerText = gameManager.reputation.toString();
        if (gameManager.reputation > 0) {
            repValEl.style.color = '#22c55e'; // Green
        } else if (gameManager.reputation < 0) {
            repValEl.style.color = '#ef4444'; // Red
        } else {
            repValEl.style.color = '#facc15'; // Yellow
        }
    }
    
    // Level type label
    const levelLabel = document.getElementById('level-type-label')!;
    const levelType = (gameManager as any).activeLevelType ?? 'normal';
    if (levelType === 'treasure_vault') levelLabel.innerHTML = '👑 宝藏金库';
    else if (levelType === 'minefield') levelLabel.innerHTML = '⚡ 极限雷区';
    else if (levelType === 'tiny_treasures') levelLabel.innerHTML = '🔍 微缩珍宝';
    else if (levelType === 'fossil_dig') levelLabel.innerHTML = '🪨 顽石矿脉';
    else if (levelType === 'mystery_box') levelLabel.innerHTML = '📦 神秘盒子';
    else if (levelType === 'gold_rush') levelLabel.innerHTML = '👑 黄金狂热';
    else if (levelType === 'diamond_mine') levelLabel.innerHTML = '💎 璀璨钻石';
    else if (levelType === 'tnt_gauntlet') levelLabel.innerHTML = '💣 炸药雷场';
    else if (levelType === 'pig_parade') levelLabel.innerHTML = '🐷 欢闹猪群';
    else levelLabel.innerHTML = '普通关卡';

    // Fever Mode visual aura
    if (gameManager.feverTimer > 0) {
        ctx.save();
        const pulse = Math.sin(performance.now() * 0.015) * 0.5 + 0.5;
        // Pulse gradient border
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, `rgba(234, 179, 8, ${0.08 + pulse * 0.12})`);
        grad.addColorStop(0.5, `rgba(239, 68, 68, ${0.04 + pulse * 0.08})`);
        grad.addColorStop(1, `rgba(234, 179, 8, ${0.08 + pulse * 0.12})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 14;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Golden sparkles drifting down
        ctx.fillStyle = `rgba(253, 224, 71, ${0.35 + pulse * 0.35})`;
        for (let i = 0; i < 6; i++) {
            const sx = (performance.now() * 0.07 + i * 160) % canvas.width;
            const sy = (performance.now() * 0.045 + i * 110) % (canvas.height - 120) + 120;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5 + (i % 2.5), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Pulsing "FEVER MODE" text at top center
        ctx.save();
        ctx.fillStyle = '#ca8a04';
        ctx.font = 'bold 22px "Outfit", Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.fillText(`🔥 狂热模式: ${gameManager.feverTimer.toFixed(1)}s`, canvas.width / 2, 45);
        ctx.restore();
    }

    // Update target progress bar towards Hard Target
    const ratio = Math.min(1.0, gameManager.score / gameManager.hardTargetScore);
    const fillEl = document.getElementById('target-progress-fill')!;
    fillEl.style.width = `${ratio * 100}%`;

    // Position soft target tick mark
    const tickLeft = (gameManager.targetScore / gameManager.hardTargetScore) * 100;
    const tickEl = document.getElementById('target-progress-tick');
    if (tickEl) {
        tickEl.style.left = `${tickLeft}%`;
    }

    // Dynamic color based on targets achieved
    if (gameManager.score >= gameManager.hardTargetScore) {
        fillEl.style.background = 'linear-gradient(90deg, #facc15, #ca8a04)'; // Golden
    } else if (gameManager.score >= gameManager.targetScore) {
        fillEl.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)'; // Green
    } else {
        fillEl.style.background = 'linear-gradient(90deg, #f97316, #eab308)'; // Orange/yellow
    }

    if (debugPanelVisible) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(16, 130, 330, 128);
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '13px monospace';
        ctx.fillText('DEBUG (F9)', 28, 152);
        ctx.fillText(`delta: ${gameManager.currentLevelDelta}`, 28, 174);
        ctx.fillText(`director: x${gameManager.levelDirectorFactor.toFixed(2)} (${gameManager.directorLastReason})`, 28, 194);
        ctx.fillText(`base_gain: ${levelEndBaseMiningGain}`, 28, 214);
        ctx.fillText(`pressure: ${directorPressureMetric.toFixed(2)}`, 28, 234);
        ctx.fillText(`streak L/H: ${gameManager.lowYieldStreak}/${gameManager.highYieldStreak}`, 28, 254);
        ctx.restore();
    }
}

// ============================================================
// Level Delta Formula: pure incremental target, independent of
// cumulative score. This ensures challenge ALWAYS scales with
// level number, never degrades to score+200.
// ============================================================
function computeLevelDelta(level: number, playerCount: number): number {
    // Linear base: $350 per level. Acceleration from L6+ via +50*(L-5)^2.
    const baseDelta = 350 * level + Math.max(0, level - 5) * 50 * Math.max(0, level - 5);
    // Double player needs ~1.7x (cooperative efficiency — not a full 2x)
    const factor = playerCount === 2 ? 1.7 : 1.0;
    return Math.round(baseDelta * factor);
    // L1: single=350, double=595
    // L3: single=1050, double=1785
    // L5: single=1750, double=2975
    // L8: single=3250, double=5525
}

function startGame() {
    currentState = GameState.PLAYING;
    audioManager.playBGM();

    const level = gameManager.level;

    // Apply mission contract chosen
    activeMission = plannedMission;
    plannedMission = null;

    // reset round based stats
    levelStats = { collected: 0, diamonds: 0, mystery: 0, diamondPigs: 0, tntExplosions: 0, gold: 0, rocks: 0, bombsUsed: 0, heavyItems: 0, pigs: 0, maxCombo: 0, brassGoldCatches: 0, coopAlternationFailed: false, earlyHighValueCatches: 0, syncCatches: 0, earlySpeedLimitFailed: false, remainingRocks: 0, remainingPigs: 0 };
    playerRoundStats.P1 = { gold: 0, diamonds: 0, mystery: 0, diamondPigs: 0, rocks: 0, bombsUsed: 0, tntHits: 0, emptyHooks: 0, pigs: 0, shotsFired: 0 };
    playerRoundStats.P2 = { gold: 0, diamonds: 0, mystery: 0, diamondPigs: 0, rocks: 0, bombsUsed: 0, tntHits: 0, emptyHooks: 0, pigs: 0, shotsFired: 0 };
    currentCombo = 0;
    bestCombo = 0;
    lastRetrieveMinerName = null;
    hadLuckyCharmThisLevel = gameManager.luckyCharm;
    levelMissionSucceeded = false;

    // ========================================================
    // TARGET DELTA: each level requires earning a fixed amount
    // that is independent of cumulative score. The old formula
    // Math.max(baseTarget, score+minimalEffort) would collapse
    // to score+200 after a few rounds, killing all challenge.
    // ========================================================
    const levelDelta = computeLevelDelta(level, gameManager.playerCount);
    const actualTarget = gameManager.score + levelDelta;
    (gameManager as any).currentLevelDelta = levelDelta;
    levelStartScore = gameManager.score;
    levelEndBaseMiningGain = 0;
    levelEndTimeBonus = 0;

    // Next Level Time setup with penalty/bonus
    let timeLimit = 60;
    if ((gameManager as any).timeLimitBonus) {
        timeLimit += (gameManager as any).timeLimitBonus;
        (gameManager as any).timeLimitBonus = 0; // reset
    }
    
    gameManager.initLevel(actualTarget, timeLimit);
    
    // Set dynamic positions and details visibility depending on playerCount
    if (gameManager.playerCount === 1) {
        player1.setPosition(canvas.width / 2, 77);
        document.getElementById('p2-detail')?.classList.add('hidden');
        const p2HudPlayer = document.getElementById('p2-score')?.parentElement;
        if (p2HudPlayer) p2HudPlayer.style.display = 'none';
    } else {
        player1.setPosition(canvas.width / 2 - 150, 77);
        player2.setPosition(canvas.width / 2 + 150, 77);
        document.getElementById('p2-detail')?.classList.remove('hidden');
        const p2HudPlayer = document.getElementById('p2-score')?.parentElement;
        if (p2HudPlayer) p2HudPlayer.style.display = 'flex';
    }

    // Hook lock if hard mission failed in last level
    if ((gameManager as any).hookLockTime > 0) {
        (gameManager as any).hookLockRemaining = (gameManager as any).hookLockTime;
        (gameManager as any).hookLockTime = 0;
        floatingTexts.push(new FloatingText(canvas.width / 2, 200, "🔒 警告: 禁钩惩罚生效! 禁钩 3.0 秒", "#ef4444", 22));
    } else {
        (gameManager as any).hookLockRemaining = 0;
    }

    items = [];

    let levelType: string = 'normal';
    if (level % 12 === 0) levelType = 'minefield';
    else if (level % 11 === 0) levelType = 'fossil_dig';
    else if (level % 10 === 0) levelType = 'treasure_vault';
    else if (level % 9 === 0) levelType = 'tiny_treasures';
    else if (level % 6 === 0) levelType = 'mystery_box';
    else if (level % 5 === 0) levelType = 'pig_parade';
    else if (level % 4 === 0) levelType = 'tnt_gauntlet';
    else if (level % 3 === 0) levelType = 'diamond_mine';
    else if (level % 2 === 0) levelType = 'gold_rush';

    gameManager.activeLevelType = levelType;

    items = LevelGenerator.generateLevelItems(level, levelType, levelDelta, gameManager, activeMission);

    if (gameManager.treasureMapActive) {
        floatingTexts.push(new FloatingText(canvas.width / 2, 180, '🗺️ 藏宝图生效! 额外 2 钻石 + 大金块!', '#ffd700', 28));
    }

    if (gameManager.hardTargetRewardMessage) {
        floatingTexts.push(new FloatingText(canvas.width / 2, 220, gameManager.hardTargetRewardMessage, '#fbbf24', 22));
        gameManager.hardTargetRewardMessage = '';
    }

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Initial draw
draw();
