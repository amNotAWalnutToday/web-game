import Phaser from "phaser";
import { Character } from "../characters/character";
import Slime from "../characters/slime";
import Harpy from "../characters/harpy";
import Goblin from "../characters/goblin";
import user from '../data/user.json';
import Tree from "../nodes/tree";
import BuildSpot from "../nodes/buildspot";
import Logs from "../nodes/items/logs";
import generateStones from "../utils/generatestones";
import generateFlora from "../utils/generateFlora";
import Stones from "../nodes/items/stones";
import Firegem from "../nodes/items/firegem";
import Mushrooms from "../nodes/items/mushrooms";
import WoodChest from "../nodes/buildables/wood_chest";

type Commands = 'MOVE' | 'BUILD' | 'CHOP' | 'CARRY'; 

export function setupTeam(scene: Phaser.Scene, yourCharacters: Character[] = []) {
    yourCharacters.forEach(unit => unit.destroy());
    user.units.forEach((unit) => {
        let thisUnit;
        switch(unit.race) {
            case "goblin_mage":  
                thisUnit = scene.physics.add.existing(
                    new Goblin(
                        scene, 
                        unit.localLocation[0], 
                        unit.localLocation[1],
                        unit.race,
                        0,
                    )
                );
                break;
            case "slime":
                thisUnit = scene.physics.add.existing(
                    new Slime(
                        scene,
                        unit.localLocation[0],
                        unit.localLocation[1],
                        unit.race,
                        0,
                    )
                );
                break;
            case "harpy":
                thisUnit = scene.physics.add.existing(
                    new Harpy(
                        scene,
                        unit.localLocation[0],
                        unit.localLocation[1],
                        unit.race,
                        0,
                    )
                );
                break;
        }
        if(!thisUnit) return;
        thisUnit.name = unit.name ?? 'nameless';
        thisUnit.rank = unit.rank ?? 'E';
        if(unit.stats) {
            const unitStatsFromSave: {[key: string]: number} = unit.stats;
            for(const stat in unitStatsFromSave) {
                for(const newStat in thisUnit.stats) {
                    if(stat === newStat) thisUnit.stats[newStat] = unitStatsFromSave[stat];
                }
            }
        }
        // if(unit.speed) thisUnit.stats.speed = unit.speed;
    });
    return yourCharacters;
}

