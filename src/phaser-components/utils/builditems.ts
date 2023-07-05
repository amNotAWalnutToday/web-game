import Campfire from "../nodes/buildables/campfire";
import Mat from "../nodes/buildables/mat";
import WoodChest from "../nodes/buildables/wood_chest";
import WoodFloor from "../nodes/buildables/wood_floor";
import WoodWall from "../nodes/buildables/wood_wall";
import Sapling from "../nodes/sapling";
import Seed from "../nodes/seed";

export default function buildItems(
        scene: Phaser.Scene, 
        item: string, 
        x: number, 
        y: number,
    ) {
    switch(item) {
        case 'chest':
            scene.physics.add.existing(new WoodChest(scene, x, y));
            break;
        case 'wall':
            scene.physics.add.existing(new WoodWall(scene, x, y,));
            break;
        case 'floor':
            scene.physics.add.existing(new WoodFloor(scene, x, y,));
            break;
        case 'mat':
            scene.physics.add.existing(new Mat(scene, x, y));
            break;
        case 'campfire':
            scene.physics.add.existing(new Campfire(scene, x, y));
            break;
        case 'sapling':
            scene.physics.add.existing(new Sapling(scene, x, y,));
            break;
        case 'mushroom':
            scene.physics.add.existing(new Seed(scene, x, y));
    }
}