import { BULLET_START_X, BULLET_START_Y, BALL_SCALE, BALL_RADIUS } from '../utils/Constants.js';
import { Ball } from './Ball.js';
import Phaser from 'phaser';
import { Grid } from './Grid';

export class Bullet extends Ball {
    bullet: Phaser.Physics.Arcade.Image | null;
    velocity: { x: number; y: number };
    readytoShoot: boolean;
    grid: Grid;

    constructor(scene: Phaser.Scene, grid: Grid) {
        super(scene, -1, -1); // Passing -1 for row and col as they are not needed for bullet
        this.grid = grid;
        this.x = BULLET_START_X;
        this.y = BULLET_START_Y;
        this.velocity = { x: 0, y: 0 };
        this.color = this.getRandomColor();
        this.readytoShoot = true;
    }

    createBullet(): void {
        this.bullet = this.scene.physics.add.image(BULLET_START_X, BULLET_START_Y, `ball_${this.getRandomColor()}`)
            .setScale(BALL_SCALE)
            .setCircle(BALL_RADIUS)
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(0, 0);
        console.log('this.bullet color:', this.bullet.texture.key);

        this.scene.physics.add.collider(
            this.bullet,
            this.grid.ballsGroup,
            this.onBulletHit,
            undefined, this);
    }

    onBulletHit(bullet, ball): void {
        console.log('Bullet hit:', ball);
        bullet.setVelocity(0, 0);
        this.readytoShoot = true;
        const ballPosition = ball.getCenter();
        this.grid.addBullet({ x: ballPosition.x, y: ballPosition.y }, this);
        this.createBullet();
    }

    checkBulletPosition(): void {
        if (this.bullet && ((this.bullet.y < 0) || this.bullet.y > this.scene.scale.height)) {
            this.createBullet();
            this.readytoShoot = true;
        }
    }
}
