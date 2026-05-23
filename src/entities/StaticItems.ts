import { Item } from './Item';

export class Gold extends Item {
    constructor(x: number, y: number, size: 'small' | 'medium' | 'large') {
        let width = 30;
        let value = 75;
        let weight = 15;

        if (size === 'medium') { width = 50; value = 220; weight = 45; }
        if (size === 'large') { width = 80; value = 550; weight = 120; }

        super(x, y, width, width, value, weight, 'gold');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        const w = this.width / 2;
        ctx.save();
        
        // Soft drop shadow
        ctx.shadowColor = 'rgba(44, 26, 6, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        
        // Draw the outer rough shape of the nugget
        ctx.fillStyle = '#b47b00'; // dark gold base
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - w);
        ctx.lineTo(this.x + w * 0.8, this.y - w * 0.7);
        ctx.lineTo(this.x + w * 1.1, this.y + w * 0.1);
        ctx.lineTo(this.x + w * 0.5, this.y + w * 0.95);
        ctx.lineTo(this.x - w * 0.6, this.y + w * 1.05);
        ctx.lineTo(this.x - w * 1.1, this.y + w * 0.3);
        ctx.lineTo(this.x - w * 0.8, this.y - w * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = 'transparent'; // Reset shadow for internal facets
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw internal crystalline gold facets to give it a 3D rocky gold nugget appearance
        const drawFacet = (pts: [number, number][], col1: string, col2: string) => {
            const grad = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]);
            grad.addColorStop(0, col1);
            grad.addColorStop(1, col2);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        // Facet 1: Top Light
        drawFacet([
            [this.x, this.y - w],
            [this.x + w * 0.8, this.y - w * 0.7],
            [this.x + w * 0.2, this.y - w * 0.1],
            [this.x - w * 0.4, this.y - w * 0.2]
        ], '#ffea79', '#f5c200');

        // Facet 2: Center Highlight
        drawFacet([
            [this.x - w * 0.4, this.y - w * 0.2],
            [this.x + w * 0.2, this.y - w * 0.1],
            [this.x + w * 0.6, this.y + w * 0.3],
            [this.x - w * 0.1, this.y + w * 0.4],
            [this.x - w * 0.7, this.y + w * 0.1]
        ], '#ffdf00', '#d4a373');

        // Facet 3: Left shade
        drawFacet([
            [this.x, this.y - w],
            [this.x - w * 0.4, this.y - w * 0.2],
            [this.x - w * 0.7, this.y + w * 0.1],
            [this.x - w * 1.1, this.y + w * 0.3],
            [this.x - w * 0.8, this.y - w * 0.6]
        ], '#e6b800', '#9e7800');

        // Facet 4: Bottom shade
        drawFacet([
            [this.x - w * 0.7, this.y + w * 0.1],
            [this.x - w * 0.1, this.y + w * 0.4],
            [this.x + w * 0.5, this.y + w * 0.95],
            [this.x - w * 0.6, this.y + w * 1.05],
            [this.x - w * 1.1, this.y + w * 0.3]
        ], '#d4a373', '#855c00');

        // Facet 5: Right light-shade
        drawFacet([
            [this.x + w * 0.8, this.y - w * 0.7],
            [this.x + w * 1.1, this.y + w * 0.1],
            [this.x + w * 0.5, this.y + w * 0.95],
            [this.x - w * 0.1, this.y + w * 0.4],
            [this.x + w * 0.2, this.y - w * 0.1]
        ], '#ffdf00', '#b47b00');

