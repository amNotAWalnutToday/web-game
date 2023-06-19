import Phaser from "phaser";
import Ui from "./ui";
import Game from "./game";
import Summon from "./summon";

export default class Loading extends Phaser.Scene {
    constructor() {
        super("loading")
    }

    preload() {
        this.load.image('slime', '/sprites/slime.png');
        this.load.image('harpy', '/sprites/harpy.png');
        this.load.image('goblin_mage', '/sprites/goblin_mage.png');
        this.load.image('forest_tiles', '/tilesets/forest_tileset.png');
    }

    create() {
        this.registry.set("selectedCharacter", null);
        this.registry.set("yourCharacters", []);
        this.registry.set("shouldSetupTeam", false);
        this.scene.add('game', Game, true, { x: 400, y: 300 });
        this.scene.add('ui', Ui, true, { x: 400, y: 300 });
        this.scene.add('summon_ui', Summon, false, { x: 400, y: 300 });
        this.scene.stop();
    }
}