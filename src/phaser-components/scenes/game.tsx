import Phaser from "phaser";
import { Character } from "../characters/character";
import Slime from "../characters/slime";
import Harpy from "../characters/harpy";
import Goblin from "../characters/goblin";
import user from '../data/user.json';
import findPath from "../utils/pathfind";
import Tree from "../nodes/tree";

export function setupTeam(scene: Phaser.Scene, yourCharacters: Character[] = []) {
    yourCharacters.forEach(unit => unit.destroy());
    user.units.forEach((unit, i: number) => {
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
    selectedCommand = 'MOVE';
    yourCharacters: Character[] = [];

    create() {
        this.cameras.main.setBounds(0, 0, 1000 * 2, 1000 * 2);
        this.cameras.main.setZoom(0.75);
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
        const trees = this.physics.add.group();
        for(let i = 10; i > 0; i--) {
            trees.add(new Tree(
                this,
                Phaser.Math.Between(64, 1900),
                Phaser.Math.Between(100, 1900),
                'tree',
                Phaser.Math.Between(0, 5)
            ));
        }
        trees.children.iterate(tree => {
            tree.setInteractive();
            tree.on("pointerdown", (e) => {
                if(this.selectedCommand === 'CHOP') {
                    this.selectedCharacter?.actionQueue.unshift('CHOP');
                    this.selectedCharacter?.chopTree(tree);
                }
            })
        })
        
        setupTeam(this, this.yourCharacters);
        
        this.sourceMarker = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });
        this.sourceMarker.strokeRect(0, 0, 1 * this.map.chunk1.tileWidth, 1 * this.map.chunk1.tileHeight);
        this.input.on('pointerdown', (e) => {
            if(!this.selectedCharacter) {
                return;
            } else {
                //if(this.map.chunk2.getTileAt(Math.floor(e.worldX / 16) - 30, Math.floor(e.worldY / 16), true).properties.terrain === 'water') return;
                const { worldX, worldY } = e;
                const startVec = this.map.full.worldToTileXY(this.selectedCharacter.x, this.selectedCharacter.y);
                const targetVec = this.map.full.worldToTileXY(worldX, worldY);
                const path = findPath(startVec, targetVec, fullMap, null, {race: this.selectedCharacter.race});
                // this.selectedCharacter.moveAlong(path);
                this.selectedCharacter?.moveTowardsPoint(e.worldX, e.worldY, path);
                this.selectedCharacter.targetCoords = [targetVec.x, targetVec.y];
                this.selectedCharacter?.actionQueue.push('MOVE');

                this.time.addEvent({
                    delay: 50,
                    callback: () => this.registry.set("selectedCharacter", this.selectedCharacter),
                    callbackScope: this,
                })   
            }
        });
        this.input.keyboard?.on("keydown-W", () => camera.setVelocityY(-200));
        this.input.keyboard?.on("keydown-S", () => camera.setVelocityY(200));
        this.input.keyboard?.on("keydown-D", () => camera.setVelocityX(200));
        this.input.keyboard?.on("keydown-A", () => camera.setVelocityX(-200));
        this.input.keyboard?.on("keyup-W", () => camera.setVelocityY(0));
        this.input.keyboard?.on("keyup-S", () => camera.setVelocityY(0));
        this.input.keyboard?.on("keyup-A", () => camera.setVelocityX(0));
        this.input.keyboard?.on("keyup-D", () => camera.setVelocityX(0));

        this.registry.set('selectedCharacter', this.selectedCharacter);
        this.yourCharacters = this.registry.get('yourCharacters');
        this.registry.events.on('changedata', (a: any, key: string, payload: any) => {
            switch(key) {
                case "selectedCharacter":
                    camera.x = this.selectedCharacter?.x ?? 0; 
                    camera.y = this.selectedCharacter?.y ?? 0;
                    this.selectedCharacter = payload;
                    this.selectedCharacter ? this.cameras.main.startFollow(this.selectedCharacter) : this.cameras.main.startFollow(camera);
                    break;
                case "selectedCommand":
                    this.selectedCommand = payload;
            }
        });
        this.yourCharacters.forEach(char => {
            char.setCollideWorldBounds(true);
            this.registry.set('yourCharacters', this.yourCharacters);
        });
    }

    update() {
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        const sourceTileX = this.map.chunk1.worldToTileX(worldPoint.x);
        const sourceTileY = this.map.chunk1.worldToTileY(worldPoint.y);
        this.sourceMarker.x = this.map.chunk1.tileToWorldX(sourceTileX);
        this.sourceMarker.y = this.map.chunk1.tileToWorldY(sourceTileY);
        this.yourCharacters.forEach(char => char.update());
    }
}
