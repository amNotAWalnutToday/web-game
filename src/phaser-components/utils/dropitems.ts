import Earthgem from "../nodes/items/earthgem";
import Firegem from "../nodes/items/firegem";
import Logs from "../nodes/items/logs";
import Stones from "../nodes/items/stones";

export default function dropItems(
        scene: Phaser.Scene, 
        item: string, 
        x: number, 
        y: number,
        amount: number,
    ) {
    for(let i = 0; i < amount; i++) {
        switch(item) {
            case 'logs':
                scene.physics.add.existing(new Logs(scene, x, y));
                break;
            case 'stones':
                scene.physics.add.existing(new Stones(scene, x, y));
                break;
            case 'earthstone':
                scene.physics.add.existing(new Earthgem(scene, x, y));
                break;
            case 'firestone':
                scene.physics.add.existing(new Firegem(scene, x, y));
                break;
        }
    }
}