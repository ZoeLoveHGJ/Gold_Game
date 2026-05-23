import { Hook } from './Hook';
import { GameManager } from '../core/GameManager';

export class Miner {
    public x: number;
    public y: number;
    public hook: Hook;

    public name: string;
    public gatheredValue: number = 0;
    public gameManager: GameManager; // Reference to gameManager to access team inventory

    constructor(name: string, x: number, y: number, gameManager: GameManager) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.gameManager = gameManager;
        // Hook's pivot is slightly below the miner's origin
        this.hook = new Hook(x, y + 25, this);
    }

    public update(dt: number) {
        // Apply global strength buff to retract speed dynamically
        if (this.gameManager && this.gameManager.strengthBuff > 0 && this.hook.grabbedItem) {
            // Let hook apply this by passing the flag or Hook.ts can check it via owner.gameManager
        }
        this.hook.update(dt);
    }

    public reset() {
        this.hook.reset();
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.hook.originX = x;
        this.hook.originY = y + 25;
        this.hook.reset();
    }

    public useBomb() {
        if (this.gameManager && this.gameManager.bombCount > 0 && this.hook.grabbedItem) {
            this.gameManager.bombCount--;
            this.hook.useBomb();
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        // Platform
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(this.x - 50, this.y + 20, 100, 15);
        ctx.fillStyle = '#3a251b';
        ctx.fillRect(this.x - 50, this.y + 35, 100, 8);

        // Winch
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - 20, this.y, 40, 25);
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x - 25, this.y - 10, 8, 40);
        ctx.fillRect(this.x + 17, this.y - 10, 8, 40);

        // Miner Body (simple shapes)
        // Shirt
        ctx.fillStyle = this.name === 'P1' ? '#c58c65' : '#b36b53'; 
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y - 5, 18, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(this.x + 2, this.y - 5, 36, 28);
        // Head
        ctx.fillStyle = '#fce2c4';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y - 20, 15, 0, Math.PI * 2);
        ctx.fill();
        // Hat
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y - 28, 15, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(this.x + 5, this.y - 28, 38, 5);

        // Draw Hook Line
        ctx.beginPath();
        ctx.moveTo(this.hook.originX, this.hook.originY);
        if (this.hook.length > 70) {
            const midX = (this.hook.originX + this.hook.x) / 2;
            const midY = (this.hook.originY + this.hook.y) / 2;
            const dx = this.hook.x - this.hook.originX;
            const dy = this.hook.y - this.hook.originY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / length;
            const perpY = dx / length;
            let wobble = Math.sin(performance.now() * 0.016 + this.hook.x * 0.01) * 5;
            if (this.hook.grabbedItem) {
                wobble = (Math.sin(performance.now() * 0.035) * 1.5) + (this.hook.grabbedItem.weight || 0) * 0.025;
            }
            const ctrlX = midX + perpX * wobble;
            const ctrlY = midY + perpY * wobble;
            ctx.quadraticCurveTo(ctrlX, ctrlY, this.hook.x, this.hook.y);
        } else {
            ctx.lineTo(this.hook.x, this.hook.y);
        }
        ctx.strokeStyle = '#452b12';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Draw Hook Claw
        ctx.save();
        ctx.translate(this.hook.x, this.hook.y);
        ctx.rotate(this.hook.angle - Math.PI / 2);
        ctx.fillStyle = '#555';
        ctx.fillRect(-13, 0, 26, 7);
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(-13, 7); ctx.lineTo(-20, 22); ctx.lineTo(-15, 22); ctx.lineTo(-9, 7);
        ctx.moveTo(13, 7); ctx.lineTo(20, 22); ctx.lineTo(15, 22); ctx.lineTo(9, 7);
        ctx.fill();
        ctx.restore();
    }
}
