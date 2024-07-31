import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Grid } from '../sprites/Grid';
import { Bullet } from '../sprites/Bullet';
import { Guide } from '../sprites/Guide';

export class Game extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    bullet: Bullet;
    guide: Guide;
    grid: Grid;

    constructor() {
        super({ key: 'Game' });
    }

    create(): void {
        const width = this.scale.width;
        const height = this.scale.height;

        this.background = this.add.image(width * 0.5, height * 0.5, 'background');

        this.physics.world.setBounds(0, 0, width, height);
        this.physics.world.setBoundsCollision(true, true, false, false);

        // PHẢI TẠO BULLET TRƯỚC GRID VÀ TRƯỚC KHI SỬ DỤNG
        this.bullet = new Bullet(this, this.grid);

        this.grid = new Grid(this, this.bullet);
        this.grid.createGrid();
        this.grid.startAddingRows(8000); // Add new rows every 8 seconds

        this.guide = new Guide(this, this.bullet);

        EventBus.emit('current-scene-ready', this);
    }

    update(): void {
        this.grid.changeEmptyToNull();
        this.grid.setCollision();
        this.grid.makeSingleBallsFall();
        this.bullet.checkBulletPosition();

        if (this.grid.balls.some(row => row.some(ball => ball && ball.image.y >= this.scale.height - 50))) {
            this.handleGameOver();
        }
    }

    private handleGameOver() {
        this.scene.pause('Game')
        this.scene.run('GameOver')
    }
}
