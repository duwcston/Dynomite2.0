import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    preload(): void {

    }

    create(): void {
        const { width, height } = this.sys.game.config;

        this.add.text(width as number / 2, height as number / 2 - 50, 'Game Over', {
            fontSize: '64px',
            color: '#443fa3',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        const restartButton = this.add.text(width as number / 2, height as number / 2 + 100, 'Restart', {
            fontSize: '32px',
            backgroundColor: '#443fa3',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerover', () => {
            restartButton.setStyle({ backgroundColor: '#ba79c9', color: '#000000' });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ backgroundColor: '#443fa3', color: '#ffffff' });
        });

        restartButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

    }
}
