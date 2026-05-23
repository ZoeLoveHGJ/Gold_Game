export interface Sparkle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    size: number;
    decay: number;
}

export class SparkleImpl implements Sparkle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number = 1.0;
    size: number;
    decay: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 120;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.size = 2 + Math.random() * 4;
        this.decay = 1.2 + Math.random() * 1.6;
    }

    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha -= this.decay * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    alpha: number = 1.0;
    size: number;

    constructor(x: number, y: number, text: string, color: string, size: number = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
    }

    update(dt: number) {
        this.y -= 40 * dt;
        this.alpha -= 0.8 * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px Outfit, Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

export class ParticleSystem {
    public sparkles: SparkleImpl[] = [];
    public floatingTexts: FloatingText[] = [];

    public spawnSparkles(x: number, y: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            this.sparkles.push(new SparkleImpl(x, y, color));
        }
    }

    public spawnFloatingText(x: number, y: number, text: string, color: string, size: number = 20) {
        this.floatingTexts.push(new FloatingText(x, y, text, color, size));
    }

    public update(dt: number) {
        this.sparkles.forEach(s => s.update(dt));
        this.floatingTexts.forEach(ft => ft.update(dt));
        
        // Mutate arrays in-place to preserve external references
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            if (this.sparkles[i].alpha <= 0) {
                this.sparkles.splice(i, 1);
            }
        }
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            if (this.floatingTexts[i].alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        this.sparkles.forEach(s => s.draw(ctx));
        this.floatingTexts.forEach(ft => ft.draw(ctx));
    }

    public clear() {
        this.sparkles = [];
        this.floatingTexts = [];
    }
}
