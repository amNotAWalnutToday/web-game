import Buildable from "./buildable";

export default class WoodWall extends Buildable {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'wall', frame = 0) {
        super(scene, x, y, texture, frame);
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        const tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        tileAt.properties.collides = true;
        this.scene.registry.set("map", map);
    }
}