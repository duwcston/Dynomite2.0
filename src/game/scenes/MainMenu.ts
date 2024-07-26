import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload(): void {
        // Load assets here
        this.load.image('background', 'assets/dawn.png');
    }

    create(): void {
        const { width, height } = this.sys.game.config;

        // Add background image
        this.add.image(width as number / 2, height as number / 2, 'background');

        // Add title text
        this.add.text(width as number / 2, height as number / 4, 'Dynomite', {
            fontSize: '64px',
            color: '#443fa3',
            fontStyle: 'bold',
            shadow: { offsetX: 5, offsetY: 5, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5);

        // Add start game button
        this.createButton(width as number / 2, height as number / 2, 'Start Game', () => {
            this.scene.start('Game');
        });
    }

    createButton(x: number, y: number, label: string, callback: () => void): Phaser.GameObjects.Text {
        const button = this.add.text(x, y, label, {
            fontSize: '32px',
            backgroundColor: '#443fa3',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: '#ba79c9', color: '#000000' });
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: '#443fa3', color: '#ffffff' });
        });

        button.on('pointerdown', callback);

        return button;
    }
}
