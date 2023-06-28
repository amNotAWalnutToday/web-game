import Buildable from "./buildable";

interface StorageItem {
    type: string,
    amount: number,
}

export default class WoodChest extends Buildable {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'chest', frame = 0) {
        super(scene, x, y, texture, frame);
        this.setInteractive();
        this.on("pointerdown", () => console.log(this.storage));
        const storage = this.scene.registry.get("storage");
        storage.add(this);
    }

    size = 50;
    storage: StorageItem[] = [];

    addResource(item: string | null) {
        for(const storageItem of this.storage) {
            if(item === storageItem.type) return storageItem.amount++;
        }
        this.storage.push(<StorageItem>{type: item, amount: 1});
    }

    checkStorageIfFull() {
        const amount = this.storage.reduce((prev, current) => {
            const total = current.amount + prev;
            return total; 
        }, 0);
        if(amount >= this.size) return true;
        else false;
    } 
} 