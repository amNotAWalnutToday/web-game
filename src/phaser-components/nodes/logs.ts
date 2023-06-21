import Item from "./item";

export default class Logs extends Item {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);

        this.scene.add.existing(this);
        this.setScale(0.5);
    }
} 