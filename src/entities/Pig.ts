import { Item } from './Item';

export class Pig extends Item {
    public speedX: number;
    public hasDiamond: boolean;
    public hasTNT: boolean;
    public hasMystery: boolean;
    public maxX: number = 1140; // Updated for 1200px canvas

    constructor(x: number, y: number, hasDiamond: boolean = false, hasTNT: boolean = false, hasMystery: boolean = false) {
        let val = 30;
        let w = 40;
        let h = 30;
        if (hasDiamond) val = 850;
        else if (hasTNT) val = 0;
        else if (hasMystery) val = 250;
        
        super(x, y, w, h, val, hasDiamond ? 8 : 5, 'pig');
        this.hasDiamond = hasDiamond;
        this.hasTNT = hasTNT;
        this.hasMystery = hasMystery;
        this.speedX = (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 30);
    }

    public update(dt: number) {
        if (this.isGrabbed) return;

        this.x += this.speedX * dt;

        if (this.x < 30) {
            this.speedX = Math.abs(this.speedX);
            this.x = 30;
        } else if (this.x > this.maxX) {
            this.speedX = -Math.abs(this.speedX);
            this.x = this.maxX;
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const w = this.width / 2;
        const h = this.height / 2;
        const facing = this.speedX > 0 ? 1 : -1;

        // Body
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker outline
        ctx.strokeStyle = '#e8a0b0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ear
        ctx.fillStyle = '#ff9ab0';
        ctx.beginPath();
        ctx.ellipse(this.x - facing * 12, this.y - 12, 6, 8, facing * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(this.x + facing * 8, this.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + facing * 9, this.y - 5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#ff9ab0';
        ctx.beginPath();
        ctx.ellipse(this.x + facing * 16, this.y + 2, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cc6070';
        ctx.beginPath();
        ctx.arc(this.x + facing * 14, this.y + 2, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + facing * 18, this.y + 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#ffb6c1';
        for (let i = -1; i <= 1; i += 2) {
            ctx.fillRect(this.x + i * 10 - 3, this.y + h - 2, 6, 8);
        }

        // Diamond on back if carrying
        if (this.hasDiamond) {
            ctx.fillStyle = '#74f7f7';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - h - 14);
            ctx.lineTo(this.x + 8, this.y - h - 6);
            ctx.lineTo(this.x, this.y - h + 2);
            ctx.lineTo(this.x - 8, this.y - h - 6);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }

        // TNT on back if carrying
        if (this.hasTNT) {
            ctx.fillStyle = '#ef4444'; // red barrel
            ctx.fillRect(this.x - 6, this.y - h - 14, 12, 16);
            // Black stripes
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - 6, this.y - h - 12, 12, 2);
            ctx.fillRect(this.x - 6, this.y - h - 4, 12, 2);
            // Fuse
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - h - 14);
            ctx.quadraticCurveTo(this.x + 4, this.y - h - 20, this.x + 8, this.y - h - 18);
            ctx.stroke();
        }

        // Mystery bag on back if carrying
        if (this.hasMystery) {
            ctx.fillStyle = '#eab308'; // golden mystery bag
            ctx.beginPath();
            ctx.arc(this.x, this.y - h - 6, 8, 0, Math.PI * 2);
            ctx.fill();
            // Ribbon at top
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(this.x - 4, this.y - h - 12, 8, 3);
            // Draw a tiny black question mark ?
            ctx.fillStyle = '#000';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', this.x, this.y - h - 6);
        }
    }
}
