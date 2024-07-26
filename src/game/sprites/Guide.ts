import Phaser from 'phaser';
import { BULLET_START_X, BULLET_START_Y, BALL_SPEED } from '../utils/Constants.js';
import { Bullet } from './Bullet.js';

export class Guide {
    scene: Phaser.Scene;
    bullet: Bullet;
    graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, bullet: Bullet) {
        this.scene = scene;
        this.bullet = bullet;
        this.graphics = this.scene.add.graphics({ lineStyle: { width: 10, color: 0xffa500 } });

        this.scene.input.on('pointermove', this.updateGuide, this);
        this.scene.input.on('pointerdown', this.shootBullet, this);
    }

    updateGuide(pointer: Phaser.Input.Pointer): void {
        this.graphics.clear();
        this.graphics.lineBetween(BULLET_START_X, BULLET_START_Y, pointer.worldX, pointer.worldY);
    }

    shootBullet(pointer: Phaser.Input.Pointer): void {
        const deg = Math.atan2(pointer.worldY - BULLET_START_Y, pointer.worldX - BULLET_START_X);
        const speedX = BALL_SPEED * Math.cos(deg);
        const speedY = BALL_SPEED * Math.sin(deg);

        if (this.bullet.readytoShoot && this.bullet.bullet) {
            this.bullet.bullet.setVelocity(speedX, speedY);
            this.bullet.readytoShoot = false;
            this.graphics.clear();
        }
    }
}
