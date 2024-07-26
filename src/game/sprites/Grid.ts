import { BALL_REAL_DIAMETER } from '../utils/Constants.js';
import { Ball } from './Ball.js';
import { Bullet } from './Bullet';
import Phaser from 'phaser';

export class Grid {
    scene: Phaser.Scene;
    balls: (Ball | null)[][];
    bullet: Bullet;
    ballGroup: Phaser.Physics.Arcade.Group;

    private _indent: boolean;
    private static _instance: Grid;

    get indent() {
        return this._indent;
    }

    static get instance() {
        return Grid._instance;
    }

    constructor(scene: Phaser.Scene, bullet: Bullet) {
        Grid._instance = this;

        this.scene = scene;
        this.balls = [];
        this.ballGroup = this.scene.physics.add.group({
            classType: Phaser.GameObjects.Sprite,
            immovable: true,
            runChildUpdate: true
        });
        this.bullet = bullet;
    }

    // Store the initial balls in the grid with 3 rows and 12/11 columns
    public createGrid(): void {
        const rows = 3;
        const cols = 12;
        for (let row = 0; row < rows; row++) {
            const rowBalls: (Ball | null)[] = [];
            for (let col = 0; col < cols; col++) {
                if (row % 2 === 0) {
                    this._indent = false;
                }
                if (row % 2 !== 0) {
                    this._indent = true;
                    if (col >= 11) {
                        continue;
                    }
                }
                const newBall = new Ball(this.scene, row, col);
                newBall.createSingleBall();
                rowBalls.push(newBall);

                this.ballGroup.add(newBall.image);
                console.log('Row:', row, 'Col:', col, 'Indent:', this._indent);
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
        bullet.body?.velocity.setTo(0);

        const bulletColor = bullet.texture.key.split('_')[1];

        const ball = (sprite as any).owner as Ball

        if (bullet.texture.key === sprite.texture.key) {
            // console.log('Same color detected');
            this.destroyConnectedBalls(ball);
            bullet.destroy();
        }

        // Add bullet to the grid after collision
        else {
            console.log("Ball collided detail:", ball.row);

            let bulletCollided: Ball | null = null;

            if (this.balls[ball.row].length === 11) { // Odd row
                this._indent = false;
                if (bullet.x > ball.x && bullet.y > ball.y) { // Bottom right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col + 1, bulletColor);
                }
                else if (bullet.x < ball.x && bullet.y > ball.y) { // Bottom left
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }
                else if (bullet.x < ball.x && bullet.y === ball.y) { // Middle left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y === ball.y) { // Middle right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y < ball.y) { // Top right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else { // Top left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }
            } else { // Even row
                this._indent = true;
                if (bullet.x > ball.x && bullet.y > ball.y && ball.col < 11) { // Bottom right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }
                else if ((bullet.x < ball.x && bullet.y > ball.y) || (bullet.x > ball.x && bullet.y > ball.y && ball.col === 11)) { // Bottom left
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col - 1, bulletColor);
                }
                else if (bullet.x < ball.x && bullet.y === ball.y) { // Middle left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y === ball.y && ball.col < 11) { // Middle right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else if (bullet.x > ball.x && bullet.y < ball.y) { // Top right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else { // Top left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
            }

            if (bulletCollided.row >= this.gridLength()) {
                if (this.balls[ball.row].length === 12) {
                    this.balls.push(new Array(11).fill(null));
                }
                else {
                    this.balls.push(new Array(12).fill(null));
                }
            }

            if (!this.balls[bulletCollided.row]) {
                this.balls[bulletCollided.row] = [];
            }

            this.balls[bulletCollided.row][bulletCollided.col] = bulletCollided;
            bullet.destroy();
            bulletCollided.createSingleBall();
            this.ballGroup.add(bulletCollided.image);

            // Handle the case when the bullet has small gap with another ball which has the same color
            const nearbyBalls = this.findNeighbors(bulletCollided);
            for (const nearbyBall of nearbyBalls) {
                if (nearbyBall.image.texture.key === bullet.texture.key) {
                    this.destroyConnectedBalls(nearbyBall);
                    bulletCollided.image.destroy();
                    bullet.destroy();
                    break;
                }
            }
        }

        this.makeSingleBallsFall();
        this.bullet.createBullet();
        this.bullet.readytoShoot = true;
        console.log('Grid:', this.balls);

        this.cleanEmptyRows();
    }

    public changeEmptyToNull() {
        for (let row = 0; row < this.gridLength(); row++) {
            for (let col = 0; col < this.balls[row].length; col++) {
                if (this.balls[row][col] === undefined) {
                    this.balls[row][col] = null;
                }
            }
        }
    }

    private findNeighbors(startBall: Ball): Ball[] {
        const neighbors: Ball[] = [];

        const topLeft = this.getTopLeftNeighbor(startBall);
        if (topLeft) neighbors.push(topLeft);

        const topRight = this.getTopRightNeighbor(startBall);
        if (topRight) neighbors.push(topRight);

        const middleLeft = this.getMiddleLeftNeighbor(startBall);
        if (middleLeft) neighbors.push(middleLeft);

        const middleRight = this.getMiddleRightNeighbor(startBall);
        if (middleRight) neighbors.push(middleRight);

        const bottomLeft = this.getBottomLeftNeighbor(startBall);
        if (bottomLeft) neighbors.push(bottomLeft);

        const bottomRight = this.getBottomRightNeighbor(startBall);
        if (bottomRight) neighbors.push(bottomRight);

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
            this.ballGroup.remove(ball.image);

            // Falling animation
            this.scene.tweens.add({
                targets: ball.image,
                y: ball.image.y + 200,
                duration: 800,
                ease: 'linear',
                onComplete: () => {
                    ball.image.destroy();
                }
            });
        }

        this.cleanEmptyRows();
    }

    private isSingle(ball: Ball): boolean {
        const visited = new Set<Ball>();
        const queue: Ball[] = [ball];
        let isConnectedToTop = false;

        while (queue.length > 0) {
            const currentBall = queue.shift()!;

            if (!visited.has(currentBall)) {
                visited.add(currentBall);

                // If the ball is in the top row, it's not single
                if (currentBall.row === 0) {
                    isConnectedToTop = true;
                    break;
                }

                // Add all connected neighbors to the queue
                const neighbors = this.findNeighbors(currentBall);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }
        }

        // If the ball or any connected ball is connected to the top row, return false
        if (isConnectedToTop) {
            return false;
        }

        // If not connected to the top, check if it is surrounded by empty spaces
        let nullCount = 0;

        if (!this.getTopLeftNeighbor(ball)) nullCount++;
        if (!this.getTopRightNeighbor(ball)) nullCount++;
        if (!this.getMiddleLeftNeighbor(ball)) nullCount++;
        if (!this.getMiddleRightNeighbor(ball)) nullCount++;

        // A ball is considered single if it has 4 or more null neighbors
        return nullCount >= 3;
    }

    private getTopLeftNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[ball.row].length === 12) {
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

        if (this.balls[ball.row].length === 12) {
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

    private getBottomLeftNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[ball.row].length === 12) {
            if (this.balls[row + 1] && this.balls[row + 1][col]) {
                return (this.balls[row + 1][col]!);
            }
        } else {
            if (this.balls[row + 1] && this.balls[row + 1][col - 1]) {
                return (this.balls[row + 1][col - 1]!);
            }
        }
    }

    private getBottomRightNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[ball.row].length === 12) {
            if (this.balls[row + 1] && this.balls[row + 1][col + 1]) {
                return (this.balls[row + 1][col + 1]!);
            }
        } else {
            if (this.balls[row + 1] && this.balls[row + 1][col]) {
                return (this.balls[row + 1][col]!);
            }
        }
    }


    // Continuously add new rows after a certain interval
    public startAddingRows(interval: number): void {
        this.scene.time.addEvent({
            delay: interval,
            callback: this.addNewRow,
            callbackScope: this,
            loop: true
        });
    }

    private addNewRow(): void {
        let cols: number;
        const newRow: (Ball | null)[] = [];

        if (this.balls[0].length === 12) {
            cols = 11;
        }
        else {
            cols = 12;
        }

        // Handle the position of the new row
        for (let col = 0; col < cols; col++) {
            if (cols === 11) {
                this._indent = true;
            } else {
                this._indent = false;
            }
            const newBall = new Ball(this.scene, 0, col);
            newBall.createSingleBall();
            newRow.push(newBall);

            this.ballGroup.add(newBall.image);
        }

        // Insert the new row at the top of the grid
        this.balls.unshift(newRow);

        // Update the row positions of the old balls
        for (let row = 1; row < this.gridLength(); row++) {
            this._indent = !this._indent;
            for (let col = 0; col < this.balls[row].length; col++) {
                const oldBall = this.balls[row][col];

                if (oldBall) {
                    oldBall.row = row;
                    oldBall.image.y += BALL_REAL_DIAMETER;
                }
            }
        }
        console.log('New row added', this.balls);

    }
}