import { Character } from "./character";

export default class Slime extends Character {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.race = 'slime';
        this.stats.speed = Phaser.Math.Between(1, 2);
        this.stats.maxhp = Phaser.Math.Between(5, 10);
        this.stats.hp = this.stats.maxhp;
        this.stats.str   = Phaser.Math.Between(0, 1);
        this.stats.def   = Phaser.Math.Between(8, 10);
        this.stats.will  = Phaser.Math.Between(1, 3);
    }
}