import { Character } from "./character";

export default class Harpy extends Character {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.race = 'harpy';
        this.speed = Phaser.Math.Between(5, 18);
    }
} 