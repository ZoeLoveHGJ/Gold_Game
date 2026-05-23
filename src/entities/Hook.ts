import { audioManager } from '../core/AudioManager';
import { Miner } from './Miner';
import { Item } from './Item';
import { Pig } from './Pig';

export enum HookState {
    SWINGING,
    SHOOTING,
    RETRACTING
}

export class Hook {
    public x: number;
    public y: number;
    public originX: number;
    public originY: number;

    public angle: number = 0; // In radians
    public angleSpeed: number = 0.02; // Speed of swing
    public length: number = 50; // default length
    public minLength: number = 50;
    public maxLength: number = 1000; // max length to shoot
    public speed: number = 400; // pixels per second
    public maxAngle: number = Math.PI / 2.5; // Roughly 70 degrees each side from straight down (let's say straight down is Math.PI/2)
    public swingDirection: number = 1;

    public state: HookState = HookState.SWINGING;
    public grabbedItem: Item | null = null;
    public grabbedLength: number = 0; // Length when item was grabbed
    public owner: Miner;
    public radius: number = 12;

    // Callbacks
    public checkCollision: ((x: number, y: number) => Item | null) | null = null;
    public onCollected: ((item: Item) => void) | null = null;
    public onBombUsed: ((item: Item) => void) | null = null;
    public onTNTHit: ((item: Item) => void) | null = null; // NEW: triggered when hook hits TNT
    public onMiss: (() => void) | null = null;
    public drillBoosted: boolean = false;
    private missedShot: boolean = false;

    constructor(originX: number, originY: number, owner: Miner) {
        this.originX = originX;
        this.originY = originY;
        this.x = originX;
        this.y = originY;
        this.owner = owner;
        // Set base angle to PI/2 (straight down)
        this.angle = Math.PI / 2;
    }

    public update(dt: number) {
        switch (this.state) {
            case HookState.SWINGING:
                this.swing(dt);
                break;
            case HookState.SHOOTING:
                this.shoot(dt);
                break;
            case HookState.RETRACTING:
                this.retract(dt);
                break;
        }
    }

    private swing(dt: number) {
        // We swing around Math.PI / 2 (90 degrees, straight down via canvas coords)
        this.angle += this.angleSpeed * this.swingDirection * (dt * 60);

        if (this.angle > (Math.PI / 2) + this.maxAngle) {
            this.angle = (Math.PI / 2) + this.maxAngle;
            this.swingDirection = -1;
        } else if (this.angle < (Math.PI / 2) - this.maxAngle) {
            this.angle = (Math.PI / 2) - this.maxAngle;
            this.swingDirection = 1;
        }

        this.updatePosition();
    }

    private shoot(dt: number) {
        let shootSpeed = this.speed;
        if (this.owner?.gameManager?.activeLayerEvent === 'magma') {
            shootSpeed *= 1.2;
        }
        if (this.owner?.gameManager?.feverTimer > 0) {
            shootSpeed *= 1.4;
        }
        this.length += shootSpeed * dt;
        this.updatePosition();

        if (this.checkCollision) {
            const hitItem = this.checkCollision(this.x, this.y);
            if (hitItem && (!hitItem.isGrabbed || (this.owner?.gameManager?.playerCount === 2 && (hitItem.type === 'obelisk' || (hitItem.weight || 0) >= 40)))) {
                // TNT: explode on the spot, never grab
                if (hitItem.type === 'tnt' || (hitItem.type === 'pig' && (hitItem as Pig).hasTNT)) {
                    if (this.onTNTHit) this.onTNTHit(hitItem);
                    this.state = HookState.RETRACTING;
                    return;
                }
                
                // Ice Layer Mechanic: First grab on heavy items only breaks the ice
                if (this.owner?.gameManager?.activeLayerEvent === 'ice' && (hitItem.weight || 0) >= 80 && !hitItem.iceBroken) {
                    hitItem.iceBroken = true;
                    this.state = HookState.RETRACTING;
                    audioManager.playGrab();
                    
                    const win = window as any;
                    if (win.spawnSparkles) {
                        win.spawnSparkles(hitItem.x, hitItem.y, "#38bdf8", 18);
                        win.spawnSparkles(hitItem.x, hitItem.y, "#ffffff", 12);
                    }
                    if (win.floatingTexts && win.FloatingText) {
                        win.floatingTexts.push(new win.FloatingText(hitItem.x, hitItem.y - 30, "❄️ 击碎坚冰! 再次抓取以拉回", "#38bdf8", 20));
                    }
                    return;
                }

                // Normal grab or obelisk co-grab
                hitItem.isGrabbed = true;
                this.grabbedItem = hitItem;
                this.grabbedLength = this.length;
                this.state = HookState.RETRACTING;
                audioManager.playGrab();
                return;
            }
        }

        if (this.length >= this.maxLength || this.x < 0 || this.x > 1200 || this.y > 900) {
            this.missedShot = true;
            this.state = HookState.RETRACTING;
        }
    }

