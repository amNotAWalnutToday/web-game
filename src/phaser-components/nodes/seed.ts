import Mushroom from "./flora/mushroom";

export default class Seed extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'flora', frame = 5) {
        super(scene, x, y, texture, frame);
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        this.tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        this.tileAt.properties.collides = true;
        this.scene.registry.set("map", map);
        this.scene.add.existing(this);
        this.scene.registry.events.on("changedata", (a: unknown, key: string) => {
            if(key === 'gameTime') this.update();
            else if(key === 'sadsadafagcxv') console.log(a);
        });
    }

    growthPercentage = 0;
    tileAt: Phaser.Tilemaps.Tile;
    frameNum = 0;

    update() {
        this.growthPercentage += 5;
        if(this.growthPercentage === 25) {
            this.setScale(0.75);
            this.setFrame(4);
            this.frameNum = 4;
        }
        if(this.growthPercentage === 50) {
            this.setScale(1);
        }
        if(Math.ceil(this.growthPercentage) === 100) {
            this.scene.physics.add.existing( new Mushroom(this.scene, this.x, this.y));
            this.destroy();
            this.tileAt.properties.collides = false;
        }
    }
}