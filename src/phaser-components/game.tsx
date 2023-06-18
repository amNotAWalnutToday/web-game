import Phaser from "phaser";

export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }

    map: any;
    sourceMarker: any;

    preload() {
        this.load.image('slime', '/sprites/slime.png');
        this.load.image('harpy', '/sprites/harpy.png');
        this.load.image('forest_tiles', '/tilesets/forest_tileset.png');
    }

    create() {
        this.map = this.make.tilemap({ tileHeight: 16, tileWidth: 16, width: 600, height: 480 });
        const floorTiles = this.map.addTilesetImage('forest_tiles');
        const floorLayer = this.map.createBlankLayer('floor', floorTiles ? floorTiles : 'floor');
        floorLayer?.randomize(0, 0, this.map.width, this.map.height, [12]);
        this.physics.add.sprite(400, 400, 'slime');
        this.sourceMarker = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });
        this.sourceMarker.strokeRect(0, 0, 1 * this.map.tileWidth, 1 * this.map.tileHeight);
        this.input.on('pointerdown', (e) => {
            console.log(floorLayer.getTileAtWorldXY(e.x, e.y, true));
        });
    }

    update() {
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        const sourceTileX = this.map.worldToTileX(worldPoint.x);
        const sourceTileY = this.map.worldToTileY(worldPoint.y);
        this.sourceMarker.x = this.map.tileToWorldX(sourceTileX);
        this.sourceMarker.y = this.map.tileToWorldY(sourceTileY);
    }
}