    private retract(dt: number) {
        let retractSpeed = this.speed;
        if (this.grabbedItem) {
            // Sealed Chest logic: slips off if locked and pulled 50px
            if (this.grabbedItem.type === 'sealed_chest' && !this.owner?.gameManager?.teamHasKey) {
                if (this.length < this.grabbedLength - 50) {
                    this.grabbedItem.isGrabbed = false;
                    this.grabbedItem = null;
                    this.state = HookState.RETRACTING;
                    this.missedShot = true;
                    audioManager.playBomb();
                    const win = window as any;
                    if (win.floatingTexts && win.FloatingText) {
                        win.floatingTexts.push(new win.FloatingText(this.x, this.y - 20, "🔒 封印宝箱: 需要钥匙!", "#ef4444", 20));
                    }
                    return;
                }
            }

            let weight = this.grabbedItem.weight || 0;

            // Obelisk Co-op hauling logic
            let bothPulling = false;
            if (this.grabbedItem.type === 'obelisk' && this.owner?.gameManager?.playerCount === 2) {
                const win = window as any;
                const p1 = win.player1;
                const p2 = win.player2;
                if (p1?.hook?.grabbedItem === this.grabbedItem && p2?.hook?.grabbedItem === this.grabbedItem) {
                    bothPulling = true;
                }
            }

            if (bothPulling) {
                weight = 30; // Co-op pulling makes it super light!
                const win = window as any;
                if (win.floatingTexts && win.FloatingText && Math.random() < 0.03) {
                    win.floatingTexts.push(new win.FloatingText(this.x, this.y - 30, "⚡ 合力搬运! CO-OP POWER!", "#fbbf24", 20));
                }
            } else if (this.grabbedItem.type === 'obelisk') {
                weight = 175; // weight * 2 = 350. Speed = 400 - 350 = 50px/sec (extremely slow!).
            }
            
            // Apply Turbo Jet Drill: if weight > 40 and player has drillHookBuff and has bombs, auto-boost!
            if (this.owner?.gameManager?.drillHookBuff > 0 && weight > 40 && this.owner?.gameManager?.bombCount > 0 && !this.drillBoosted) {
                this.drillBoosted = true;
                this.owner.gameManager.bombCount--;
                audioManager.playBomb();
                const win = window as any;
                if (win.floatingTexts && win.FloatingText) {
                    win.floatingTexts.push(new win.FloatingText(this.x, this.y - 40, "🚀 喷气钻头点火! SPEED UP x3.0", "#38bdf8", 22));
                }
            }
            
            if (this.owner?.gameManager?.activeLevelType === 'tiny_treasures') {
                weight = Math.floor(weight * 0.4);
            }
            retractSpeed = Math.max(10, this.speed - weight * 2);
            if (this.owner?.gameManager?.activeLayerEvent === 'quicksand' && weight >= 80) {
                retractSpeed *= 0.72;
            }
            if (this.owner?.gameManager?.activeLayerEvent === 'magma') {
                retractSpeed *= 1.2;
            }
            
            if (this.drillBoosted) {
                retractSpeed *= 3.0;
            }
        }

        // Apply strength buff (now stored on gameManager via owner)
        if (this.owner && this.owner.gameManager && this.owner.gameManager.strengthBuff > 0 && this.grabbedItem) {
            retractSpeed *= 1.5;
        }

        // Apply geology sledgehammer buff for rocks/heavy items
        if (this.owner && this.owner.gameManager && this.owner.gameManager.geologySledgehammer > 0 && this.grabbedItem) {
            if (this.grabbedItem.type === 'rock' || (this.grabbedItem.weight && this.grabbedItem.weight >= 80)) {
                retractSpeed *= 1.5;
            }
        }

        // Apply Rock Alchemy Synergy: 50% pull speed boost for rock
        if (this.owner?.gameManager && this.grabbedItem && this.grabbedItem.type === 'rock') {
            const gm = this.owner.gameManager;
            if (gm.rockBuff > 0 && gm.alchemyBuff > 0 && gm.geologySledgehammer > 0) {
                retractSpeed *= 1.5;
            }
        }

        // Apply Sync Gear (co-op exclusive): if partner is also retracting, boost speed
        if (this.owner?.gameManager?.syncGearBuff > 0 && this.grabbedItem) {
            const win = window as any;
            const p1 = win.player1;
            const p2 = win.player2;
            const other = this.owner.name === 'P1' ? p2 : p1;
            if (other?.hook?.state === HookState.RETRACTING) {
                retractSpeed *= 1.30;
                if (win.spawnSparkles && Math.random() < 0.15) {
                    win.spawnSparkles(this.x, this.y, "#38bdf8", 4);
                    win.spawnSparkles(this.x, this.y, "#a78bfa", 2);
                }
            }
        }

        // Apply Fever Mode speed boost
        if (this.owner?.gameManager?.feverTimer > 0) {
            retractSpeed *= 1.4;
        }

        this.length -= retractSpeed * dt;
        this.updatePosition();

        if (this.length <= 50) {
            this.length = 50;
            this.state = HookState.SWINGING;
            this.updatePosition();
            // Handle item collect returning it via callback or manager
            if (this.grabbedItem) {
                if (this.onCollected) this.onCollected(this.grabbedItem);
                this.grabbedItem = null;
            } else if (this.missedShot) {
                if (this.onMiss) this.onMiss();
                this.missedShot = false;
            }
        }
    }

    private updatePosition() {
        this.x = this.originX + this.length * Math.cos(this.angle);
        this.y = this.originY + this.length * Math.sin(this.angle);

        if (this.grabbedItem) {
            this.grabbedItem.x = this.x;
            this.grabbedItem.y = this.y;
        }
    }

    public fire() {
        if (this.owner?.gameManager?.hookLockRemaining > 0) return;
        if (this.state === HookState.SWINGING) {
            this.state = HookState.SHOOTING;
        }
    }

    public useBomb() {
        if (this.state === HookState.RETRACTING && this.grabbedItem) {
            if (this.onBombUsed) this.onBombUsed(this.grabbedItem);
            this.grabbedItem = null;
            this.missedShot = false;
            audioManager.playBomb();
        }
    }

    public reset() {
        this.state = HookState.SWINGING;
        this.grabbedItem = null;
        this.missedShot = false;
        this.length = 50;
        this.angle = Math.PI / 2;
        this.updatePosition();
        this.drillBoosted = false;
    }
}
