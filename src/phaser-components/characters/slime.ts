import { Character } from "./character";

export default class Slime extends Character {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.race = 'slime';
        this.speed = Phaser.Math.Between(1, 2);
    }
}