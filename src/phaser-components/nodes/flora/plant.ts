import drawProgress from "../../utils/drawprogress";

export default class Plant extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.scene.add.existing(this);
        const plants = this.scene.registry.get("plants");
        plants.add(this);
    }

    pickPercentage = 0;
    picked = false;

    private progressBar = {
        backdrop: this.scene.add.graphics(),
        bar: this.scene.add.graphics()
    }

    pick() {
        this.pickPercentage += 0.1;
        drawProgress(this.progressBar, this, this.pickPercentage);
        if(Math.ceil(this.pickPercentage) === 99
        && !this.picked) {
            this.giveItem();
            this.selfDestruct();
        }
    }

    giveItem() {
        return //item spawner;
    }

    selfDestruct() {
        this.progressBar.bar.destroy();
        this.progressBar.backdrop.destroy();        
        this.destroy();
    }
}