import { Miner } from '../entities/Miner';
import { GameManager } from './GameManager';
import { audioManager } from './AudioManager';

export interface ShopItem {
    id: string;
    name: string;
    desc: string;
    basePrice: number;
    icon: string;
    apply: (p1: Miner, p2: Miner) => void;
    currentPrice?: number;
}

export class ShopManager {
    private gameManager: GameManager;
    private player1: Miner;
    private player2: Miner;

    private availableItems: ShopItem[] = [
        {
            id: 'strength',
            name: '化学试剂',
            desc: '🧪 持续3关：炸药半径缩小65%防误炸，且拉线速度暴增50%！',
            basePrice: 150,
            icon: '🧪',
            apply: (_p1, _p2) => { this.gameManager.pendingStrengthBuff = true; }
        },
        {
            id: 'rock_book',
            name: '石头书',
            desc: '📙 持续3关：拉回的石头价值直接翻倍（×2.0倍）！让废石成财！',
            basePrice: 70,
            icon: '📙',
            apply: (_p1, _p2) => { this.gameManager.pendingRockBuff = true; }
        },
        {
            id: 'diamond_polish',
            name: '钻石抛光剂',
            desc: '💎 持续3关：拉回的钻石价值直接翻倍（×2.0倍）！核心财富密码！',
            basePrice: 280,
            icon: '💎',
            apply: (_p1, _p2) => { this.gameManager.pendingDiamondBuff = true; }
        },
        {
            id: 'bomb_crate',
            name: '炸弹箱',
            desc: '📦 直接获得：全队立即补充 3 个强力爆破炸弹！',
            basePrice: 110,
            icon: '📦',
            apply: (_p1, _p2) => { this.gameManager.bombCount += 3; }
        },
        {
            id: 'extra_time',
            name: '时光沙漏',
            desc: '⏳ 仅下一关：直接为下一关注入 15 秒超长黄金挖掘时间！',
            basePrice: 190,
            icon: '⏳',
            apply: (_p1, _p2) => { this.gameManager.pendingTimeBonus += 15; }
        },
        {
            id: 'lucky_mystery',
            name: '幸运符',
            desc: '🍀 仅下一关：下关拉起的盲盒/神秘袋 100% 爆出超稀有大奖！',
            basePrice: 170,
            icon: '🍀',
            apply: (_p1, _p2) => { this.gameManager.pendingLuckyCharm = true; }
        },
        {
            id: 'magnet',
            name: '磁铁',
            desc: '🧲 持续3关：地表的所有小金块无需抓取，自动磁吸飞入兜中！',
            basePrice: 240,
            icon: '🧲',
            apply: (_p1, _p2) => { this.gameManager.pendingMagnetBuff = true; }
        },
        {
            id: 'alchemy',
            name: '点石成金',
            desc: '✨ 持续3关：矿层中所有的普通石头全部点化为随机黄金/钻石！',
            basePrice: 340,
            icon: '✨',
            apply: (_p1, _p2) => { this.gameManager.pendingAlchemyBuff = true; }
        },
        {
            id: 'insurance',
            name: '保险券',
            desc: '🛡️ 永久生效：在仓库中备用，自动抵消一次挑战任务失败的严厉惩罚！',
            basePrice: 210,
            icon: '🛡️',
            apply: (_p1, _p2) => { this.gameManager.insuranceCharges++; }
        },
        {
            id: 'fossil_demolisher',
            name: '化石爆破器',
            desc: '🌋 持续3关：炸弹半径+30%，且炸碎石头时返还 50% 现金！',
            basePrice: 220,
            icon: '🌋',
            apply: (_p1, _p2) => { this.gameManager.pendingFossilDemolisher = true; }
        },
        {
            id: 'geology_sledgehammer',
            name: '地质大锤',
            desc: '🛠️ 持续3关：拉回石头和重量>=80的重物速度瞬间提升50%！',
            basePrice: 140,
            icon: '🛠️',
            apply: (_p1, _p2) => { this.gameManager.pendingGeologySledgehammer = true; }
        },
        {
            id: 'clover',
            name: '幸运草',
            desc: '☘️ 持续3关：抓回普通石头或小猪有高达 35% 几率奇迹异变为黄金/钻石！',
            basePrice: 180,
            icon: '☘️',
            apply: (_p1, _p2) => { this.gameManager.pendingCloverBuff = true; }
        },
        {
            id: 'drill_hook',
            name: '喷气钻头',
            desc: '🚀 持续3关：拉回重量>40的重物时自动燃爆1炸弹，拉速狂飙3.0倍！',
            basePrice: 200,
            icon: '🚀',
            apply: (_p1, _p2) => { this.gameManager.pendingDrillHookBuff = true; }
        },
        {
            id: 'treasure_map',
            name: '藏宝图',
            desc: '🗺️ 仅下一关：开局额外生成 2 颗钻石 + 1 个大金块，掘金暴击！',
            basePrice: 340,
            icon: '🗺️',
            apply: (_p1, _p2) => { this.gameManager.pendingTreasureMap = true; }
        },
        {
            id: 'crystal_shield',
            name: '晶石护盾',
            desc: '💎 一次永久保险：在即将 Game Over 时自动激活，赋予 20 秒复活机会！',
            basePrice: 310,
            icon: '💎',
            apply: (_p1, _p2) => { this.gameManager.pendingCrystalShield = true; }
        },
        {
            id: 'freeze_time',
            name: '凝时沙漏',
            desc: '⏱️ 仅下一关：时间归零时自动触发凝固时间，额外给予 8 秒抢收机会！',
            basePrice: 380,
            icon: '⏱️',
            apply: (_p1, _p2) => { this.gameManager.pendingFreezeTime = true; }
        },
        {
            id: 'gold_radar',
            name: '黄金雷达',
            desc: '🔭 仅下一关：场内所有物品直接显示金额价值标注，绝不抓亏！',
            basePrice: 190,
            icon: '🔭',
            apply: (_p1, _p2) => { this.gameManager.pendingGoldRadar = true; }
        },
        {
            id: 'chain_bomb',
            name: '连锁炸弹',
            desc: '🔗 永久升级：每次炸弹爆炸后，附近 TNT 桶全部自动连锁引爆！',
            basePrice: 250,
            icon: '🔗',
            apply: (_p1, _p2) => { this.gameManager.pendingChainBomb = true; }
        },
        {
            id: 'sync_gear',
            name: '传动同步带',
            desc: '⚙️ 持续3关：拉回物品时，若队友也处于收钩状态，当前钩子的拉回速度额外乘 1.30 倍！',
            basePrice: 160,
            icon: '⚙️',
            apply: (_p1, _p2) => { this.gameManager.pendingSyncGear = true; }
        },
        {
            id: 'tribute_amp',
            name: '反向增幅器',
            desc: '📡 持续3关：抓起钻石的 50% 变现金额作为协作分红，直接赠予给另一名矿工！',
            basePrice: 150,
            icon: '📡',
            apply: (_p1, _p2) => { this.gameManager.pendingTributeAmp = true; }
        },
    ];

