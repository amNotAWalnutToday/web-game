import Buildable from "./buildable";
import food from '../../data/food_items.json';
import drawProgress from "../../utils/drawprogress";

type Food = typeof food.items[0];

export default class Campfire extends Buildable {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'campfire', frame = 2) {
        super(scene, x, y, texture, frame);
        // const map = this.scene.registry.get("map");
        // const tileCoords = map.map.worldToTileXY(this.x, this.y);
        // const tileAt = map.map.getTileAt(tileCoords.x, tileCoords.y);
        // tileAt.properties.collides = true;
        // this.scene.registry.set("map", map);
        this.scene.registry.events.on("changedata", (a: string, key: string) => {
            if(key === 'gameTime') this.loseDurability();
            return a;
        });
        this.setInteractive();
        this.on("pointerdown", () => console.log(this.ingredients));

        const cookingStations = this.scene.registry.get("cookingStations");
        cookingStations.add(this);
        this.scene.registry.set("cookingStations", cookingStations);
    }

    durability = 24;
    cookPercentage = 0;
    cooker: any = null;
    isBroke = false;
    recipeSelected = {
        type: "stew",
        rank: "E"
    };
    ingredients: {[key: string]: number} = {
        "plant": 0,
        "meat": 0
    };

    cook() {
        this.cookPercentage += 0.1;
        drawProgress(this.progressBar, this, this.cookPercentage);
        if(Math.ceil(this.cookPercentage) === 99) {
            this.giveMeal();
            this.cookPercentage = 0;
            this.ingredients.plant -= 1;
            this.ingredients.meat  -= 1;
        }
    }

    giveMeal() {
        if(!this.cooker) return console.error("No Cooker");
        this.cooker.dirtyPickup(this.recipeSelected.type);
        this.cooker.pickupQuery = null;
        this.cooker.currentAction = null;
        this.cooker.actionQueue.unshift("COOK");
    }

    addResource(ingredient: string) {
        for(const item of food.items) {
            if(item.type === ingredient) {
                for(const category in this.ingredients) {
                    const itemsCategory = item.category === 'fish'
                        ? 'meat' 
                        : item.category;
                    if(category === itemsCategory) {
                        this.ingredients[category] += 1;
                    }
                }
            }
        }
    }

    getIngredients() {
        return food.items.filter((item) => {
            if(item.rank === this.recipeSelected.rank) { 
                return item;
            }
        }) ?? [];
    }

    getIngredientsType() {
        return Array.from(food.items, (item) => {
            if(item.rank === this.recipeSelected.rank
            && (item.category === 'plant' 
                && !this.ingredients.plant)
            || (['meat', 'fish'].includes(item.category)
                && !this.ingredients.meat)) {
                    return item.type;
            }
        }) ?? [];
    }
    

    getNeededResources() {
        const ings: Food[] = this.getIngredients();
        if(!ings) return;
        for(const res of ings) {
            if((this.ingredients.meat 
            && !this.ingredients.plant
            && res.category === 'plant')
            || (!this.ingredients.meat
            && this.ingredients.plant
            && ['meat', 'fish'].includes(res.category))
            || (!this.ingredients.plant
            && !this.ingredients.meat
            && ['meat', 'fish', 'plant'].includes(res.category))) { 
                return res.type;
            }
        }
    }

    checkCanCook() {
        if(this.ingredients.plant && this.ingredients.meat) return true;
        else return false;
    }

    loseDurability() {
        this.durability--;
        if(this.durability <= 0
        && !this.isBroke) {
            this.selfDestruct();
        }
    }
}