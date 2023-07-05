import Mushroom from "../nodes/flora/mushroom";
import Sapling from "../nodes/sapling";

export default function generateFlora(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rank?: string,
) {
    const ran = Phaser.Math.Between(0, 1000);
    if(ran > 0 && ran < 10) {
        scene.physics.add.existing(new Mushroom(scene, x, y));
    } else if(ran > 10 && ran < 12) {
        scene.physics.add.existing(new Sapling(scene, x, y));
    }
    return rank;
}