import { Character } from "./character";

export default class Goblin extends Character {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.race = 'goblin_mage';
        this.stats.speed = Phaser.Math.Between(3, 6);
    }
} 