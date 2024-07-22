import { BALL_DIAMETER } from '../utils/Constants.js';
import { Ball } from './Ball.js';
import { Bullet } from './Bullet';
import Phaser from 'phaser';

export class Grid {
    scene: Phaser.Scene;
    balls: Ball[][];
    ballsGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.balls = [];
        this.ballsGroup = this.scene.physics.add.group();
        this.createGrid();
    }

    // Store the initial balls in the grid with 3 rows and 11 columns
    createGrid(): void {
        const rows = 3;
        const cols = 12;
        for (let row = 0; row < rows; row++) {
            const rowBalls: Ball[] = [];
            for (let col = 0; col < cols; col++) {
                if (row % 2 !== 0 && col >= 11) {
                    continue;
                }
                const newBall = new Ball(this.scene, row, col);
                newBall.createSingleBall();
                rowBalls.push(newBall);
                if (newBall.ball) { // Ensure ball is not null
                    this.ballsGroup.add(newBall.ball);
                }
            }
            this.balls.push(rowBalls);
        }
        console.log('Grid:', this.balls);
    }

    // Add bullet to the grid after collision
    addBullet(bulletPosition: { x: number; y: number }, bullet: Bullet): void {
        const row = Math.round(bulletPosition.y / BALL_DIAMETER);
        const col = Math.round(bulletPosition.x / BALL_DIAMETER);
        console.log('Bullet position:', row, col);
        const newBall = new Ball(this.scene, row, col);
        newBall.createSingleBall();
        this.balls[row][col] = newBall;
        if (newBall.ball) { // Ensure ball is not null
            this.ballsGroup.add(newBall.ball);
        }
    }
}
