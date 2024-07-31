import { BULLET_START_X, BULLET_START_Y, BALL_SCALE, BALL_RADIUS } from '../utils/Constants.js';
import Phaser from 'phaser';
import { Grid } from './Grid';

export class Bullet {
    scene: Phaser.Scene;
    bullet: Phaser.Physics.Arcade.Image;
    velocity: { x: number; y: number };
    color: string;
    x: number;
    y: number;
    readytoShoot: boolean;
    grid: Grid;

    constructor(scene: Phaser.Scene, grid: Grid) {
        this.scene = scene;
        this.grid = grid;
        this.createBullet();
        this.x = BULLET_START_X;
        this.y = BULLET_START_Y;
        this.velocity = { x: 0, y: 0 };
        this.readytoShoot = true;
    }

    private getRandomColor(): string {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    public createBullet(): void {
        this.bullet = this.scene.physics.add.image(BULLET_START_X, BULLET_START_Y, `ball_${this.getRandomColor()}`)
            .setScale(BALL_SCALE)
            .setCircle(BALL_RADIUS - 2, 2, 2)
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(0, 0);
        // console.log('this.bullet color:', this.bullet.texture.key);
    }

    public checkBulletPosition(): void {
        if (this.bullet && ((this.bullet.y < 0) || this.bullet.y > this.scene.scale.height)) {
            this.createBullet();
            this.readytoShoot = true;
        }
    }
}