import { BALL_RADIUS, BALL_REAL_DIAMETER, BALL_REAL_RADIUS, BALL_SCALE } from '../utils/Constants'
import { Grid } from './Grid';

export class Ball {
    scene: Phaser.Scene;
    row: number;
    col: number;
    x: number;
    y: number;
    color: string;
    image: Phaser.Physics.Arcade.Image;

    constructor(scene: Phaser.Scene, row: number, col: number, color?: string) {
        this.scene = scene;
        this.row = row;
        this.col = col;
        this.x = 0;
        this.y = 0;
        this.color = color || this.getRandomColor();
        this.calculatePosition();
    }

    private getRandomColor(): string {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    public createSingleBall(): void {
        this.image = this.scene.physics.add.image(this.x, this.y, `ball_${this.color}`)
            .setScale(BALL_SCALE)
            .setCircle(BALL_RADIUS - 2, 2, 2)
            .setOrigin(0, 0);

        (this.image as any).owner = this;
        // console.log(`Created ball at (${this.x}, ${this.y}) with color ${this.color}`);
    }

    private calculatePosition(): void {
        const ballX = this.col * BALL_REAL_DIAMETER * 1.05 - 17;
        const ballY = this.row * BALL_REAL_DIAMETER - 12;

        if (Grid.instance.indent === false) {
            this.x = ballX;
            this.y = ballY;
        }
        else {
            this.x = ballX + BALL_REAL_RADIUS;
            this.y = ballY;
        }
    }
}
