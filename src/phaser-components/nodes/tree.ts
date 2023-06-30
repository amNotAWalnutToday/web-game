import drawProgress from "../utils/drawprogress";
import Logs from "./logs";

export default class Tree extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        const trees = this.scene.registry.get("trees");
        this.durability = 5;
        this.scene.add.existing(this);
        trees.add(this);
        this.scene.registry.set("trees", trees);
        this.setScale(0.5);
    }

    durability: number;
    chopped = false;
    chopPercentage = 0;

    private progressBar = {
        backdrop: this.scene.add.graphics(),
        bar: this.scene.add.graphics(),
    }

    loseDurability(): void {
        this.chopPercentage += 0.1;
        drawProgress(this.progressBar, this, this.chopPercentage);
        if(Math.ceil(this.chopPercentage) === 99
        && this.chopped === false) { 
            this.scene.physics.add.existing(
                new Logs(
                    this.scene,
                    this.x,
                    this.y,
                )
            );
            this.chopped = true;
            return this.destroy();
        }
    }
}