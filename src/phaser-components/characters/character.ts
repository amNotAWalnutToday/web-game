import Phaser from "phaser";
import findPath from "../utils/pathfind";
import Tree from "../nodes/tree";
import BuildSpot from "../nodes/buildspot";
import Item from "../nodes/items/item";
import { getClosest, getClosestFromArray, getClosestStorage } from "../utils/getclosest";
import WoodChest from "../nodes/buildables/wood_chest";
import Buildable from "../nodes/buildables/buildable";
import checkForEmptyTile from "../utils/checkForEmptyTile";
import Stone from "../nodes/stone";
import Plant from "../nodes/flora/plant";
import food from "../data/food_items.json";
import getStorageTotal from "../utils/getstoragetotal";
import Campfire from "../nodes/buildables/campfire";

type Target = Tree | BuildSpot | Item | WoodChest | Buildable | Stone | Plant | null;

interface InventoryItem {
    type: string,
    amount: number,
}
interface PathClick {
    worldX: number,
    worldY: number,
}

interface Stats {
    [key: string]: number
}

const convertRankToInd = (rank: string): number => {
    const ranks = ["E", "D", "C", "B", "A", "S"];
    let indexRank = 0 ;
    ranks.forEach((rankInd: string, ind: number) => {
        if(rankInd === rank) indexRank = ind;
    });
    return indexRank + 1;
}

