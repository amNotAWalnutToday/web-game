import Phaser from "phaser";
import { Character } from "../characters/character";
import Slime from "../characters/slime";
import Harpy from "../characters/harpy";
import Goblin from "../characters/goblin";
import user from '../data/user.json';

export function setupTeam(scene: Phaser.Scene, yourCharacters: Character[] = []) {
    yourCharacters.forEach(unit => unit.destroy());
    user.units.forEach((unit, i) => {
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
    scene.registry.set("shouldSetupTeam", false);
    return yourCharacters;
}

export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }

    map: any;
    sourceMarker: any;
    selectedCharacter: Character | null;
    yourCharacters: Character[] = [];

    create() {
        this.map = this.make.tilemap({ tileHeight: 16, tileWidth: 16, width: 600, height: 480 });
        const floorTiles = this.map.addTilesetImage('forest_tiles');
        const floorLayer = this.map.createBlankLayer('floor', floorTiles ? floorTiles : 'floor');
        floorLayer?.randomize(0, 0, this.map.width, this.map.height, [12]);
        // user.units.forEach((unit, i) => {
        //     let thisUnit;
        //     switch(unit.race) {
        //         case "goblin_mage":  
        //             thisUnit = this.physics.add.existing(
        //                 new Goblin(
        //                     this, 
        //                     unit.localLocation[0], 
        //                     unit.localLocation[1],
        //                     unit.race,
        //                     0,
        //                 )
        //             );
        //             break;
        //         case "slime":
        //             thisUnit = this.physics.add.existing(
        //                 new Slime(
        //                     this,
        //                     unit.localLocation[0],
        //                     unit.localLocation[1],
        //                     unit.race,
        //                     0,
        //                 )
        //             );
        //             break;
        //         case "harpy":
        //             thisUnit = this.physics.add.existing(
        //                 new Harpy(
        //                     this,
        //                     unit.localLocation[0],
        //                     unit.localLocation[1],
        //                     unit.race,
        //                     0,
        //                 )
        //             );
        //             break;
        //     }
        //     if(!thisUnit) return;
        //     thisUnit.create();
        //     thisUnit.cid = i;
        //     this.yourCharacters.push(thisUnit);
        // });
        setupTeam(this, this.yourCharacters);
        this.selectedCharacter = null; 
        
        this.sourceMarker = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });
        this.sourceMarker.strokeRect(0, 0, 1 * this.map.tileWidth, 1 * this.map.tileHeight);
        this.input.on('pointerdown', (e) => {
            if(!this.selectedCharacter) return;
            this.selectedCharacter?.moveTowardsPoint(e.x, e.y);
            this.selectedCharacter.targetCoords = [e.x, e.y];
            this.selectedCharacter?.actionQueue.push('MOVE');
            this.time.addEvent({
                delay: 50,
                callback: () => this.registry.set("selectedCharacter", this.selectedCharacter),
                callbackScope: this,
            })
        });

        this.registry.set('selectedCharacter', this.selectedCharacter);
        this.yourCharacters = this.registry.get('yourCharacters');
        this.registry.events.on('changedata', (a, key) => {
            switch(key) {
                case "selectedCharacter":
                    this.selectedCharacter = this.registry.get('selectedCharacter');
                    break;
            }
        })
    }

    update() {
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        const sourceTileX = this.map.worldToTileX(worldPoint.x);
        const sourceTileY = this.map.worldToTileY(worldPoint.y);
        this.sourceMarker.x = this.map.tileToWorldX(sourceTileX);
        this.sourceMarker.y = this.map.tileToWorldY(sourceTileY);
        if(!this.selectedCharacter) return;
        this.selectedCharacter.update();
        this.yourCharacters.forEach(char => char.update());
    }
}
