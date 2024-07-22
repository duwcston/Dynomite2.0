import { BALL_DIAMETER, BALL_RADIUS, BALL_SCALE } from '../utils/Constants'

export class Ball {
    scene: Phaser.Scene;
    row: number;
    col: number;
    x: number;
    y: number;
    color: string;
    ball: Phaser.Physics.Arcade.Image | undefined;

    constructor(scene: Phaser.Scene, row: number, col: number) {
        this.scene = scene;
        this.row = row;
        this.col = col;
        this.x = 0;
        this.y = 0;
        this.ball = undefined;
        this.color = this.getRandomColor();
        this.calculatePosition();
    }

    public getRandomColor(): string {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createSingleBall(): void {
        console.log('Creating ball at:', this.x, this.y);
        const ball = this.scene.physics.add.image(this.x, this.y, `ball_${this.color}`)
            .setScale(BALL_SCALE)
            .setCircle(BALL_RADIUS)
            .setOrigin(0, 0)
            .setImmovable();
        console.log(ball.texture.key);
    }

    private calculatePosition(): void {
        const OFFSET = 14; // Offset to decrease the gap between balls and the grid
        const ballX = this.col * BALL_DIAMETER * BALL_SCALE + 2;
        const ballY = BALL_DIAMETER * Math.sin(Math.PI / 3) + this.row * BALL_DIAMETER * BALL_SCALE - this.row * BALL_RADIUS - OFFSET;

        if (this.row % 2 === 0) {
            this.x = ballX;
            this.y = ballY;
        } else {
            if (this.col < 11) {
                this.x = ballX + BALL_RADIUS * BALL_SCALE;
                this.y = ballY;
            }
        }
    }
}
