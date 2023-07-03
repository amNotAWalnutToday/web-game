import checkForEmptyTile from "../utils/checkForEmptyTile";
import Firegem from "./items/firegem";
import Stone from "./stone";

export default class Firestone extends Stone {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'stones', frame = 1) {
        super(scene, x, y, texture, frame);
    }

    giveItem() {
        const freeSpot = checkForEmptyTile(this.scene, this.x, this.y);
        if(!freeSpot) return;
        this.scene.add.existing(new Firegem(
            this.scene,
            freeSpot.x * 16,
            freeSpot.y * 16
        ));  
    }
}