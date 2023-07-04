import Mushrooms from "../items/mushrooms";
import Plant from "./plant";

export default class Mushroom extends Plant {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'flora', frame = 3) {
        super(scene, x, y, texture, frame);
        this.scene.add.existing(this);
        const plants = this.scene.registry.get("plants");
        plants.add(this);
    } 

    giveItem() {
        this.scene.add.existing(new Mushrooms(
            this.scene,
            this.x,
            this.y
        ));
    }
}