    constructor(gm: GameManager, p1: Miner, p2: Miner) {
        this.gameManager = gm;
        this.player1 = p1;
        this.player2 = p2;
    }

    public renderShop(container: HTMLElement) {
        let balanceEl = document.getElementById('shop-balance-header');
        if (!balanceEl) {
            balanceEl = document.createElement('div');
            balanceEl.id = 'shop-balance-header';
            balanceEl.className = 'shop-balance-header';
            container.parentNode?.insertBefore(balanceEl, container);
        }
        balanceEl.innerHTML = `余额: $<span id="shop-balance">${this.gameManager.score}</span>`;
        container.innerHTML = '';

        // Filter items for single/double player mode
        const filteredItems = this.availableItems.filter(item => {
            if (this.gameManager.playerCount === 1) {
                if (item.id === 'sync_gear' || item.id === 'tribute_amp') return false;
            }
            return true;
        });

        // Pick 5 random items each time
        const shuffled = [...filteredItems].sort(() => 0.5 - Math.random());

        // Prices rise gently and cap out. They should stay meaningful without
        // becoming absurd just because late-game scores are large.
        const levelMult = Math.min(2.15, 1 + Math.log2(this.gameManager.level + 1) * 0.22);
        const richDiscount = this.gameManager.score > this.gameManager.targetScore * 1.25 ? 0.9 : 1;
        const missionDiscount = this.gameManager.shopDiscountCharges > 0 ? (this.gameManager.shopDiscountRate || 0.75) : 1;
        const missionInflation = this.gameManager.pendingShopInflation > 0 ? 1.28 : 1;
        if (this.gameManager.shopDiscountCharges > 0) {
            this.gameManager.shopDiscountCharges--;
            if (this.gameManager.shopDiscountCharges === 0) {
                this.gameManager.shopDiscountRate = 1.0;
            }
        }
        if (this.gameManager.pendingShopInflation > 0) {
            this.gameManager.pendingShopInflation--;
        }

        // Reputation price impact
        let reputationPriceMult = 1.0;
        if (this.gameManager.reputation <= -3) {
            reputationPriceMult = 1.25;
        } else if (this.gameManager.reputation >= 5) {
            reputationPriceMult = 0.9;
        }

        const itemsToShow: (ShopItem & { currentPrice: number })[] = shuffled.slice(0, 5).map(item => {
            // Random price variance ±18%
            const variance = 0.82 + Math.random() * 0.36;
            // Cap level multiplier to prevent hyperinflation in late game
            const cappedLevelMult = Math.min(2.5, levelMult);
            const currentPrice = Math.max(20, Math.floor(item.basePrice * cappedLevelMult * richDiscount * missionDiscount * missionInflation * reputationPriceMult * variance));
            return { ...item, currentPrice };
        });

        itemsToShow.forEach(item => {
            const affordable = this.gameManager.score >= item.currentPrice;
            const el = document.createElement('div');
            el.className = 'shop-item';
            if (!affordable) el.classList.add('expensive-item');
            
            el.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-action ${affordable ? 'affordable' : 'expensive'}">
                    $${item.currentPrice}
                </div>
            `;

            el.addEventListener('click', () => {
                if (this.gameManager.score >= item.currentPrice && !el.classList.contains('purchased')) {
                    this.buyItem(item, item.currentPrice, el);
                } else if (this.gameManager.score < item.currentPrice) {
                    el.classList.add('shake');
                    setTimeout(() => el.classList.remove('shake'), 300);
                }
            });

            container.appendChild(el);
        });
    }

    private buyItem(item: ShopItem & { currentPrice: number }, currentPrice: number, el: HTMLElement) {
        if (this.gameManager.score >= currentPrice && !el.classList.contains('purchased')) {
            this.gameManager.score -= currentPrice;
            item.apply(this.player1, this.player2);
            el.classList.add('purchased');
            el.innerHTML = `
                <div class="shop-item-icon" style="opacity: 0.5;">${item.icon}</div>
                <div class="shop-item-name" style="opacity: 0.5; text-decoration: line-through;">${item.name}</div>
                <div class="shop-item-purchased-badge">✅ 已购买</div>
            `;
            // Update balance display
            const balanceEl = document.getElementById('shop-balance');
            if (balanceEl) balanceEl.innerText = this.gameManager.score.toString();
            document.getElementById('score-val')!.innerText = this.gameManager.score.toString();
            audioManager.playBuy();
        }
    }
}
