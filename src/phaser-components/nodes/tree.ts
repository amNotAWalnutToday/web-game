import Logs from "./logs";

export default class Tree extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);

        this.durability = 5;
        this.scene.add.existing(this);
    }

    durability: number;

    loseDurability(): void {
        this.durability--;
        if(this.durability <= 0) { 
            this.scene.physics.add.existing(
                new Logs(
                    this.scene,
                    this.x,
                    this.y,
                    'logs',
                    0
                )
            );
            return this.destroy();
        }
    }
}