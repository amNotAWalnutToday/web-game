import Item from "./item";

export default class Stones extends Item {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'stones', frame = 5) {
        super(scene, x, y, texture, frame);
        this.type = 'stones';
        this.scene.add.existing(this);
        this.setScale(1);
    }
}