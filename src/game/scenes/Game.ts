import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';

const DPR = window.devicePixelRatio;

export class Game extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('Game');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.background = this.add.image(width * 0.5, height * 0.5, 'background').setScale(DPR);

        this.physics.world.setBounds(0, 0, width, height);
        this.physics.world.setBoundsCollision(true, true, false, false);

        EventBus.emit('current-scene-ready', this);
    }

}
