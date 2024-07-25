import { BALL_DIAMETER, BALL_RADIUS, BALL_REAL_DIAMETER, BALL_REAL_RADIUS, BALL_SCALE } from '../utils/Constants'
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

    createSingleBall(): void {
        this.image = this.scene.physics.add.image(this.x, this.y, `ball_${this.color}`)
            .setScale(BALL_SCALE)
            .setCircle(BALL_RADIUS)
            .setOrigin(0, 0)
            .setImmovable(true);

        (this.image as any).owner = this;

        // console.log(`Created ball at (${this.x}, ${this.y}) with color ${this.color}`);
    }

    private calculatePosition(): void {
        const OFFSET = 12; // Offset to increase the gap between balls vs gird && the balls vs the balls
        const ballX = this.col * BALL_REAL_DIAMETER * 1.05 - 17;
        const ballY = BALL_DIAMETER * Math.sin(Math.PI / 3) + this.row * (BALL_REAL_DIAMETER - BALL_RADIUS) - OFFSET;

        if (Grid.instance.indent === true) {
            this.x = ballX;
            this.y = ballY;
        }
        else {
            if (this.col < 11) {
                this.x = ballX + BALL_REAL_RADIUS;
                this.y = ballY;
            }
        }
    }
}
