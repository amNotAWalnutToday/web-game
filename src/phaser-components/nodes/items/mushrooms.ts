import Item from "./item";

export default class Mushrooms extends Item {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'flora', frame = 5) {
        super(scene, x, y, texture, frame);
        this.type = 'mushroom';
        this.scene.add.existing(this);
        this.setScale(0.8);
    }
}