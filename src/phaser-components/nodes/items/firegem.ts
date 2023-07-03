import Item from "./item";

export default class Firegem extends Item {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'stones', frame = 6) {
        super(scene, x, y, texture, frame);
        this.type = 'firestone';
        this.scene.add.existing(this);
        this.setScale(1);
    }
}