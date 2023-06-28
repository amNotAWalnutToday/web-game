import Item from "./item";

export default class Logs extends Item {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'logs', frame = 0) {
        super(scene, x, y, texture, frame);
        this.type = 'logs';
        this.scene.add.existing(this);
        this.setScale(0.5);
    }
} 