        // Dynamic twinkling sparkle
        const seed = Math.sin(performance.now() * 0.004 + this.x * this.y);
        if (seed > 0.86) {
            const sizeFactor = (seed - 0.86) * 7.0;
            const sx = this.x - w * 0.2;
            const sy = this.y - w * 0.3;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx - 12 * sizeFactor, sy);
            ctx.lineTo(sx + 12 * sizeFactor, sy);
            ctx.moveTo(sx, sy - 12 * sizeFactor);
            ctx.lineTo(sx, sy + 12 * sizeFactor);
            ctx.stroke();
            // Core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, 3 * sizeFactor, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export class BrassGold extends Item {
    constructor(x: number, y: number) {
        // Large gold size (80) but value 10, weight 120, type 'brass_gold'
        super(x, y, 80, 80, 10, 120, 'brass_gold');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        const w = this.width / 2;
        ctx.save();
        
        // Soft drop shadow
        ctx.shadowColor = 'rgba(20, 10, 2, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        
        // Draw the outer rough shape of the nugget
        ctx.fillStyle = '#7c2d12'; // dark brownish copper base
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - w);
        ctx.lineTo(this.x + w * 0.8, this.y - w * 0.7);
        ctx.lineTo(this.x + w * 1.1, this.y + w * 0.1);
        ctx.lineTo(this.x + w * 0.5, this.y + w * 0.95);
        ctx.lineTo(this.x - w * 0.6, this.y + w * 1.05);
        ctx.lineTo(this.x - w * 1.1, this.y + w * 0.3);
        ctx.lineTo(this.x - w * 0.8, this.y - w * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = 'transparent'; // Reset shadow for internal facets
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw internal crystalline facets
        const drawFacet = (pts: [number, number][], col1: string, col2: string) => {
            const grad = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]);
            grad.addColorStop(0, col1);
            grad.addColorStop(1, col2);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        // Facet 1: Top Light
        drawFacet([
            [this.x, this.y - w],
            [this.x + w * 0.8, this.y - w * 0.7],
            [this.x + w * 0.2, this.y - w * 0.1],
            [this.x - w * 0.4, this.y - w * 0.2]
        ], '#ea580c', '#d97706'); // Copper orange to brass

        // Facet 2: Center Highlight
        drawFacet([
            [this.x - w * 0.4, this.y - w * 0.2],
            [this.x + w * 0.2, this.y - w * 0.1],
            [this.x + w * 0.6, this.y + w * 0.3],
            [this.x - w * 0.1, this.y + w * 0.4],
            [this.x - w * 0.7, this.y + w * 0.1]
        ], '#d97706', '#b45309');

        // Facet 3: Left shade
        drawFacet([
            [this.x, this.y - w],
            [this.x - w * 0.4, this.y - w * 0.2],
            [this.x - w * 0.7, this.y + w * 0.1],
            [this.x - w * 1.1, this.y + w * 0.3],
            [this.x - w * 0.8, this.y - w * 0.6]
        ], '#b45309', '#7c2d12');

        // Facet 4: Bottom shade
        drawFacet([
            [this.x - w * 0.7, this.y + w * 0.1],
            [this.x - w * 0.1, this.y + w * 0.4],
            [this.x + w * 0.5, this.y + w * 0.95],
            [this.x - w * 0.6, this.y + w * 1.05],
            [this.x - w * 1.1, this.y + w * 0.3]
        ], '#b45309', '#451a03');

        // Facet 5: Right light-shade
        drawFacet([
            [this.x + w * 0.8, this.y - w * 0.7],
            [this.x + w * 1.1, this.y + w * 0.1],
            [this.x + w * 0.5, this.y + w * 0.95],
            [this.x - w * 0.1, this.y + w * 0.4],
            [this.x + w * 0.2, this.y - w * 0.1]
        ], '#d97706', '#7c2d12');

        ctx.restore();
    }
}

