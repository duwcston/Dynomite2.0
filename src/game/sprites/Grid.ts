import { Ball } from './Ball.js';
import { Bullet } from './Bullet';
import Phaser from 'phaser';

export class Grid {
    scene: Phaser.Scene;
    balls: Ball[][];
    bullet: Bullet;
    ballGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, bullet: Bullet) {
        this.scene = scene;
        this.balls = [];
        this.ballGroup = this.scene.physics.add.group();
        this.createGrid();

        this.bullet = bullet;
        this.setCollision();
    }

    // Store the initial balls in the grid with 3 rows and 12/11 columns
    private createGrid(): void {
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

        if (bullet.texture.key === sprite.texture.key) {
            console.log('Same color detected');
            sprite.destroy();
            bullet.destroy();
        }
        // Add bullet to the grid after collision
        else {
            const ball = (sprite as any).owner as Ball
            console.log("Ball collided detail:", ball);
            let bulletCollided = null;

            if (ball.row % 2 !== 0) {

                if (bullet.x > ball.x && bullet.y > ball.y) { //Bottom right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col + 1, bulletColor);
                }

                else if (bullet.x < ball.x && bullet.y > ball.y) { //Bottom left
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }

                else if (bullet.x > ball.x && bullet.y < ball.y) { //Top right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col - 1, bulletColor);
                }

                else { //Top left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }
            }

            else {

                if (bullet.x > ball.x && bullet.y > ball.y && ball.col < 11) { //Bottom right
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col, bulletColor);
                }

                else if ((bullet.x < ball.x && bullet.y > ball.y) || (bullet.x > ball.x && bullet.y > ball.y && ball.col === 11)) { //Bottom left    
                    bulletCollided = new Ball(this.scene, ball.row + 1, ball.col - 1, bulletColor);
                }

                else if (bullet.x > ball.x && bullet.y < ball.y) { //Top right
                    bulletCollided = new Ball(this.scene, ball.row, ball.col, bulletColor);
                }

                else { //Top left
                    bulletCollided = new Ball(this.scene, ball.row, ball.col - 1, bulletColor);
                }
            }

            this.balls.push([]);
            this.balls[bulletCollided.row][bulletCollided.col] = bulletCollided;

            bullet.destroy();
            bulletCollided.createSingleBall();
            console.log("Bullet collided detail:", bulletCollided);
            this.ballGroup.add(bulletCollided.image);

        }
        this.bullet.createBullet();
        this.bullet.readytoShoot = true;
    }
}
