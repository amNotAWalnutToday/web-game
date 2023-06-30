import WoodChest from "../nodes/buildables/wood_chest";
import WoodFloor from "../nodes/buildables/wood_floor";
import WoodWall from "../nodes/buildables/wood_wall";

export default function buildItems(
        scene: Phaser.Scene, 
        item: string, 
        x: number, 
        y: number,
    ) {
    switch(item) {
        case 'chest':
            scene.physics.add.existing(
                new WoodChest(
                    scene,
                    x,
                    y
                )
            );
            break;
        case 'wall':
            scene.physics.add.existing(
                new WoodWall(
                    scene,
                    x,
                    y,
                )
            );
            break;
        case 'floor':
            scene.physics.add.existing(
                new WoodFloor(
                    scene,
                    x,
                    y,
                )
            )
    }
}