import Item from "./item";

export default class Earthgem extends Item {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'stones', frame = 9) {
        super(scene, x, y, texture, frame);
        this.type = 'earthstone';
        this.scene.add.existing(this);
        this.setScale(1);
    }
}