import buildspot_items from '../data/buildspot_items.json';
import WoodChest from './buildables/wood_chest';
import dropItems from '../utils/dropitems';
import drawProgress from '../utils/drawprogress';
import buildItems from '../utils/builditems';

interface Resource {
    type: string,
    amountToCreate: number,
    amountHere: number,
}

export default class BuildSpot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);
        const map = this.scene.registry.get("map");
        this.builder = this.scene.registry.get("selectedCharacter");
        this.setAlpha(0.25);
        this.scene.add.existing(this);
        this.addToBuildersQueue();
        this.setResources();
        this.setInteractive();
        this.on("pointerdown", () => (console.log(this.resources)));
        this.type = this.scene.registry.get("selectedBuildItem").toLowerCase();
    }

    builder;
    resources: Resource[] = [];
    builtPercentage = 0;
    built = false;
    type = '';

    private progressBar = {
        backdrop: this.scene.add.graphics(),
        bar: this.scene.add.graphics(),
    }

    setResources() {
        const selectedBuildItem = this.scene.registry.get("selectedBuildItem");
        for(const item of buildspot_items.items) {
            if(item.type === selectedBuildItem.toLowerCase()) {
                for(const resource of item.resources) {
                    const newResource = {
                        type: resource.type,
                        amountToCreate: resource.amount,
                        amountHere: 0,
                    }
                    this.resources.push(newResource);
                }
            }
        }
    }

    addResource(outsideResource: string | null) {
        for(const resource of this.resources) {
            if(outsideResource === resource.type) return resource.amountHere++;
        }
    }

    getNeededResources() {
        for(const resource of this.resources) {
            if(resource.amountHere !== resource.amountToCreate) return resource.type;
        }
        return null;
    }

    checkCanBuild(inventory: any = []) {
        for(const resource of this.resources) {
            let extra = 0;
            for(const item of inventory) {
                if(item.type === resource.type) extra = item.amount;
            }
            if(resource.amountHere + extra < resource.amountToCreate) return false; 
        }
        return true;
    }

    buildMe() {
        this.builtPercentage += 1;
        this.drawProgress();
        if(Math.ceil(this.builtPercentage) === 99
        && !this.built) {
            this.built = true;
            buildItems(this.scene, this.type, this.x, this.y);
            this.progressBar.backdrop.clear();
            this.progressBar.bar.clear();
            this.destroy();
        }
    }

    drawProgress() {
        // this.progressBar.backdrop.clear();
        // this.progressBar.bar.clear();
        // if(this.builtPercentage > 98) return;
        // this.progressBar.backdrop.fillStyle(0xff0000);
        // this.progressBar.backdrop.fillRect(this.x - 8, this.y + 16, 18, 2);
        // this.progressBar.bar.fillStyle(0x00ff00);
        // this.progressBar.bar.fillRect(this.x - 8, this.y + 16, Math.ceil(this.builtPercentage / (this.width / 3)), 2);
        drawProgress(this.progressBar, this, this.builtPercentage);
    }

    addToBuildersQueue() {
        this.builder = this.scene.registry.get("selectedCharacter");
        if(this.builder.target) {
            this.builder.buildQueue.unshift(this);
        } else {
            this.builder.build(this);
            this.builder.actionQueue.unshift('BUILD'); 
        }
        this.scene.registry.set("selectedCharacter", this.builder);
    }

    selfDestruct() {
        for(const resource of this.resources) {
            dropItems(this.scene, resource.type, this.x, this.y, resource.amountHere);
            console.log(resource.amountHere);
        }
        this.progressBar.backdrop.clear();
        this.progressBar.bar.clear();
        this.destroy();
    }
}