export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }

    map: any;
    sourceMarker: any;
    selectedCharacter: Character | null = null;
    selectedCommand: Commands = 'MOVE';
    selectedBuildItem: string | null = null;
    selectedInspection: any = null;
    yourCharacters: Character[] = [];
    pointerDown = false;
    isCameraLocked = true;

    gameTime = {
        hour: 8,
        day: 1,
    }

    convertBuildItem(item: string) {
        if(item === 'mushroom') return 'flora';
        return item;
    }

    placeBuildItem(e: Phaser.Input.Pointer) {
        if(!this.selectedBuildItem || !this.selectedCharacter
        || !this.pointerDown || this.selectedBuildItem === 'DESTROY') return;
        const { x, y } = this.map.full.worldToTileXY(e.worldX, e.worldY);
        const tileProps = this.map.full.getTileAt(x, y)?.properties;
        if(!tileProps) return;
        if(tileProps.buildingHere || tileProps.terrain === 'water') return;
        if(this.selectedCharacter.target instanceof BuildSpot) {
            this.selectedCharacter.buildQueue.push(
                this.physics.add.existing(new BuildSpot(this, (x * 16) + 8, (y * 16) + 8, this.convertBuildItem(this.selectedBuildItem.toLowerCase()), 0))
            );
        } else {
            this.physics.add.existing(new BuildSpot(this, (x * 16) + 8, (y * 16) + 8, this.convertBuildItem(this.selectedBuildItem.toLowerCase()), 0));
        }
        tileProps.buildingHere = true;        
    }

    create() {
        this.cameras.main.setBounds(-1000, -1000, 1000 * 4, 1000 * 4);
        this.cameras.main.setZoom(1);
        this.physics.world.setBounds(0, 0, 1000 * 2, 1000 * 2);
        const camera = this.physics.add.sprite(0, 0, '', 0).setVisible(false);
        this.cameras.main.startFollow(camera);    
        this.map = {
            chunk1: this.make.tilemap( {key: 'forest_chunk_1'} ),
            chunk2: this.make.tilemap( {key: 'forest_chunk_2'} ),
            night: this.add.graphics(),
            full: this.make.tilemap({ key: 'full_forest_1' }),
        };
        this.map.full.addTilesetImage('forest_tileset', 'forest_tileset');
        this.map.full.addTilesetImage('water_tiles', 'water_tiles');
        this.map.full.addTilesetImage('forest_cliffs', 'forest_cliffs');
        const fullMap = this.map.full.createLayer('ground', ['forest_tileset', 'water_tiles', 'forest_cliffs'], 0, 0);
        fullMap.setDepth(-5);
        this.registry.set('map', {map: this.map.full, layers: [fullMap]});

        const updateTime = () => {
            const { width, height } = fullMap;
            this.gameTime.hour++;
            if(this.gameTime.hour < 7 || this.gameTime.hour > 18) {
                this.map.night.clear();
                this.map.night.fillStyle(0x111111, 0.3);
                this.map.night.fillRect(0, 0, width, height);
            } else {
                this.map.night.clear();
            }
            if(this.gameTime.hour >= 24) {
                this.gameTime.hour = 0;
                this.gameTime.day++;
            }
            this.registry.set("gameTime", this.gameTime);
        }

        this.time.addEvent({
            delay: 15000,
            callback: updateTime,
            callbackScope: this,
            loop: true,
        });

        this.registry.set('gameTime', this.gameTime);


        const storage = this.physics.add.group();
        const cookingStations = this.physics.add.group();
        this.registry.set("cookingStations", cookingStations);
        const itemsToDeconstruct = this.physics.add.group();
        const plants = this.physics.add.staticGroup();
        this.registry.set("plants", plants);
        const miningNodes = this.physics.add.staticGroup();
        this.registry.set("miningNodes", miningNodes);
        const fishingTiles: any = { children: [] };
        this.map.full.forEachTile((tile: Phaser.Tilemaps.Tile) => {
            if(tile.properties.terrain === 'water') fishingTiles.children.push(tile);
            if(tile.properties.terrain === 'stone') {
                generateStones(this, (tile.x * 16) + 8, (tile.y * 16) + 8, 'E');
            }
            if(tile.properties.terrain === 'forest') {
                generateFlora(this, (tile.x * 16) + 8, (tile.y * 16) + 8, 'E');
            }
        });
        this.registry.set("fishingTiles", fishingTiles);
        const groundItems = this.physics.add.group();
        this.registry.set('groundItems', groundItems);
        const trees = this.physics.add.group();
        this.registry.set("trees", trees);
        for(let i = 10; i > 0; i--) {
            trees.add(new Tree(
                this,
                Phaser.Math.Between(64, 400),
                Phaser.Math.Between(100, 400),
                'tree',
                Phaser.Math.Between(0, 5)
            ));
            this.physics.add.existing(new Logs(
                    this,
                    Phaser.Math.Between(64, 400),
                    Phaser.Math.Between(100, 400),
                    'logs',
                    0
            ));
            this.physics.add.existing(new Stones(
                this,
                Phaser.Math.Between(64, 400),
                Phaser.Math.Between(100, 400),
            ));
        }
        this.physics.add.existing(new Firegem(
            this,
            Phaser.Math.Between(64, 400),
            Phaser.Math.Between(100, 400),
        ));
        this.physics.add.existing(new Mushrooms(
            this,
            Phaser.Math.Between(64, 400),
            Phaser.Math.Between(100, 400),
        ));
        
        setupTeam(this, this.yourCharacters);
        
        this.sourceMarker = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });
        this.sourceMarker.strokeRect(0, 0, 1 * this.map.chunk1.tileWidth, 1 * this.map.chunk1.tileHeight);
        this.input.on('pointerdown', (e: Phaser.Input.Pointer) => {
            if(!this.selectedCharacter) {
                return;
            } else if(this.selectedBuildItem) {
                this.pointerDown = true;
               this.placeBuildItem(e);
            } else {
                this.selectedCharacter.getPath(e);
            }
        });
        this.input.on('pointerup', () => {
            if(!this.selectedCharacter || !this.selectedBuildItem) return;
            this.pointerDown = false;
        })
        this.input.on('pointermove', (e: Phaser.Input.Pointer) => this.placeBuildItem(e));
        this.input.keyboard?.on("keydown-W", () => camera.setVelocityY(-200));
        this.input.keyboard?.on("keydown-S", () => camera.setVelocityY(200));
        this.input.keyboard?.on("keydown-D", () => camera.setVelocityX(200));
        this.input.keyboard?.on("keydown-A", () => camera.setVelocityX(-200));
        this.input.keyboard?.on("keyup-W", () => camera.setVelocityY(0));
        this.input.keyboard?.on("keyup-S", () => camera.setVelocityY(0));
        this.input.keyboard?.on("keyup-A", () => camera.setVelocityX(0));
        this.input.keyboard?.on("keyup-D", () => camera.setVelocityX(0));
        this.input.keyboard?.on("keydown-Q", () => console.log(this.selectedCharacter?.inventory));

        this.registry.set('selectedCharacter', this.selectedCharacter);
        this.registry.set('itemsToDeconstruct', itemsToDeconstruct);
        this.registry.set('groundItems', groundItems);
        this.registry.set('storage', storage);
        this.registry.set('trees', trees);
        this.registry.set("selectedInspection", this.selectedInspection);
        this.yourCharacters = this.registry.get('yourCharacters');
        this.registry.events.on('changedata', (a: unknown, key: string, payload: any) => {
            switch(key) {
                case "selectedCharacter":
                    this.selectedCharacter = payload;
                    if(!this.registry.get("isCameraLocked")) return;
                    camera.x = this.selectedCharacter?.x ?? 0; 
                    camera.y = this.selectedCharacter?.y ?? 0;
                    this.selectedCharacter ? this.cameras.main.startFollow(this.selectedCharacter) : this.cameras.main.startFollow(camera);
                    this.registry.set("isCameraLocked", true);
                    break;
                case "selectedCommand":
                    this.selectedCommand = payload;
                    this.selectedBuildItem = null;
                    this.registry.set("selectedBuildItem", this.selectedBuildItem);
                    break;
                case "selectedBuildItem":
                    this.selectedBuildItem = payload;
                    break;
                case "isCameraLocked":
                    this.isCameraLocked = payload;
                    camera.x = this.selectedCharacter?.x ?? 0; 
                    camera.y = this.selectedCharacter?.y ?? 0;
                    if(!this.selectedCharacter) return this.cameras.main.startFollow(camera);
                    this.isCameraLocked ? this.cameras.main.startFollow(this.selectedCharacter) : this.cameras.main.startFollow(camera);
                    break;
                case 'dunnowhattodowiththeaargsoimmajustdothis':
                    console.log(a);
                    break;
            }
        });
        this.yourCharacters.forEach(char => {
            char.setCollideWorldBounds(true);
            this.registry.set('yourCharacters', this.yourCharacters);
        });
        window.addEventListener('resize', () => this.resize());
        const chest = this.physics.add.existing(new WoodChest(
            this,
            Phaser.Math.Between(64, 400),
            Phaser.Math.Between(100, 400),
        ));
        chest.storage.push({type: 'stew', amount: 10}, {type: 'flax', amount: 20}, {type: 'crayfish', amount: 10}, {type: 'mushroom', amount: 10});
    }

    update() {
        this.yourCharacters.forEach(char => char.update());
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        if(!(worldPoint instanceof Phaser.Math.Vector2)) return;
        const sourceTileX = this.map.chunk1.worldToTileX(worldPoint.x);
        const sourceTileY = this.map.chunk1.worldToTileY(worldPoint.y);
        
        this.sourceMarker.x = this.map.chunk1.tileToWorldX(sourceTileX);
        this.sourceMarker.y = this.map.chunk1.tileToWorldY(sourceTileY);
    }
    
    resize() {
        // const dpr = window.devicePixelRatio;  below * 2 <= before
        const widthDPR = Math.round(window.innerWidth);
        const heightDPR = Math.round(window.innerHeight);
    
        this.sys.game.scale.parent.width = Math.round(window.innerWidth);
        this.sys.game.scale.parent.height = Math.round(window.innerHeight);
    
        this.sys.game.scale.resize(widthDPR, heightDPR);
    
        this.sys.game.scale.canvas.style.width = Math.round(window.innerWidth) + 'px';
        this.sys.game.scale.canvas.style.height = Math.round(window.innerHeight) + 'px';
    
        this.sys.game.scale.setGameSize(widthDPR, heightDPR);
        this.sys.game.scale.setParentSize(window.innerWidth, window.innerHeight);
    
        this.registry.set("gameSize", {width: widthDPR, height: heightDPR});
    }
}
