import Phaser from "phaser";
import { Character } from "./character";

export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }

    map: any;
    sourceMarker: any;
    selectedCharacter: Character;

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
        const player = this.physics.add.existing(new Character(this, 200, 200, 'harpy', 0))
        this.selectedCharacter = player; 
        this.selectedCharacter.create();
        
        this.sourceMarker = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });
        this.sourceMarker.strokeRect(0, 0, 1 * this.map.tileWidth, 1 * this.map.tileHeight);
        this.input.on('pointerdown', (e) => {
            this.selectedCharacter.moveTowardsPoint(e.x, e.y);
            this.selectedCharacter.targetCoords = [e.x, e.y];
            this.selectedCharacter.actionQueue.push('MOVE');
        });
    }

    update() {
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        const sourceTileX = this.map.worldToTileX(worldPoint.x);
        const sourceTileY = this.map.worldToTileY(worldPoint.y);
        this.sourceMarker.x = this.map.tileToWorldX(sourceTileX);
        this.sourceMarker.y = this.map.tileToWorldY(sourceTileY);
        if(!this.selectedCharacter) return;
        this.selectedCharacter.update();
    }
}
