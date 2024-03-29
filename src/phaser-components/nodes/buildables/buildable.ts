import drawProgress from '../../utils/drawprogress';

export default class Buildable extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        this.setInteractive();
        this.on("pointerdown", () => {
            const selectedBuildItem = this.scene.registry.get("selectedBuildItem");
            if(selectedBuildItem === 'DESTROY'
            && !this.isInDeconstructionQueue) {
                const itemsToDeconstruct = this.scene.registry.get("itemsToDeconstruct");
                itemsToDeconstruct.add(this);
                this.isInDeconstructionQueue = true;
                this.toggleMark();
            } else if(this.isInDeconstructionQueue) {
                const itemsToDeconstruct = this.scene.registry.get("itemsToDeconstruct");
                this.isInDeconstructionQueue = false;
                itemsToDeconstruct.remove(this, false, false);
                this.toggleMark();
            }
        });
        this.scene.add.existing(this);
        // this.setBuildOnTop();
    }

    isInDeconstructionQueue = false;
    deconstructPercentage = 0;
    deconstructed = false;

    private deconstructionMark?: Phaser.GameObjects.Image = undefined;

    progressBar = {
        backdrop: this.scene.add.graphics(),
        bar: this.scene.add.graphics()
    }

    // setBuildOnTop() {
    //     const map = this.scene.registry.get("map");
    //     const tileCoords = map.map.worldToTileXY(this.x, this.y);
    //     const tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
    //     console.log(tileAt);
    //     for(const item of buildspot_items.items) {
    //         if(item.type === 'floor') tileAt.properties.buildingHere = false; 
    //     }
    // }

    toggleMark() {
        if(this.isInDeconstructionQueue && !this.deconstructed) {
            this.deconstructionMark = this.scene.add.image(this.x,this.y, 'stop').setScale(0.25).setRotation(45);
        } else {
            this.deconstructionMark?.destroy();
            this.progressBar.bar.clear();
            this.progressBar.backdrop.clear();
        }
    }

    deconstruct() {
        this.deconstructPercentage += 0.25;
        drawProgress(this.progressBar, this, this.deconstructPercentage);
        if(Math.ceil(this.deconstructPercentage) === 99
        && !this.deconstructed) {
            this.deconstructed = true;
            this.selfDestruct();
        }
    }
    
    checkForEmptySpot() {
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        const positions = [
            {x: tileCoords.x, y: tileCoords.y + 1},
            {x: tileCoords.x, y: tileCoords.y - 1},
            {x: tileCoords.x + 1, y: tileCoords.y},
            {x: tileCoords.x - 1, y: tileCoords.y},
        ];
        for(const pos of positions) {
            const tileAt = map.map.getTileAt(pos.x, pos.y);
            if(!tileAt.properties.collides) return pos;
        }
        return null;
    }

    selfDestruct() {
        if(!this.active) return;
        const map = this.scene.registry.get("map");
        const tileCoords = map.map.worldToTileXY(this.x, this.y);
        const tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        tileAt.properties.buildingHere = false;
        tileAt.properties.collides = false;
        this.toggleMark();
        this.progressBar.backdrop.destroy();
        this.progressBar.bar.destroy();
        this.destroy();
    }
}