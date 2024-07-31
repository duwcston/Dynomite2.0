import { Grid } from '../sprites/Grid';

export class Score {
    scene: Phaser.Scene;
    score: number;
    scoreText: Phaser.GameObjects.Text;
    width: number;
    height: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.width = this.scene.scale.width;
        this.height = this.scene.scale.height;
        this.score = 0;
        this.displayScore();
    }

    private displayScore(): void {
        this.scoreText = this.scene.add.text(16, this.height - 64, 'Score: 0', {
            fontSize: '32px',
            fontStyle: 'bold',
        }).setDepth(1);
    }

    public increaseScore(): void {
        this.score += Grid.instance.ballDestroyed;
        Grid.instance.ballDestroyed = 0;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}