export class Rock extends Item {
    constructor(x: number, y: number, size: 'small' | 'large') {
        let width = 40;
        let value = 25;
        let weight = 30;

        if (size === 'large') { width = 80; value = 60; weight = 80; }

        super(x, y, width, width, value, weight, 'rock');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        const w = this.width / 2;
        ctx.save();
        
        // Soft shadow
        ctx.shadowColor = 'rgba(20, 20, 20, 0.45)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Outline rock shape (craggy polygon)
        ctx.fillStyle = '#4c4c4c'; // dark grey base
        ctx.beginPath();
        ctx.moveTo(this.x - w, this.y - w * 0.2);
        ctx.lineTo(this.x - w * 0.5, this.y - w * 0.85);
        ctx.lineTo(this.x + w * 0.4, this.y - w);
        ctx.lineTo(this.x + w, this.y - w * 0.3);
        ctx.lineTo(this.x + w * 0.85, this.y + w * 0.8);
        ctx.lineTo(this.x - w * 0.1, this.y + w * 0.95);
        ctx.lineTo(this.x - w * 0.8, this.y + w * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = 'transparent';

        const drawFacet = (pts: [number, number][], col: string) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        // Rock Facets
        // Top-left light
        drawFacet([
            [this.x - w, this.y - w * 0.2],
            [this.x - w * 0.5, this.y - w * 0.85],
            [this.x + w * 0.1, this.y - w * 0.2],
            [this.x - w * 0.3, this.y + w * 0.1]
        ], '#a3a3a3');

        // Top-right light
        drawFacet([
            [this.x - w * 0.5, this.y - w * 0.85],
            [this.x + w * 0.4, this.y - w],
            [this.x + w, this.y - w * 0.3],
            [this.x + w * 0.1, this.y - w * 0.2]
        ], '#bcbcbc');

        // Bottom right shadow
        drawFacet([
            [this.x + w * 0.1, this.y - w * 0.2],
            [this.x + w, this.y - w * 0.3],
            [this.x + w * 0.85, this.y + w * 0.8],
            [this.x + w * 0.2, this.y + w * 0.3]
        ], '#5e5e5e');

        // Bottom left shadow
        drawFacet([
            [this.x - w, this.y - w * 0.2],
            [this.x - w * 0.3, this.y + w * 0.1],
            [this.x - w * 0.1, this.y + w * 0.95],
            [this.x - w * 0.8, this.y + w * 0.6]
        ], '#737373');

        // Bottom center
        drawFacet([
            [this.x - w * 0.3, this.y + w * 0.1],
            [this.x + w * 0.1, this.y - w * 0.2],
            [this.x + w * 0.2, this.y + w * 0.3],
            [this.x - w * 0.1, this.y + w * 0.95]
        ], '#8c8c8c');

        // Draw cracked lines for extra realism
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x - w * 0.3, this.y - w * 0.2);
        ctx.lineTo(this.x + w * 0.1, this.y + w * 0.1);
        ctx.lineTo(this.x + w * 0.3, this.y + w * 0.5);
        ctx.stroke();

        // Gold Veins inside the rock! (38% chance based on position seed)
        const rockSeed = Math.sin(this.x * this.y);
        if (rockSeed > 0.2) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(this.x - w * 0.4, this.y + w * 0.2);
            ctx.lineTo(this.x - w * 0.1, this.y - w * 0.1);
            ctx.lineTo(this.x + w * 0.3, this.y + w * 0.1);
            ctx.stroke();
            
            // Gold vein highlight sparkle
            if (Math.sin(performance.now() * 0.003 + this.x) > 0.88) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x - w * 0.1, this.y - w * 0.1, 2, 0, Math.PI*2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

export class Diamond extends Item {
    constructor(x: number, y: number) {
        super(x, y, 24, 24, 800, 4, 'diamond');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Cyan soft aura
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        
        // Base shape
        ctx.fillStyle = '#1e3a8a'; // Deep sapphire base for refraction contrast
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 14);
        ctx.lineTo(this.x + 14, this.y - 3);
        ctx.lineTo(this.x + 8, this.y + 14);
        ctx.lineTo(this.x - 8, this.y + 14);
        ctx.lineTo(this.x - 14, this.y - 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0; // Disable shadow for internal facets

        const drawFacet = (pts: [number, number][], col: string) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.0;
            ctx.stroke();
        };

        // Table (Center Face)
        drawFacet([
            [this.x, this.y - 6],
            [this.x + 6, this.y],
            [this.x, this.y + 6],
            [this.x - 6, this.y]
        ], '#e0fefe');

        // Crown facets
        drawFacet([[this.x, this.y - 14], [this.x + 14, this.y - 3], [this.x + 6, this.y], [this.x, this.y - 6]], '#a5f3fc');
        drawFacet([[this.x, this.y - 14], [this.x - 14, this.y - 3], [this.x - 6, this.y], [this.x, this.y - 6]], '#67e8f9');
        drawFacet([[this.x - 14, this.y - 3], [this.x - 8, this.y + 14], [this.x, this.y + 6], [this.x - 6, this.y]], '#22d3ee');
        drawFacet([[this.x + 14, this.y - 3], [this.x + 8, this.y + 14], [this.x, this.y + 6], [this.x + 6, this.y]], '#06b6d4');
        drawFacet([[this.x - 8, this.y + 14], [this.x + 8, this.y + 14], [this.x, this.y + 6]], '#0891b2');

        // Sweeping highlight refraction ray
        const time = performance.now() * 0.0018;
        const angle = time % (Math.PI * 2);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 14);
        ctx.lineTo(this.x + 14, this.y - 3);
        ctx.lineTo(this.x + 8, this.y + 14);
        ctx.lineTo(this.x - 8, this.y + 14);
        ctx.lineTo(this.x - 14, this.y - 3);
        ctx.closePath();
        ctx.clip();

        const sx = this.x + Math.cos(angle) * 35;
        const sy = this.y + Math.sin(angle) * 35;
        const grad = ctx.createLinearGradient(sx - 15, sy - 15, sx + 15, sy + 15);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.42)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
        ctx.restore();

