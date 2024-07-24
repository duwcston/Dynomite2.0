import { BALL_REAL_DIAMETER } from '../utils/Constants.js';
import { Ball } from './Ball.js';
import { Bullet } from './Bullet';
import Phaser from 'phaser';

export class Grid {
    scene: Phaser.Scene;
    balls: (Ball | null)[][];
    bullet: Bullet;
    ballGroup: Phaser.Physics.Arcade.Group;
    distanceThreshold: number;

    constructor(scene: Phaser.Scene, bullet: Bullet, distanceThreshold: number = BALL_REAL_DIAMETER + 10) {
        this.scene = scene;
        this.balls = [];
        this.ballGroup = this.scene.physics.add.group();
        this.createGrid();

        this.bullet = bullet;
        this.distanceThreshold = distanceThreshold;
        this.setCollision();
        this.changeEmptyToNull();
        this.makeSingleBallsFall();
    }

    // Store the initial balls in the grid with 3 rows and 12/11 columns
    private createGrid(): void {
        const rows = 3;
        const cols = 12;
        for (let row = 0; row < rows; row++) {
            const rowBalls: (Ball | null)[] = [];
            for (let col = 0; col < cols; col++) {
                if (row % 2 !== 0 && col >= 11) {
                    rowBalls.push(null);
                    continue;
                }
                const newBall = new Ball(this.scene, row, col);
                newBall.createSingleBall();
                rowBalls.push(newBall);

                this.ballGroup.add(newBall.image);
            }
            this.balls.push(rowBalls);
        }

        console.log('Grid:', this.balls);
    }

    public setCollision(): void {
        this.scene.physics.add.collider(this.bullet.bullet, this.ballGroup, this.handleCollision, null, this);
    }

