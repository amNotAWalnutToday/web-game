import { Character } from "./character";

export default class Harpy extends Character {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.race = 'harpy';
        this.stats.speed = Phaser.Math.Between(5, 18);
        this.stats.maxhp = Phaser.Math.Between(2, 5);
        this.stats.hp    = this.stats.maxhp;
        this.stats.str   = 0;
        this.stats.def   = Phaser.Math.Between(0, 5);
        this.stats.will  = Phaser.Math.Between(4, 10);
    }
} 