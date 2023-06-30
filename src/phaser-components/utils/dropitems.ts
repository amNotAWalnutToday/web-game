import Logs from "../nodes/logs";

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
                scene.physics.add.existing(
                    new Logs(
                        scene,
                        x,
                        y
                    )
                );
                break;
        }
    }
}