    // Check collision between bullet
    private handleCollision(bullet: Phaser.Physics.Arcade.Sprite, sprite: Phaser.Physics.Arcade.Sprite): void {
        console.log('Collision detected between bullet and ball');
        bullet.body?.velocity.setTo(0);
        bullet.body!.immovable = true;
        sprite.body!.immovable = true;

        const bulletColor = bullet.texture.key.split('_')[1];
        console.log('Sprite color:', sprite.texture.key);
        console.log('Bullet texture:', bullet.texture.key);
        console.log('Bullet color:', bulletColor);

        const ball = (sprite as any).owner as Ball

        if (bullet.texture.key === sprite.texture.key) {
            console.log('Same color detected');
            this.destroyConnectedBalls(ball);
            bullet.destroy();
            // Remove bullet from balls

        }
        // Handle the case when the bullet has small gap with the ball

        // Add bullet to the grid after collision
        else {
            console.log("Ball collided detail:", ball);

            let bulletCollided = null;

            if (ball.row % 2 !== 0) { // Odd row

                if (bullet.x > ball.x && bullet.y > ball.y) { // Bottom right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col + 1, bulletColor);
                }
                else if (bullet.x < ball.x && bullet.y > ball.y) { // Bottom left
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }
                else if (bullet.x < ball.x && bullet.y == ball.y) { //  Middle left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y == ball.y) { // Middle right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y < ball.y) { // Top right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col - 1, bulletColor);
                }
                else { // Top left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }
            }

            else { // Even row

                if (bullet.x > ball.x && bullet.y > ball.y && ball.col < 11) { // Bottom right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }
                else if ((bullet.x < ball.x && bullet.y > ball.y) || (bullet.x > ball.x && bullet.y > ball.y && ball.col === 11)) { // Bottom left    
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col - 1, bulletColor);
                }
                else if (bullet.x < ball.x && bullet.y == ball.y) { //  Middle left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y == ball.y && ball.col < 11) { // Middle right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y < ball.y) { // Top right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }
                else { // Top left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
            }

            if (bulletCollided.row >= this.balls.length)
                this.balls.push([]);

            this.balls[bulletCollided.row][bulletCollided.col] = bulletCollided;

            bullet.destroy();
            bulletCollided.createSingleBall();
            console.log("Bullet collided detail:", bulletCollided);
            this.ballGroup.add(bulletCollided.image);
        }

        this.makeSingleBallsFall();
        this.bullet.createBullet();
        this.bullet.readytoShoot = true;
        console.log('Grid:', this.balls);

        this.cleanEmptyRows();
        console.log('Rows:', this.balls.length);
    }

    public changeEmptyToNull() {
        for (let row = 0; row < this.balls.length; row++) {
            for (let col = 0; col < this.balls[row].length; col++) {
                if (this.balls[row][col] === undefined) {
                    this.balls[row][col] = null;
                }
            }
        }
    }

    private findNeighbors(startBall: Ball): Ball[] {
        const neighbors: Ball[] = [];
        this.balls.forEach(row => {
            row.forEach(otherBall => {
                if (otherBall && otherBall !== startBall && Phaser.Math.Distance.Between(startBall.x, startBall.y, otherBall.x, otherBall.y) <= this.distanceThreshold) {
                    neighbors.push(otherBall);
                }
            });
        });
        return neighbors;
    }

    private destroyConnectedBalls(ball: Ball): void { // BFS
        const color = ball.image.texture.key.split('_')[1];
        const queue: Ball[] = [ball];
        const visited: Set<Ball> = new Set();

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (!visited.has(current) && current.image.texture.key.split('_')[1] === color) {
                visited.add(current);
                this.ballGroup.remove(current.image);
                current.image.destroy();

                this.balls[current.row][current.col] = null;
                const neighbors = this.findNeighbors(current);
                neighbors.forEach(neighbor => {
                    if (neighbor.image.texture.key.split('_')[1] === color && !visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                });
            }
        }
    }

    private gridLength(): number {
        return this.balls.length;
    }

    private cleanEmptyRows() {
        for (let i = this.gridLength() - 1; i >= 0; --i) {
            const row = this.balls[i]
            if (row.find(b => b)) {
                return
            }
            this.balls.pop()
        }
    }

    // Make balls fall when there are empty spaces in the grid
    public makeSingleBallsFall(): void {
        const ballsToFall: Ball[] = [];

        for (let row = 1; row < this.gridLength(); row++) {
            for (let col = 0; col < this.balls[row].length; col++) {
                const ball = this.balls[row][col];
                if (ball && this.isSingle(ball)) {
                    ballsToFall.push(ball);
                }
            }
        }
        // Make the Single balls fall
        for (const ball of ballsToFall) {
            this.balls[ball.row][ball.col] = null;

            this.scene.tweens.add({
                targets: ball.image,
                y: ball.image.y + 200,
                duration: 800,
                ease: 'linear',
                onComplete: () => {
                    this.ballGroup.remove(ball.image);
                    ball.image.destroy();
                }
            });
        }

        // Clean up empty rows
        this.cleanEmptyRows();
    }

    private isSingle(ball: Ball): boolean {
        let nullCount = 0;

        if (this.getUpperRow(ball) === (null || undefined)) {
            return true;
        }

        if (this.getTopLeftNeighbor(ball) === (null || undefined)) {
            nullCount++;
        }

        if (this.getTopRightNeighbor(ball) === (null || undefined)) {
            nullCount++;
        }

        if (this.getMiddleLeftNeighbor(ball) === (null || undefined)) {
            nullCount++;
        }

        if (this.getMiddleRightNeighbor(ball) === (null || undefined)) {
            nullCount++;
        }

        return nullCount >= 4;
    }

    private getUpperRow(ball: Ball) {
        return this.balls[ball.row - 1];
    }

    private getTopLeftNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (row % 2 === 0) {
            if (this.balls[row - 1] && this.balls[row - 1][col - 1]) {
                return (this.balls[row - 1][col - 1]!);
            }
        } else {
            if (this.balls[row - 1] && this.balls[row - 1][col]) {
                return (this.balls[row - 1][col]!);
            }
        }
    }

    private getTopRightNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (row % 2 === 0) {
            if (this.balls[row - 1] && this.balls[row - 1][col]) {
                return (this.balls[row - 1][col]!);
            }
        } else {
            if (this.balls[row - 1] && this.balls[row - 1][col + 1]) {
                return (this.balls[row - 1][col + 1]!);
            }
        }
    }

    private getMiddleLeftNeighbor(ball: Ball) {
        if (this.balls[ball.row] && this.balls[ball.row][ball.col - 1]) {
            return (this.balls[ball.row][ball.col - 1]!);
        }
    }

    private getMiddleRightNeighbor(ball: Ball) {
        if (this.balls[ball.row] && this.balls[ball.row][ball.col + 1]) {
            return (this.balls[ball.row][ball.col + 1]!);
        }
    }

    // Add new row to the grid
}
