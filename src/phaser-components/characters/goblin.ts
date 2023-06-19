import { Character } from "./character";

export default class Goblin extends Character {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: Phaser.Textures.Texture, frame: any) {
        super(scene, x, y, texture, frame);
        this.race = 'goblin_mage';
    }
} 