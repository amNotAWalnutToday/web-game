import checkForEmptyTile from "../utils/checkForEmptyTile";
import Earthgem from "./items/earthgem";
import Stone from "./stone";

export default class Earthstone extends Stone {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'stones', frame = 4) {
        super(scene, x, y, texture, frame);
    }

    giveItem() {
        const freeSpot = checkForEmptyTile(this.scene, this.x, this.y);
        if(!freeSpot) return;
        this.scene.add.existing(new Earthgem(
            this.scene,
            freeSpot.x * 16,
            freeSpot.y * 16
        ));  
    }
}