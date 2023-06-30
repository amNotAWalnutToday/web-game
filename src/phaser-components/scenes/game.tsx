import Phaser from "phaser";
import { Character } from "../characters/character";
import Slime from "../characters/slime";
import Harpy from "../characters/harpy";
import Goblin from "../characters/goblin";
import user from '../data/user.json';
import Tree from "../nodes/tree";
import BuildSpot from "../nodes/buildspot";
import Logs from "../nodes/logs";

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
        if(unit.speed) thisUnit.speed = unit.speed;
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
    yourCharacters: Character[] = [];
    pointerDown = false;

    placeBuildItem(e: Phaser.Input.Pointer) {
        if(!this.selectedBuildItem || !this.selectedCharacter
        || !this.pointerDown) return;
        const { x, y } = this.map.full.worldToTileXY(e.worldX, e.worldY);
        const tileProps = this.map.full.getTileAt(x, y).properties;
        if(tileProps.buildingHere || tileProps.terrain === 'water') return;
        if(this.selectedCharacter.target instanceof BuildSpot) {
            this.selectedCharacter.buildQueue.push(
                this.physics.add.existing(new BuildSpot(this, (x * 16) + 8, (y * 16) + 8, this.selectedBuildItem.toLowerCase(), 0))
            );
        } else {
            this.physics.add.existing(new BuildSpot(this, (x * 16) + 8, (y * 16) + 8, this.selectedBuildItem.toLowerCase(), 0));
        }
        tileProps.buildingHere = true;        
    }

    create() {
        this.cameras.main.setBounds(0, 0, 1000 * 2, 1000 * 2);
        this.cameras.main.setZoom(1);
        this.physics.world.setBounds(0, 0, 1000 * 2, 1000 * 2);
        const camera = this.physics.add.sprite(0, 0, '', 0).setVisible(false);
        this.cameras.main.startFollow(camera);
        // this.map = this.make.tilemap({ tileHeight: 16, tileWidth: 16, width: 600, height: 480 });
        //const floorTiles = this.map.addTilesetImage('forest_tiles');
        //const floorLayer = this.map.createBlankLayer('floor', floorTiles ? floorTiles : 'floor');
        //floorLayer?.randomize(0, 0, this.map.width, this.map.height, [12]);
        
        this.map = {
            chunk1: this.make.tilemap( {key: 'forest_chunk_1'} ),
            chunk2: this.make.tilemap( {key: 'forest_chunk_2'} ),
            full: this.make.tilemap({ key: 'full_forest_1' }),
        };
        // const forestCliffs = this.map.chunk1.addTilesetImage('forest_cliffs', 'forest_cliffs');
        // const waterTiles =  this.map.chunk1.addTilesetImage('water_tiles', 'water_tiles');
        // const forestchunk = this.map.chunk1.createLayer('forest', forestCliffs, 0, 0 );
        // const chunk1 = this.map.chunk1.createLayer('shallow_water', waterTiles, 0, 0);
        // const terrain = this.map.chunk2.addTilesetImage('forest_cliffs', 'forest_cliffs');
        // const water = this.map.chunk2.addTilesetImage('water_tiles', 'water_tiles');
        // const chunk2 = this.map.chunk2.createLayer('terrain', [terrain, water], 480, 0);
        this.map.full.addTilesetImage('forest_tileset', 'forest_tileset');
        this.map.full.addTilesetImage('water_tiles', 'water_tiles');
        const fullMap = this.map.full.createLayer('ground', ['forest_tileset', 'water_tiles'], 0, 0);
        fullMap.setDepth(-5);
        const storage = this.physics.add.group();
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
        }
        // trees.children.iterate((tree: Tree) => {
        //     tree.setInteractive();
        //     tree.on("pointerdown", () => {
        //         console.log(this.selectedCommand);
        //         if(this.selectedCommand === 'CHOP') {
        //             this.selectedCharacter?.actionQueue.unshift('CHOP');
        //             this.selectedCharacter?.chopTree(tree);
        //         }
        //     })
        // //})
        
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

        this.registry.set('map', {map: this.map.full, layers: [fullMap]});
        this.registry.set('selectedCharacter', this.selectedCharacter);
        this.registry.set('groundItems', groundItems);
        this.registry.set('storage', storage);
        this.registry.set('trees', trees);
        this.yourCharacters = this.registry.get('yourCharacters');
        this.registry.events.on('changedata', (a: unknown, key: string, payload: any) => {
            switch(key) {
                case "selectedCharacter":
                    camera.x = this.selectedCharacter?.x ?? 0; 
                    camera.y = this.selectedCharacter?.y ?? 0;
                    this.selectedCharacter = payload;
                    this.selectedCharacter ? this.cameras.main.startFollow(this.selectedCharacter) : this.cameras.main.startFollow(camera);
                    break;
                case "selectedCommand":
                    this.selectedCommand = payload;
                    this.selectedBuildItem = null;
                    this.registry.set("selectedBuildItem", this.selectedBuildItem);
                    break;
                case "selectedBuildItem":
                    this.selectedBuildItem = payload;
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
        const dpr = window.devicePixelRatio;
        const widthDPR = Math.round(window.innerWidth * dpr);
        const heightDPR = Math.round(window.innerHeight * dpr);
    
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
