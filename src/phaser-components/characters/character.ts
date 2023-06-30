import Phaser from "phaser";
import findPath from "../utils/pathfind";
import Tree from "../nodes/tree";
import BuildSpot from "../nodes/buildspot";
import Item from "../nodes/item";
import { getClosest, getClosestStorage } from "../utils/getclosest";
import WoodChest from "../nodes/buildables/wood_chest";

type Target = Tree | BuildSpot | Item | WoodChest | null;

interface InventoryItem {
    type: string,
    amount: number,
}
interface PathClick {
    worldX: number,
    worldY: number,
}

export class Character extends Phaser.Physics.Arcade.Sprite implements Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);

        const yourCharacters = this.scene.registry.get("yourCharacters");
        yourCharacters.push(this);
        this.cid = yourCharacters.length - 1;
        this.speed = 1;
        this.scene.registry.set("yourCharacters", yourCharacters);

        this.scene.add.existing(this);
    }

    race = "slime"; 
    cid: number;
    speed: number;

    currentAction: string | null = null;
    actionQueue: string[] = [];
    buildQueue: BuildSpot[] = [];
    targetCoords: [number, number] = [0, 0];
    isMoving = false;
    isDoing = false;
    target: Target = null;
    pickupTarget: Target = null;
    inventory: InventoryItem[] = [];
    carryCapacity = 1;

    path: { t: number, vec: Phaser.Math.Vector2 } = { t: 0, vec: new Phaser.Math.Vector2() };
    curve: Phaser.Curves.Spline = new Phaser.Curves.Spline();
    graphics: Phaser.GameObjects.Graphics = this.scene.add.graphics();

    private movePath: Phaser.Math.Vector2[] = [];

    create() {
        this.setCollideWorldBounds(true);
    }

    checkInventoryIfFull() {
        const amount = this.inventory.reduce((prev, current) => {
            const total = current.amount + prev;
            return total; 
        }, 0);
        if(amount >= this.carryCapacity) return true;
        else false;
    }

    chopTree() {
        const trees = this.scene.registry.get("trees");
        const closest = getClosest({x: this.x, y: this.y}, trees, 'ANY');
        this.target = closest.item;
        if(!closest.item || !(closest.item instanceof Tree)) return this.currentAction = null;
        if(!this.checkIfArrived(this, closest.item)) {
            this.currentAction = null;
            this.actionQueue.unshift("CHOP");
            return this.getPath({worldX: closest.item.x, worldY: closest.item.y});
        }
        if(this.currentAction !== 'CHOP') return;
        if(closest.item.chopPercentage < 100) closest.item.loseDurability();
        else {
            this.target = null;
            this.currentAction = null;
            this.updateCharacters();
        }
    }

    chopTreeToEnd() {
        if(!this.target) return;
        if(!(this.target instanceof Tree)) return;

        if(this.target.durability - 1 < 0) {
            this.target = null;
            this.currentAction = null;
            this.isDoing = false;
            this.updateCharacters();
        } else {
            this.target.loseDurability();
            console.log(this.target.durability);
        }
    }

    takeFromStorage(item: string) {
        if(!(this.pickupTarget instanceof WoodChest)) return;
        this.pickupTarget.removeItem(item);
        for(const inventoryItem of this.inventory) {
            if(item === inventoryItem.type) return inventoryItem.amount++; 
        }
        this.inventory.push({type: item, amount: 1});
    }

    pickup(item: Target, resourceType?: string | null) {
        if((item && !item.active) || !item ) return;
        if(!(item instanceof Item) && !(item instanceof WoodChest)) return;
        if(item instanceof WoodChest) return this.takeFromStorage(resourceType ?? '');
        item.destroy();
        this.pickupTarget = null;
        for(const inventoryItem of this.inventory) {
            if(item.type === inventoryItem.type) return inventoryItem.amount++; 
        }
        this.inventory.push({type: item.type, amount: 1});
    }

    placeItem(item: string | null, place: any) {
        if(!item) return;
        place.addResource(item);
        let shouldRemove = false;
        for(const inventoryItem of this.inventory) {
            if(inventoryItem.type === item
            && inventoryItem.amount > 0) { 
                inventoryItem.amount--
                if(inventoryItem.amount === 0) shouldRemove = true;
            }
        }
        if(!shouldRemove) return;
        const ind = this.inventory.findIndex((e) => e.type === item);
        this.inventory.splice(ind, 1);
    }

    cancelBuild() {
        if(!(this.target instanceof BuildSpot)) return;
        this.target.selfDestruct();
        this.target = null;
    }

    build(item: BuildSpot) {
        this.target = item;
        if(this.currentAction !== 'BUILD') return;
        if(Math.ceil(item.builtPercentage) < 100) item.buildMe();
        else this.target = null;
    }

    storeItems() {
        this.currentAction = null;
        const groundItems = this.scene.registry.get("groundItems");
        const storage = this.scene.registry.get("storage");
        const closest = getClosest({x: this.x, y: this.y}, groundItems, 'ANY');
        this.target = getClosestStorage({x: this.x, y: this.y}, storage, null, {checkFull: true}).item;
        if(!this.target) return;
        if(closest.item && !this.checkInventoryIfFull()) {
            this.getPath({worldX: closest.item.x, worldY: closest.item.y});
            this.pickupTarget = closest.item;
            this.actionQueue.unshift("PICKUP"); 
        } else if(this.inventory.length) {
            this.getPath({worldX: this.target?.x ?? 0, worldY: this.target?.y ?? 0});
            this.checkIfArrived(this, this.target) 
                ? this.placeItem(this.inventory[0].type, this.target)
                : null;
        }
        this.actionQueue.unshift("CARRY");
    }

    getResources(resource: string | null, fromStorage = false) {
        const groundItems = this.scene.registry.get("groundItems");
        const storage = this.scene.registry.get("storage");
        const closest = fromStorage 
            ? getClosestStorage({x: this.x, y: this.y}, storage, resource, {checkForResource: true})
            : getClosest({x: this.x, y: this.y}, groundItems, resource);
        if(!closest.item) return groundItems;
        this.getPath({worldX: closest.item.x, worldY: closest.item.y});
        this.pickupTarget = closest.item;
        this.actionQueue.unshift("PICKUP");
        return groundItems;
    }

    getPath(clickEvent: Phaser.Input.Pointer | PathClick) {
        const { worldX, worldY } = clickEvent;
        const map = this.scene.registry.get("map");
        const startVec = map.map.worldToTileXY(this.x, this.y);
        const targetVec = map.map.worldToTileXY(worldX, worldY);
        const path = findPath(startVec, targetVec, map.layers[0], null, {race: this.race});
        this.moveTowardsPoint(worldX, worldY, path);
        this.targetCoords = [targetVec.x, targetVec.y];
        this.actionQueue.push('MOVE');
    }

    moveTowardsPoint(tarX: number, tarY: number, path: Phaser.Math.Vector2[]) {
        const distance = Math.abs(this.x - tarX) > Math.abs(this.y - tarY) ? Math.abs(this.x - tarX) : Math.abs(this.y - tarY);
        if(!path.length) return;
        this.movePath = path;

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };
        this.graphics.clear();
        this.graphics = this.scene.add.graphics();
        this.curve = new Phaser.Curves.Spline([...path]);
        this.scene.tweens.add({
            targets: this.path,
            t: 1,
            duration: (60 - (this.speed * 2.5)) * distance,
            repeat: 0
        });
    }

    checkIfArrived(start: Phaser.Physics.Arcade.Sprite, target: Phaser.Physics.Arcade.Sprite) {
        if(!start || !target) return;
        const map = this.scene.registry.get("map");
        const startVec = map.map.worldToTileXY(start.x, start.y);
        const targetVec = map.map.worldToTileXY(target.x, target.y);
        const xDif = Math.abs(startVec.x - targetVec.x);
        const yDif = Math.abs(startVec.y - targetVec.y);
        if(xDif < 2 && yDif < 2) {
            return true;
        } else {
            return false;
        }
    }

    updateCharacters() {
        const yourCharacters = this.scene.registry.get("yourCharacters");
        for(const char of yourCharacters) {
            if(this.cid === char.cid) yourCharacters[this.cid] = this;
        }
        this.scene.registry.set("yourCharacters", yourCharacters);
    }

    update() {
        if(!this.actionQueue.length && !this.currentAction && !this.buildQueue.length) return;
        if(!this.currentAction && this.actionQueue.length) {
            const nextAction = this.actionQueue.pop();
            this.currentAction = nextAction ?? null;
            this.updateCharacters();
        } else if(!this.target && this.buildQueue.length) {
            const nextTarget = this.buildQueue.pop();
            this.target = nextTarget ?? null;
            this.actionQueue.unshift("BUILD");
            this.updateCharacters();
        }

        if(this.movePath.length) {
            if(Math.ceil(this.x) === this.movePath[this.movePath.length - 1].x 
            && Math.ceil(this.y) === this.movePath[this.movePath.length - 1].y 
            && this.currentAction === 'MOVE') {
                this.currentAction = null;
                this.isMoving = false;
                this.graphics.clear();
            }

            if(!this.pickupTarget?.active) {
                if(this.target instanceof BuildSpot
                && !this.target.checkCanBuild(this.inventory)) {
                    this.pickupTarget = null;
                    this.getResources(this.target?.getNeededResources());
                }
            }

            if(this.currentAction === 'MOVE') {
                this.graphics.clear();
        
                this.curve.draw(this.graphics);  
                this.curve.updateArcLengths();
                this.curve.getPoint(this.path.t, this.path.vec);
        
                this.x = this.path.vec.x;
                this.y = this.path.vec.y;
            }
        }
        if(this.currentAction === 'PICKUP') {
            /*eslint-disable-next-line*/
            if(!this.checkIfArrived(this, this.pickupTarget!)) {
                this.currentAction = null;
                this.actionQueue.unshift('PICKUP');
            } else {
                this.currentAction = null;
                const resourceType = this.target instanceof BuildSpot 
                    ? this.target.getNeededResources()
                    : '';
                this.pickup(this.pickupTarget, resourceType);
                this.pickupTarget = null;
            }
        }
        if(this.currentAction === 'CARRY') {
            this.storeItems();
        }

        if(this.currentAction === 'CHOP') {
            this.chopTree();
        }
        if(this.currentAction === 'BUILD'
        && this.target) {
            if(!(this.target instanceof BuildSpot)) return;
            if(!this.target.checkCanBuild(this.inventory)
            && !this.checkInventoryIfFull()) {
                const storage = this.scene.registry.get("storage");
                const groundItems = this.scene.registry.get("groundItems");
                const neededResource = this.target.getNeededResources();
                let storageContains = false;
                storage.children.iterate((store: WoodChest) => {
                    if(store.getItem(neededResource)) return storageContains = true;
                });
                this.getResources(neededResource, storageContains);
                if(!groundItems.children.size
                && !storageContains) {
                    this.target.selfDestruct();
                    this.target = null; 
                }
                this.currentAction = null;
                this.actionQueue.unshift("BUILD");
            } else if(!this.checkIfArrived(this, this.target)) {
                this.getPath({worldX: this.target.x, worldY: this.target.y});
                this.currentAction = null;
                this.actionQueue.unshift("BUILD");
            } else if(this.checkIfArrived(this, this.target)
                   && !this.target.checkCanBuild()) {
                this.placeItem(this.target.getNeededResources(), this.target);
                this.currentAction = null;
                this.actionQueue.unshift("BUILD");
            } else if(this.checkIfArrived(this, this.target)) {
                this.build(this.target);
            }
        } else if(this.currentAction === 'BUILD'
               && !this.target) {
            this.currentAction = null;
        }

        this.updateCharacters();
    }
} 