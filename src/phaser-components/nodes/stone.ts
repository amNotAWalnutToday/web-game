import checkForEmptyTile from "../utils/checkForEmptyTile";
import drawProgress from "../utils/drawprogress";
import Stones from "./items/stones";

export default class Stone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'stones', frame = 0) {
        super(scene, x, y, texture, frame);
        this.scene.add.existing(this);
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        const tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        tileAt.properties.collides = true;
        tileAt.properties.buildingHere = true;
        const miningNodes = this.scene.registry.get("miningNodes");
        miningNodes.add(this);
        this.scene.registry.set("miningNodes", miningNodes);
    }

    amountHere = 10;
    miningPercentage = 0;
    mined = false;

    private progressBar = {
        backdrop: this.scene.add.graphics(),
        bar: this.scene.add.graphics()
    }

    mine() {
        this.miningPercentage += 0.1;
        drawProgress(this.progressBar, this, this.miningPercentage);
        if(Math.ceil(this.miningPercentage) === 99
        && this.mined === false) {
            this.giveItem();
            if(this.amountHere > 0) {
                this.miningPercentage = 0;
                this.amountHere -= 1;
            } else {
                this.mined = true;
                this.selfDestruct();
            }
        }
    }

    giveItem() {
        const freeSpot = checkForEmptyTile(this.scene, this.x, this.y);
        if(!freeSpot) return;
        this.scene.add.existing(new Stones(
            this.scene,
            freeSpot.x * 16,
            freeSpot.y * 16
        ));  
    }

    selfDestruct() {
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        const tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        tileAt.properties.collides = false;
        tileAt.properties.buildingHere = false;
        this.progressBar.bar.destroy();
        this.progressBar.backdrop.destroy();        
        this.destroy();
    }
}