        // Sparkle glinting star
        const seed = Math.sin(time * 2.5 + this.x * 0.3);
        if (seed > 0.8) {
            const size = (seed - 0.8) * 8;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(this.x - size, this.y - size);
            ctx.lineTo(this.x + size, this.y + size);
            ctx.moveTo(this.x + size, this.y - size);
            ctx.lineTo(this.x - size, this.y + size);
            ctx.stroke();
        }

        ctx.restore();
    }
}

export class TNTBarrel extends Item {
    constructor(x: number, y: number) {
        super(x, y, 40, 50, 0, 10, 'tnt');
    }

    public update(_dt: number) { }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;

        const w = 18;
        const h = 25;
        
        // Bulgy barrel body
        ctx.fillStyle = '#8f2d18'; // dark crimson wood
        ctx.beginPath();
        ctx.moveTo(this.x - w * 0.8, this.y - h);
        ctx.quadraticCurveTo(this.x - w * 1.15, this.y, this.x - w * 0.8, this.y + h);
        ctx.lineTo(this.x + w * 0.8, this.y + h);
        ctx.quadraticCurveTo(this.x + w * 1.15, this.y, this.x + w * 0.8, this.y - h);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Wood planks
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x - w * 0.3, this.y - h);
        ctx.quadraticCurveTo(this.x - w * 0.45, this.y, this.x - w * 0.3, this.y + h);
        ctx.moveTo(this.x + w * 0.3, this.y - h);
        ctx.quadraticCurveTo(this.x + w * 0.45, this.y, this.x + w * 0.3, this.y + h);
        ctx.stroke();

        // Shaded metal bands
        const drawHoop = (y: number) => {
            const grad = ctx.createLinearGradient(this.x - w * 1.1, y, this.x + w * 1.1, y);
            grad.addColorStop(0, '#3f3f3f');
            grad.addColorStop(0.5, '#9a9a9a');
            grad.addColorStop(1, '#2c2c2c');
            ctx.fillStyle = grad;
            ctx.fillRect(this.x - w * 1.0, y, w * 2.0, 4);
        };
        drawHoop(this.y - h * 0.6);
        drawHoop(this.y + h * 0.5);

        // Warning Label
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(this.x - 11, this.y - 7, 22, 14);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 11, this.y - 7, 22, 14);
        
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 9px "Outfit", Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TNT', this.x, this.y + 4);

        // Burning Fuse and dynamic sparks!
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - h);
        ctx.quadraticCurveTo(this.x + 5, this.y - h - 6, this.x + 3, this.y - h - 10);
        ctx.stroke();

        // Spark dynamic particles!
        const time = performance.now() * 0.01;
        const fx = this.x + 3;
        const fy = this.y - h - 10;
        
        ctx.fillStyle = '#f97316';
        for (let i = 0; i < 4; i++) {
            const spSeed = Math.sin(time + i * 2.3);
            const cpSeed = Math.cos(time + i * 1.7);
            const sx = fx + spSeed * 5;
            const sy = fy + cpSeed * 5 - 2;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

export class MysteryBag extends Item {
    private pulse: number = 0;

    constructor(x: number, y: number) {
        super(x, y, 36, 36, 0, 12, 'mystery');
    }

    public update(dt: number) {
        this.pulse += dt * 3;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        const glow = 0.55 + 0.45 * Math.sin(this.pulse);
        ctx.shadowColor = `rgba(168, 85, 247, ${0.4 + 0.4 * glow})`;
        ctx.shadowBlur = 18 * glow;

        const w = 18;
        const h = 18;

        // Draw bag body
        const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, w * 1.1);
        grad.addColorStop(0, '#581c87');
        grad.addColorStop(1, '#2e1065');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.x - w * 0.6, this.y - h);
        ctx.bezierCurveTo(this.x - w * 1.5, this.y - h * 0.3, this.x - w * 1.4, this.y + h * 1.1, this.x, this.y + h * 1.1);
        ctx.bezierCurveTo(this.x + w * 1.4, this.y + h * 1.1, this.x + w * 1.5, this.y - h * 0.3, this.x + w * 0.6, this.y - h);
        ctx.lineTo(this.x + w * 0.8, this.y - h - 5);
        ctx.lineTo(this.x, this.y - h);
        ctx.lineTo(this.x - w * 0.8, this.y - h - 5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Golden drawstring tie
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y - h * 0.8, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y - h * 0.8);
        ctx.lineTo(this.x - 8, this.y - h * 0.2);
        ctx.moveTo(this.x + 2, this.y - h * 0.8);
        ctx.lineTo(this.x + 6, this.y - h * 0.3);
        ctx.stroke();

        // Pulsing Gold question mark
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 6 * glow;
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 21px "Outfit", Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', this.x, this.y + 7);
        ctx.restore();

        // Floating magical fairy-dust particles rising up!
        ctx.fillStyle = `rgba(192, 132, 252, ${0.4 + 0.4 * glow})`;
        const pTime = performance.now() * 0.003;
        for (let i = 0; i < 3; i++) {
            const pSeed = Math.sin(pTime + i * 1.9);
            const px = this.x + pSeed * 18;
            const py = this.y - h - 2 - ((pTime * 10 + i * 8) % 15);
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export class AncientObelisk extends Item {
    constructor(x: number, y: number) {
        super(x, y, 65, 110, 1600, 350, 'obelisk');
    }

    public update(_dt: number) {}

    public draw(ctx: CanvasRenderingContext2D) {
        const w = this.width / 2;
        const h = this.height / 2;
        ctx.save();

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 6;

        // Base/body: Basalt gray stone
        ctx.fillStyle = '#374151'; // dark grey
        ctx.beginPath();
        ctx.moveTo(this.x - w, this.y + h);
        ctx.lineTo(this.x + w, this.y + h);
        ctx.lineTo(this.x + w * 0.7, this.y - h * 0.85);
        ctx.lineTo(this.x, this.y - h); // Pyramid point at the top
        ctx.lineTo(this.x - w * 0.7, this.y - h * 0.85);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // Drawing facets to give it a 3D blocky look
        ctx.fillStyle = '#4b5563'; // medium grey for left facet
        ctx.beginPath();
        ctx.moveTo(this.x - w, this.y + h);
        ctx.lineTo(this.x, this.y + h);
        ctx.lineTo(this.x, this.y - h);
        ctx.lineTo(this.x - w * 0.7, this.y - h * 0.85);
        ctx.closePath();
        ctx.fill();

        // Shimmering Golden Tip/Crown
        const shimmer = Math.sin(performance.now() * 0.005) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(251, 191, 36, ${0.85 + shimmer * 0.15})`; // Gold glow
        ctx.beginPath();
        ctx.moveTo(this.x - w * 0.7, this.y - h * 0.85);
        ctx.lineTo(this.x + w * 0.7, this.y - h * 0.85);
        ctx.lineTo(this.x, this.y - h);
        ctx.closePath();
        ctx.fill();

        // Glowing Golden hieroglyphic runes running down the obelisk
        const pulse = Math.sin(performance.now() * 0.004) * 0.4 + 0.6;
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Hieroglyphic line 1
        ctx.moveTo(this.x, this.y - h * 0.6);
        ctx.lineTo(this.x, this.y + h * 0.8);
        ctx.stroke();

        // Horizontal cross hatches/runes
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y - h * 0.3);
        ctx.lineTo(this.x + 8, this.y - h * 0.3);
        ctx.moveTo(this.x - 12, this.y);
        ctx.lineTo(this.x + 12, this.y);
        ctx.moveTo(this.x - 8, this.y + h * 0.3);
        ctx.lineTo(this.x + 8, this.y + h * 0.3);
        ctx.stroke();

        // Sparkling golden dust surrounding it
        ctx.fillStyle = `rgba(251, 191, 36, ${0.5 * pulse})`;
        const time = performance.now() * 0.002;
        for (let i = 0; i < 4; i++) {
            const tx = this.x + Math.sin(time + i * 2.3) * (w + 10);
            const ty = this.y - h + ((time * 15 + i * 25) % (h * 2));
            ctx.beginPath();
            ctx.arc(tx, ty, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
