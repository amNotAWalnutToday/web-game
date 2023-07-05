import Earthstone from "../nodes/earthstone";
import Firestone from "../nodes/firestone";
import Stone from "../nodes/stone";

export default function generateStones(
        scene: Phaser.Scene,
        x: number,
        y: number,
        rank?: string,
    ) {
        const ran = Phaser.Math.Between(0, 100);
        if(ran > 0 && ran < 20) {
            scene.physics.add.existing(new Firestone(scene, x, y));
        } else if(ran > 20 && ran < 40) {
            scene.physics.add.existing(new Earthstone(scene, x, y));
        } else if(ran > 40 && ran < 80) {
            scene.physics.add.existing(new Stone(scene, x, y));
        }
        return rank;
}