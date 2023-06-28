import Phaser from "phaser";
import findPath from "../utils/pathfind";
import Tree from "../nodes/tree";
import BuildSpot from "../nodes/buildspot";
import Item from "../nodes/item";

type Target = Tree | BuildSpot | Item | null;

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

    path: any;
    curve: any;
    graphics: any = this.scene.add.graphics();

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

    chopTree(tree: Tree) {
        this.target = tree;
        if(this.currentAction !== 'CHOP') return;
        this.isDoing = true;

        this.scene.time.addEvent({
            delay: 2000,
            callback: this.chopTreeToEnd,
            callbackScope: this,
            repeat: tree.durability + 1,
        });
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

    pickup(item: Target) {
        if(!(item instanceof Item) || !item.active) return;
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
        const closest: {ind: number, distance: number, item: Item | null} = {ind: 0, distance: NaN, item: null};
        groundItems.children.iterate((item: Item, ind: number) => {
            const disX = Math.abs(item.x - this.x);
            const disY = Math.abs(item.y - this.y); 
            const distance = disX + disY;
            if(isNaN(closest.distance) || distance < closest.distance) { 
                closest.ind = ind;
                closest.distance = distance;
                closest.item = item;
            }
        });
        storage.children.iterate((item) => {
            if(!item.checkStorageIfFull()) return this.target = item;
        });
        if(!this.target) return;
        if(closest.item && !this.checkInventoryIfFull()) {
            this.getPath({worldX: closest.item.x, worldY: closest.item.y});
            this.pickupTarget = closest.item;
            this.actionQueue.unshift("PICKUP"); 
        } else if(this.inventory.length) {
            this.getPath({worldX: this.target?.x ?? 0, worldY: this.target?.y ?? 0});
            this.placeItem(this.inventory[0].type, this.target);
        }
        this.actionQueue.unshift("CARRY");
    }

    getResources(resource: string | null) {
        const groundItems = this.scene.registry.get("groundItems");
        const closest = {ind: 0, distance: 1000, item: <Item | null> null };
        groundItems.children.iterate((item: Item, ind: number) => {
            const distance = Math.abs(Math.abs(this.x - item.x) + Math.abs(this.y - item.y));
            if(item.type === resource
            && distance < closest.distance) {
                closest.distance = distance;
                closest.ind = ind;
                closest.item = item;
            }
        });
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
        //this.curve = new Phaser.Curves.Line(new Phaser.Math.Vector2(this.x, this.y), new Phaser.Math.Vector2(tarX, tarY));
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
            console.log(this.target);
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
                // this.graphics.lineStyle(1, 0xffffff, 1);
                // this.graphics.lineTo(100, 100);
        
                this.curve.draw(this.graphics);  
                this.curve.updateArcLengths();
                this.curve.getPoint(this.path.t, this.path.vec);
        
                this.x = this.path.vec.x;
                this.y = this.path.vec.y;
            }
        }
        if(this.currentAction === 'PICKUP') {
            if(!this.checkIfArrived(this, this.pickupTarget)) {
                this.currentAction = null;
                this.actionQueue.unshift('PICKUP');
            } else {
                this.currentAction = null;
                this.pickup(this.pickupTarget);
                this.pickupTarget = null;
            }
        }
        if(this.currentAction === 'CARRY') {
            this.storeItems();
        }

        if(this.currentAction === 'CHOP'
        && this.target
        && !this.isDoing) {
            if(!(this.target instanceof Tree)) return;
            this.chopTree(this.target);
        }
        if(this.currentAction === 'BUILD'
        && this.target) {
            if(!(this.target instanceof BuildSpot)) return;
            if(!this.target.checkCanBuild(this.inventory)
            && !this.checkInventoryIfFull()) {
                const groundItems = this.getResources(this.target.getNeededResources());
                if(!groundItems.children.size) {
                    this.target.destroy();
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