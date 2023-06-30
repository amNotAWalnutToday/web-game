import Tree from "./tree";

export default class Sapling extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'sapling', frame = 0) {
        super(scene, x, y, texture, frame);
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        this.tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        this.tileAt.properties.collides = true;
        this.scene.registry.set("map", map);
        this.scene.add.existing(this);
        this.scene.time.addEvent({
            delay: 50,
            callback: this.update,
            callbackScope: this,
            repeat: 100,
        });
    }

    growthPercentage = 0;
    tileAt: Phaser.Tilemaps.Tile;

    update() {
        this.growthPercentage++;
        if(this.growthPercentage === 25) {
            this.setTexture('tree');
            this.setScale(0.25);
        }
        if(this.growthPercentage === 50) {
            this.setScale(0.35);
        }
        if(Math.ceil(this.growthPercentage) === 99) {
            this.scene.physics.add.existing( new Tree(this.scene, this.x, this.y, 'tree', 0));
            this.destroy();
            this.tileAt.properties.collides = false;
        }
    }
}