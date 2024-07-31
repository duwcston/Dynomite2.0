import { BALL_REAL_DIAMETER, GRID_COLS, GRID_ROWS } from '../utils/Constants.js';
import { Ball } from './Ball.js';
import { Bullet } from './Bullet';
import Phaser from 'phaser';

export class Grid {
    scene: Phaser.Scene;
    balls: (Ball | null)[][];
    bullet: Bullet;
    ballGroup: Phaser.Physics.Arcade.Group;

    private _indent: boolean;
    private _ballDestroyed: number;
    private static _instance: Grid;

    get indent() {
        return this._indent;
    }

    get ballDestroyed() {
        return this._ballDestroyed;
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
        this._ballDestroyed = 0;
    }

    public set ballDestroyed(value: number) {
        this._ballDestroyed = value;
    }

    // Store the initial balls in the grid with 3 rows and GRID_COLS/GRID_COLS- 1 columns
    public createGrid(): void {
        const rows = GRID_ROWS;
        const cols = GRID_COLS;
        for (let row = 0; row < rows; row++) {
            const rowBalls: (Ball | null)[] = [];
            for (let col = 0; col < cols; col++) {
                if (row % 2 === 0) {
                    this._indent = false;
                }
                if (row % 2 !== 0) {
                    this._indent = true;
                    if (col >= GRID_COLS - 1) {
                        continue;
                    }
                }
                const newBall = new Ball(this.scene, row, col);
                newBall.createSingleBall();
                rowBalls.push(newBall);

                this.ballGroup.add(newBall.image);
                // console.log('Row:', row, 'Col:', col, 'Indent:', this._indent);
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
            this.destroyConnectedBalls(ball);
            bullet.destroy();
        }

        // Add bullet to the grid after collision
        // Major bug: Sometimes the bullet will become one with a ball and cannot be destroyed
        else {
            console.log(`Ball collided : ${sprite.texture.key}, row: ${ball.row}`);
            // const collidedAngle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(bullet.x, bullet.y, ball.x, ball.y));
            const collidedAngle = Math.round(Math.atan2(ball.y - bullet.y, ball.x - bullet.x) * 180 / Math.PI);
            console.log('Collided angle:', collidedAngle);

            let bulletCollided: Ball | null = null;

            if (this.balls[ball.row].length === GRID_COLS - 1) { // Odd row

                if (-135 <= collidedAngle && collidedAngle <= -100) { // Bottom right
                    this._indent = false;
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col + 1, bulletColor);
                }
                else if (-100 <= collidedAngle && collidedAngle < -45) { // Bottom left
                    this._indent = false;
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }
                else if ((135 < collidedAngle && collidedAngle < 180) || (-180 < collidedAngle && collidedAngle < -135)) { // Middle right
                    this._indent = true;
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else if (Math.abs(collidedAngle) < 45) { // Middle left
                    this._indent = true;
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
                else if (80 < collidedAngle && collidedAngle <= 135) { // Top right
                    this._indent = false;
                    bulletCollided = new Ball(this.scene, ball.row - 1, ball.col + 1, bulletColor);
                }
                else { // Top left
                    this._indent = false;
                    bulletCollided = new Ball(this.scene, ball.row - 1, ball.col, bulletColor);
                }
            }

            else { // Even row

                if (-135 <= collidedAngle && collidedAngle <= -100 && ball.col !== GRID_COLS - 1) { // Bottom right
                    this._indent = true;
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }
                else if (-100 <= collidedAngle && collidedAngle < -45 && ball.col !== 0) { // Bottom left
                    this._indent = true;
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col - 1, bulletColor);
                }
                else if ((135 < collidedAngle && collidedAngle < 180) || (-180 < collidedAngle && collidedAngle < -135)) { // Middle right
                    this._indent = false;
                    bulletCollided = new Ball(this.scene, ball.row, ball.col + 1, bulletColor);
                }
                else if (Math.abs(collidedAngle) < 45) { // Middle left
                    this._indent = false;
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
                else if (80 < collidedAngle && collidedAngle <= 135 && ball.col !== GRID_COLS - 1) { // Top right
                    this._indent = true;
                    bulletCollided = new Ball(this.scene, ball.row - 1, ball.col, bulletColor);
                }
                else { // Top left
                    this._indent = true;
                    bulletCollided = new Ball(this.scene, ball.row - 1, ball.col - 1, bulletColor);
                }
            }

            if (bulletCollided.row >= this.gridLength()) {
                if (this.balls[ball.row].length === GRID_COLS) {
                    this.balls.push(new Array(GRID_COLS - 1).fill(null));
                }
                else {
                    this.balls.push(new Array(GRID_COLS).fill(null));
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

    private getTopLeftNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[row].length === GRID_COLS) {
            return this.balls[row - 1]?.[col - 1] || null;
        } else {
            return this.balls[row - 1]?.[col] || null;
        }
    }

    private getTopRightNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[row].length === GRID_COLS) {
            return this.balls[row - 1]?.[col] || null;
        } else {
            return this.balls[row - 1]?.[col + 1] || null;
        }
    }

    private getMiddleLeftNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        return this.balls[row]?.[col - 1] || null;
    }

    private getMiddleRightNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        return this.balls[row]?.[col + 1] || null;
    }

    private getBottomLeftNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[row].length === GRID_COLS) {
            return this.balls[row + 1]?.[col - 1] || null;
        } else {
            return this.balls[row + 1]?.[col] || null;
        }
    }

    private getBottomRightNeighbor(ball: Ball) {
        const row = ball.row;
        const col = ball.col;

        if (this.balls[row].length === GRID_COLS) {
            return this.balls[row + 1]?.[col] || null;
        } else {
            return this.balls[row + 1]?.[col + 1] || null;
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

    // Minor bug: Sometimes the balls are not destroyed when they are connected 
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

                this._ballDestroyed++;
                console.log('Ball destroyed:', this._ballDestroyed);
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
            this._ballDestroyed++;

            // Falling animation
            this.scene.tweens.add({
                targets: ball.image,
                y: ball.image.y + 400,
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

        if (this.balls[0].length === GRID_COLS) {
            cols = GRID_COLS - 1;
            this._indent = true;
        } else {
            cols = GRID_COLS;
            this._indent = false;
        }

        // Handle the position of the new row
        for (let col = 0; col < cols; col++) {
            const newBall = new Ball(this.scene, 0, col);
            newBall.createSingleBall();
            newRow.push(newBall);

            this.ballGroup.add(newBall.image);
        }

        // Insert the new row at the top of the grid
        this.balls.unshift(newRow);

        // Update the row positions of the old balls
        for (let row = 1; row < this.gridLength(); row++) {
            for (let col = 0; col < this.balls[row].length; col++) {
                const oldBall = this.balls[row][col];

                if (oldBall) {
                    oldBall.row = row;
                    oldBall.image.y += BALL_REAL_DIAMETER;
                }
            }
        }
    }
}