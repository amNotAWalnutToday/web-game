import Phaser from "phaser";
import Ui from "./ui";
import Game from "./game";
import Summon from "./summon";

export default class Loading extends Phaser.Scene {
    constructor() {
        super("loading")
    }

    preload() {
        this.load.image('slime', 'sprites/slime.png');
        this.load.image('harpy', 'sprites/harpy.png');
        this.load.image('goblin_mage', 'sprites/goblin_mage.png');
        this.load.image('logs', 'sprites/logs.png');
        this.load.image('chest', 'sprites/wood_chest.png');
        this.load.image('wall', 'sprites/wood_wall.png');
        this.load.image('floor', 'sprites/wood_floor.png');
        this.load.image('sapling', 'sprites/sapling.png');
        this.load.image('firestone', 'sprites/firestone.png');
        this.load.image('stop', 'sprites/stop.png');
        this.load.image('mat', 'sprites/mat.png');
        this.load.image('forest_tileset', 'tilesets/forest_tileset.png');
        this.load.image('water_tiles', 'tilesets/water_tiles.png');
        this.load.image('forest_cliffs', 'tilesets/forest_cliffs.png');
        this.load.spritesheet('stones', 'sprites/stones.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('tree', 'tilesets/Trees.png', {
            frameWidth: 64,
            frameHeight: 96,
        });
        this.load.spritesheet('flora', 'sprites/flora.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.spritesheet('campfire', 'sprites/campfire.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.tilemapTiledJSON('forest_chunk_1', 'maps/forest_chunk_1.tmj');
        this.load.tilemapTiledJSON('forest_chunk_2', 'maps/forest_chunk_2.tmj');
        this.load.tilemapTiledJSON('full_forest_1', 'maps/full_forest_1.tmj');
    }

    create() {
        this.registry.set("selectedCharacter", null);
        this.registry.set("yourCharacters", []);
        this.registry.set("selectedCommand", 'MOVE');
        this.registry.set("selectedBuildItem", null);
        this.registry.set("selectedInspection", null);
        this.registry.set("groundItems", []);
        this.registry.set("storage", []);
        this.registry.set("fishingTiles", []);
        this.registry.set("trees", []);
        this.registry.set("miningNodes", []);
        this.registry.set("map", null);
        this.registry.set("isCameraLocked", true);
        this.registry.set("gameTime", <{[key: string]: number}> {});
        this.registry.set("gameSize", { 
            height: this.sys.game.scale.height, 
            width: this.sys.game.scale.width
        });

        this.scene.add('game', Game, true, { x: 400, y: 300 });
        this.scene.add('ui', Ui, true, { x: 400, y: 300 });
        this.scene.add('summon_ui', Summon, false, { x: 400, y: 300 });
        this.scene.stop();
    }
}