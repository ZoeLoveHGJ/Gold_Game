import { Item } from './Item';

export class AncientKey extends Item {
    constructor(x: number, y: number) {
        super(x, y, 32, 24, 100, 10, 'ancient_key');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        
        // Gold key body
        const grad = ctx.createLinearGradient(this.x - 10, this.y, this.x + 16, this.y);
        grad.addColorStop(0, '#fef08a'); // sparkling gold
        grad.addColorStop(0.5, '#eab308'); // gold
        grad.addColorStop(1, '#854d0e'); // rich bronze-gold
        ctx.fillStyle = grad;

        // Key bow (fancy rounded antique handle)
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3c2305'; // inner hole
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Key shank
        ctx.fillStyle = grad;
        ctx.fillRect(this.x - 1, this.y - 2, 16, 4);

        // Key bit (teeth)
        ctx.fillRect(this.x + 7, this.y, 4, 8);
        ctx.fillRect(this.x + 11, this.y, 4, 5);
        ctx.fillRect(this.x + 9, this.y + 5, 2, 3); // notch cutouts

        // Reflective shine dot
        if (Math.sin(performance.now() * 0.005 + this.x) > 0.85) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - 8, this.y - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export class SealedChest extends Item {
    constructor(x: number, y: number) {
        super(x, y, 68, 50, 1500, 100, 'sealed_chest');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const w = this.width / 2;
        const h = this.height / 2;

        // Drop shadow for chest
        ctx.shadowColor = 'rgba(15, 10, 5, 0.55)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 5;

        // Bulging chest body (rounded trunk design)
        ctx.fillStyle = '#451a03'; // ultra rich mahogany base
        ctx.beginPath();
        ctx.moveTo(this.x - w, this.y - h * 0.7);
        ctx.quadraticCurveTo(this.x, this.y - h * 1.3, this.x + w, this.y - h * 0.7);
        ctx.lineTo(this.x + w, this.y + h);
        ctx.lineTo(this.x - w, this.y + h);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Horizontal wooden panel textures
        ctx.strokeStyle = 'rgba(0,0,0,0.24)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(this.x - w, this.y - h * 0.3);
        ctx.lineTo(this.x + w, this.y - h * 0.3);
        ctx.moveTo(this.x - w, this.y + h * 0.35);
        ctx.lineTo(this.x + w, this.y + h * 0.35);
        ctx.stroke();

        // 3D Gold Reinforcement brackets
        const drawGoldBracket = (bx: number, by: number, width: number, height: number) => {
            const bGrad = ctx.createLinearGradient(bx, by, bx + width, by + height);
            bGrad.addColorStop(0, '#fef08a');
            bGrad.addColorStop(0.5, '#ca8a04');
            bGrad.addColorStop(1, '#713f12');
            ctx.fillStyle = bGrad;
            ctx.fillRect(bx, by, width, height);
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 1.0;
            ctx.strokeRect(bx, by, width, height);
        };
        drawGoldBracket(this.x - w, this.y - h * 0.8, 10, 10);
        drawGoldBracket(this.x + w - 10, this.y - h * 0.8, 10, 10);
        drawGoldBracket(this.x - w, this.y + h - 10, 10, 10);
        drawGoldBracket(this.x + w - 10, this.y + h - 10, 10, 10);

        // Vertical metal straps
        ctx.fillStyle = '#1e293b'; // slate metal
        ctx.fillRect(this.x - w + 16, this.y - h * 0.85, 8, h * 1.85);
        ctx.fillRect(this.x + w - 24, this.y - h * 0.85, 8, h * 1.85);

        // Lock Plate
        drawGoldBracket(this.x - 12, this.y - 4, 24, 20);

        // Ancient Keyhole
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(this.x, this.y + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(this.x - 2, this.y + 2, 4, 9);

        // Chain Wrapping
        const hasKey = (window as any).gameManager?.teamHasKey;
        if (!hasKey) {
            ctx.strokeStyle = '#475569'; // steel blue chains
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(this.x - w, this.y - h * 0.7);
            ctx.lineTo(this.x + w, this.y + h * 0.95);
            ctx.moveTo(this.x + w, this.y - h * 0.7);
            ctx.lineTo(this.x - w, this.y + h * 0.95);
            ctx.stroke();

            // Link chain highlights
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Red warning magical lock aura
            ctx.save();
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.beginPath();
            ctx.arc(this.x, this.y + 2, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Unlocked green magic glow!
            ctx.save();
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 16;
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(this.x - w - 3, this.y - h - 3, this.width + 6, this.height + 6);
            
            // Rising green particles
            const time = performance.now() * 0.004;
            ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
            for (let i = 0; i < 3; i++) {
                const px = this.x - w + 10 + ((i * 27 + time * 15) % (this.width - 20));
                const py = this.y - h - 4 - ((time * 8 + i * 5) % 12);
                ctx.beginPath();
                ctx.arc(px, py, 2.0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.restore();
    }
}

export class Gopher extends Item {
    public speedX: number;
    public maxX: number = 1140;

    constructor(x: number, y: number) {
        super(x, y, 46, 36, 800, 35, 'gopher');
        this.speedX = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 45);
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
        ctx.save();
        const w = this.width / 2;
        const h = this.height / 2;
        const facing = this.speedX > 0 ? 1 : -1;

        // Drop shadow for the gopher
        ctx.shadowColor = 'rgba(20, 10, 5, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = facing * 2;
        ctx.shadowOffsetY = 3;

        // Bulging mole body with two-tone fur gradient
        const bodyGrad = ctx.createRadialGradient(this.x - facing * 5, this.y, 2, this.x, this.y, w);
        bodyGrad.addColorStop(0, '#a16207'); // warm brown
        bodyGrad.addColorStop(1, '#451a03'); // rich dark brown
        ctx.fillStyle = bodyGrad;
        
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Miner's helmet with sleek visor curvature
        const helmetGrad = ctx.createLinearGradient(this.x - 12, this.y - h, this.x + 12, this.y - h);
        helmetGrad.addColorStop(0, '#fef08a');
        helmetGrad.addColorStop(0.5, '#ca8a04');
        helmetGrad.addColorStop(1, '#854d0e');
        ctx.fillStyle = helmetGrad;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y - h + 2, 12, Math.PI, 0);
        ctx.fill();

        // Visor/Rim
        ctx.fillStyle = '#a16207';
        ctx.fillRect(this.x - 14, this.y - h + 1, 28, 2.5);

        // Headlamp structure
        ctx.fillStyle = '#475569';
        ctx.fillRect(this.x + facing * 8 - 3, this.y - h - 5, 6, 5);

        // Headlamp bulb & bright spotlight cone of light
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + facing * 8, this.y - h - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Spotlight beam
        const beamGrad = ctx.createLinearGradient(this.x + facing * 8, this.y - h - 3, this.x + facing * 85, this.y - h);
        beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
        beamGrad.addColorStop(1, 'rgba(253, 224, 71, 0.0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(this.x + facing * 8, this.y - h - 3);
        ctx.lineTo(this.x + facing * 85, this.y - h - 35);
        ctx.lineTo(this.x + facing * 85, this.y - h + 25);
        ctx.closePath();
        ctx.fill();

        // Eyes with white reflection glints
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(this.x + facing * 12, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + facing * 12 + facing * 0.8, this.y - 2.8, 1, 0, Math.PI * 2);
        ctx.fill();

        // Cute pink snout
        ctx.fillStyle = '#fecdd3';
        ctx.beginPath();
        ctx.arc(this.x + facing * 19, this.y + 1, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Hands holding the diamond
        ctx.fillStyle = '#fecdd3';
        ctx.beginPath();
        ctx.arc(this.x + facing * 11, this.y + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Super Diamond
        ctx.save();
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#e0fefe';
        const dx = this.x + facing * 11;
        const dy = this.y + 13;
        ctx.beginPath();
        ctx.moveTo(dx, dy - 8);
        ctx.lineTo(dx + 8, dy - 1);
        ctx.lineTo(dx + 5, dy + 8);
        ctx.lineTo(dx - 5, dy + 8);
        ctx.lineTo(dx - 8, dy - 1);
        ctx.closePath();
        ctx.fill();

        // Diamond facets
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(dx, dy - 8);
        ctx.lineTo(dx, dy + 8);
        ctx.moveTo(dx - 8, dy - 1);
        ctx.lineTo(dx + 8, dy - 1);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }
}
