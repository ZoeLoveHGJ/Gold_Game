export abstract class Item {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public value: number;
    public weight: number;
    public type: string;
    public isGrabbed: boolean = false;
    public iceBroken?: boolean;

    constructor(x: number, y: number, width: number, height: number, value: number, weight: number, type: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = value;
        this.weight = weight;
        this.type = type;
    }

    public abstract update(dt: number): void;
    public abstract draw(ctx: CanvasRenderingContext2D): void;
}