export class Character extends Phaser.Physics.Arcade.Sprite implements Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);

        const yourCharacters = this.scene.registry.get("yourCharacters");
        yourCharacters.push(this);
        this.cid = yourCharacters.length - 1;
        this.stats.speed = 1;
        this.scene.registry.set("yourCharacters", yourCharacters);

        this.setInteractive();
        this.on("pointerdown", () => {
            this.scene.registry.set("selectedInspection", this);
            console.log(this.actionQueue);
            console.log(this.destroyQueue);
            console.log(this.currentAction);
        });

        this.scene.registry.events.on("changedata", (a: any, key: string, payload: unknown) => {
            if(key === 'gameTime') this.loseHunger();
        });

        this.scene.add.existing(this);
        this.scene.time.addEvent({delay: 25, callback: this.create, callbackScope: this});
    }

    /*********/
    // stats //
    name = "Slimeson";
    race = "slime"; 
    cid: number;
    rank = 'E';
    stats: Stats = {
        maxhp: 10,
        hp: 10,
        maxHunger: 10,
        hunger: 10,
        str: 0,
        def: 0,
        will: 0,
        speed: 0,  
    }

    /************/

    /**********/
    // skills //
    skills = {
        meele: {
            level: 1,
            xp:    0,
        },
        magic: {
            level: 1,
            xp:    0,
        },
        construction: {
            level: 1,
            xp:    0,
        },
        mining: {
            level: 1,
            xp:    0,
        },
        logging: {
            level: 1,
            xp:    1,
        },
        foraging: {
            level: 1,
            xp:    1,
        },
        fishing: {
            level: 1,
            xp:    0,
        },
        cooking: {
            level: 1,
            xp:    0,
        },
        crafting: {
            level: 1,
            xp:    0,
        },
        research: {
            level: 1,
            xp:    0,
        },
        medicinal: {
            level: 1,
            xp:    0,
        },
    }

    /********/
    // misc //
    currentAction: string | null = null;
    actionQueue: string[] = [];
    buildQueue: BuildSpot[] = [];
    destroyQueue: Buildable[] = [];
    targetCoords: [number, number] = [0, 0];
    isMoving = false;
    isDoing = false;
    isDead = false;
    target: Target = null;
    pickupTarget: Target = null;
    pickupQuery: string | null = null;
    inventory: InventoryItem[] = [];
    carryCapacity = 1;
    /************/


    /************/
    // graphics //
    path: { t: number, vec: Phaser.Math.Vector2 } = { t: 0, vec: new Phaser.Math.Vector2() };
    curve: Phaser.Curves.Spline = new Phaser.Curves.Spline();
    graphics: Phaser.GameObjects.Graphics = this.scene.add.graphics();

    private movePath: Phaser.Math.Vector2[] = [];
    /************/

    create() {
        const rank = convertRankToInd('E');
        this.stats.maxHunger = Math.ceil(((this.stats.maxhp * 1.5) + this.stats.def + this.stats.str) * rank);
        this.stats.maxHunger < 10 ? this.stats.maxHunger = 10 : null;
        this.stats.hunger = this.stats.maxHunger;
    }

    loseHunger() {
        if(this.stats.hunger > 0) {
            this.stats.hunger--;
        } else {
            this.takeDamage(1);
        }
    }

    takeDamage(damage: number) {
        if(this.stats.hp > 0) {
            this.stats.hp -= damage;
        } else {
            this.selfDestruct();
        }
    }

    selfDestruct() {
        if(this.isDead) return; 
        const yourCharacters = this.scene.registry.get("yourCharacters");
        yourCharacters.splice(this.cid, 1);
        for(let i = 0; i < yourCharacters.length; i++) {
            yourCharacters[i].cid = i; 
        }
        this.isDead = true;
        this.scene.registry.set("yourCharacters", yourCharacters);
        this.scene.registry.set("selectedCharacter", null);
        this.graphics.destroy();
        this.destroy();
    }

    checkInventoryIfFull() {
        const amount = this.inventory.reduce((prev, current) => {
            const total = current.amount + prev;
            return total; 
        }, 0);
        if(amount >= this.carryCapacity) return true;
        else false;
    }

    checkInventoryForItem(searchItems: string[]) {
        for(const item of this.inventory) {
            for(const searchItem of searchItems) {
                if(searchItem === item.type) return item;
            } 
        }
    }

    checkListForItem(list: any[], searchItem: string) {
        for(const item of list) {
            if(searchItem === item.type) return item;
        }
    }

    eatFood() {
        const storage = this.scene.registry.get("storage");
        const foodItems = Array.from(food.items, (item) => item.type);
        if(!getStorageTotal(this.scene, foodItems)) return;
        const closest = getClosestStorage({x: this.x, y: this.y}, storage, foodItems, {checkForResource: true});
        const inventoryFoodItem = this.checkInventoryForItem(foodItems);
        if(inventoryFoodItem) {
            const listItem = this.checkListForItem(food.items, inventoryFoodItem.type);
            this.stats.hunger += listItem?.value;
            if(this.stats.hunger > this.stats.maxHunger) this.stats.hunger = this.stats.maxHunger;
            return this.placeItem(listItem.type, null);
        }
        if(!closest.item) return;
        this.pickupTarget = closest.item;
        if(!this.checkIfArrived(this, closest.item)) {
            this.currentAction = null;
            return this.getPath({worldX: closest.item.x, worldY: closest.item.y});
        } else {
            if(this.checkInventoryIfFull()) {
                this.storeItems();
            } else {
                this.takeFromStorage(closest.query);
                this.currentAction = null;
                this.pickupTarget = null;
            }
        }
    }

    pickPlant() {
        const plants = this.scene.registry.get("plants");
        const closest = getClosest({x: this.x, y: this.y}, plants, 'ANY');
        this.target = closest.item;
        if(!closest.item) return this.currentAction = null;
        if(!this.checkIfArrived(this, closest.item)) {
            this.currentAction = null;
            this.actionQueue.unshift("FORAGE");
            return this.getPath({worldX: closest.item.x, worldY: closest.item.y});
        } else {
            if(!(this.target instanceof Plant)) return this.currentAction = null;
            this.target.pick();
        }
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

    mineStone() {
        const miningNodes = this.scene.registry.get("miningNodes");
        const closest = getClosest({x: this.x, y: this.y}, miningNodes, 'ANY');
        this.target = closest.item;
        if(!closest.item) return this.currentAction = null;
        if(!this.checkIfArrived(this, closest.item, {xDiff: 3, yDiff: 3})) {
            this.currentAction = null;
            this.actionQueue.unshift("MINE");
            const freeSpot = checkForEmptyTile(this.scene, closest.item.x, closest.item.y);
            if(!freeSpot) return;
            return this.getPath({worldX: freeSpot.x * 16, worldY: freeSpot.y * 16});
        } else {
            if(!(this.target instanceof Stone)) return this.currentAction = null;
            this.target.mine();
        }
    }

    fishPercentage = 0;

    fish() {
        const fishingTiles = this.scene.registry.get("fishingTiles");
        const closest = !(this.target instanceof Phaser.Tilemaps.Tile) 
            ? getClosestFromArray({x: this.x / 16, y: this.y / 16}, fishingTiles, 'ANY')
            : {item: this.target};
        this.target = closest.item;
        if(!closest.item) return this.currentAction = null;
        if(this.checkInventoryIfFull()) {
            this.storeItems();
            this.currentAction = null;
            this.actionQueue.unshift("FISH");
        } else if(!this.checkIfArrived(this, {x: closest.item.x * 16, y: closest.item.y * 16}, {xDiff: 3, yDiff: 3})) {
            this.currentAction = null;
            const freeSpot = checkForEmptyTile(this.scene, closest.item.x * 16, closest.item.y * 16);
            if(!freeSpot) return;
            this.actionQueue.unshift("FISH");
            return this.getPath({worldX: freeSpot.x * 16, worldY: freeSpot.y * 16});
        } else {
            this.fishPercentage += 0.1;
            if(Math.ceil(this.fishPercentage) === 99) {
                this.fishPercentage = 0;
                for(const inventoryItem of this.inventory) {
                    if(inventoryItem.type === 'crayfish') return inventoryItem.amount++;
                }
                this.inventory.push({type: 'crayfish', amount: 1});
            }  
        }
    }

    cook() {
        const cookingStations = this.scene.registry.get("cookingStations");
        const closest = getClosest({x: this.x, y: this.y}, cookingStations, 'ANY');
        this.target = closest.item;
        if(!closest.item) return this.currentAction = null;
        if(!(closest.item instanceof Campfire)) return this.currentAction = null;
        if(!closest.item.checkCanCook()
        && !this.checkInventoryIfFull()) {
            const fromStorage = getStorageTotal(this.scene, Array.from(food.items, (i) => i.type));
            this.getResources(<string[]> closest.item.getIngredientsType(), fromStorage.length > 0);
            this.currentAction = null;
            this.actionQueue.unshift("COOK");
        } else if(!this.checkInventoryForItem([this.pickupQuery ?? 'ANYTHING'])
        && this.checkInventoryIfFull()) {
            this.currentAction = null;
            this.actionQueue.unshift("COOK");
            this.storeItems();
        } else if(!this.checkIfArrived(this, {x: closest.item.x, y: closest.item.y})) {
            this.currentAction = null;
            this.actionQueue.unshift("COOK");
            return this.getPath({worldX: closest.item.x, worldY: closest.item.y});
        } else if(this.checkIfArrived(this, {x: closest.item.x, y: closest.item.y})) {
            if(!closest.item.checkCanCook()) {
                this.currentAction = null;
                this.actionQueue.unshift("COOK");
                this.placeItem(this.pickupQuery, closest.item); 
            } else if(closest.item.checkCanCook()) {
                closest.item.cooker = this;
                closest.item.cook();
            }
        }
    }

    takeFromStorage(item: string) {
        if(!(this.pickupTarget instanceof WoodChest) || !item) return;
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

    dirtyPickup(item: string) {
        for(const inventoryItem of this.inventory) {
            if(item === inventoryItem.type) return inventoryItem.amount++; 
        }
        this.inventory.push({type: item, amount: 1});
    }

    placeItem(item: string | null, place: any) {
        if(!item) return;
        if(place) place.addResource(item);
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

    cancelQueue() {
        this.currentAction = null;
        this.actionQueue = [];
        this.graphics.clear();
        this.cancelBuild();
        this.target = null;
        this.pickupTarget = null;
        this.isDoing = false;
    }

    cancelBuild() {
        if(!(this.target instanceof BuildSpot)) return;
        this.target.selfDestruct();
        this.target = null;
        for(const buildItem of this.buildQueue) {
            buildItem.selfDestruct();
        }
        this.actionQueue = [];
        this.buildQueue = [];
    }

    deconstruct() {
        const itemsToDeconstruct = this.scene.registry.get("itemsToDeconstruct");
        const closest = getClosest({x: this.x, y: this.y }, itemsToDeconstruct, 'ANY');
        if(!closest.item) return;
        if(!(closest.item instanceof Buildable)) return;
        if(!this.checkIfArrived(this, closest.item, {xDiff: 3, yDiff: 3})) {
            const freeSpot = closest.item.checkForEmptySpot();
            if(!freeSpot) return this.currentAction = null;
            else {
                this.currentAction = null;
                this.actionQueue.unshift("DESTROY");
            }
            return this.getPath({worldX: freeSpot.x * 16, worldY: freeSpot.y * 16});
        } else {
            if(!(closest.item instanceof Buildable)) return;
            closest.item.deconstruct();
            if(closest.item.deconstructPercentage > 99) {
                this.currentAction = null;
                this.cancelQueue();
            }
        }
    }

    build(item: BuildSpot) {
        this.target = item;
        if(this.currentAction !== 'BUILD') return;
        if(Math.ceil(item.builtPercentage) < 100) item.buildMe();
        else this.target = null;
    }

    storeItems() {
        const wasCarry = this.currentAction;
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
        if(wasCarry === "CARRY" 
        || this.actionQueue.includes("CARRY")) {
            this.actionQueue.unshift("CARRY");
        }
    }

    getResources(resource: string | string[] | null, fromStorage = false) {
        const groundItems = this.scene.registry.get("groundItems");
        const storage = this.scene.registry.get("storage");
        const closest = fromStorage 
            ? getClosestStorage({x: this.x, y: this.y}, storage, resource, {checkForResource: true})
            : getClosest({x: this.x, y: this.y}, groundItems, resource);
        if(!closest.item) return groundItems;
        if(fromStorage) this.pickupQuery = closest.query;
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
        if(!path.length) return;
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
            duration: (60 - (this.stats.speed * 2.5)) * distance,
            repeat: 0
        });
    }

    checkIfArrived(
        start:  Phaser.Physics.Arcade.Sprite | {x: number, y: number}, 
        target: Phaser.Physics.Arcade.Sprite | {x: number, y: number},
        options = {xDiff: 2, yDiff: 2},
    ) {
        if(!start || !target) return;
        const map = this.scene.registry.get("map");
        const startVec = map.map.worldToTileXY(start.x, start.y);
        const targetVec = map.map.worldToTileXY(target.x, target.y);
        const xDif = Math.abs(startVec.x - targetVec.x);
        const yDif = Math.abs(startVec.y - targetVec.y);
        if(xDif < options.xDiff && yDif < options.yDiff) {
            return true;
        } else {
            return false;
        }
    }

    getClosestQueueAction(item: string) {
        if(this.actionQueue.includes(item.toUpperCase())
        || this.currentAction === item.toUpperCase()) return true;
        else return false;
    }

    checkQueueBroke() {
        if(this.actionQueue.length > 50) this.cancelQueue();
    }

    updateCharacters() {
        const yourCharacters = this.scene.registry.get("yourCharacters");
        for(const char of yourCharacters) {
            if(this.cid === char.cid) yourCharacters[this.cid] = this;
        }
        this.scene.registry.set("yourCharacters", yourCharacters);
    }

    update() {
        if(this.stats.hunger < this.stats.maxHunger / 4
        && this.currentAction !== 'MOVE') { 
            this.eatFood();
        } 
        if(!this.actionQueue.length 
        && !this.currentAction 
        && !this.buildQueue.length
        && !this.destroyQueue.length) return;
        if(!this.currentAction && this.actionQueue.length) {
            const nextAction = this.actionQueue.pop();
            this.currentAction = nextAction ?? null;
            this.updateCharacters();
        } 
        if(!this.target && this.buildQueue.length) {
            const nextTarget = this.buildQueue.pop();
            this.target = nextTarget ?? null;
            this.actionQueue.unshift("BUILD");
            this.updateCharacters();
        }
        if(!this.target && this.destroyQueue.length) {
            const nextTarget = this.destroyQueue.pop();
            this.target = nextTarget ?? null;
            this.actionQueue.unshift("DESTROY");
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
                if(this.actionQueue.length) {
                    this.actionQueue.unshift('PICKUP');
                }
            } else {
                this.currentAction = null;
                const resourceType = this.target instanceof BuildSpot
                    ? this.target.getNeededResources()
                    : this.target instanceof Campfire
                        ? this.pickupQuery
                        : '';

                this.pickup(this.pickupTarget, resourceType);
                this.pickupTarget = null;
            }
        }
        if(this.currentAction === 'CARRY') this.storeItems();
        if(this.currentAction === 'CHOP') this.chopTree();
        if(this.currentAction === 'FORAGE') this.pickPlant();
        if(this.currentAction === 'MINE') this.mineStone();
        if(this.currentAction === 'FISH') this.fish();
        if(this.currentAction === 'COOK') this.cook();
        if(this.currentAction === 'DESTROY') this.deconstruct();

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