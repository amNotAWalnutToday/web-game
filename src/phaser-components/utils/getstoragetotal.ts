import WoodChest from "../nodes/buildables/wood_chest";
import Item from "../nodes/items/item";

export default function getStorageTotal(
    scene: Phaser.Scene,
    searchItem?: string | string[]
) {
    const storage = scene.registry.get("storage");
    const searchItems = Array.isArray(searchItem)
        ? searchItem
        : [searchItem];

    const globalItems: {type: string, amount: number}[] = [];
    const addItem = (query: string) => {
        for(const item of globalItems) {
            if(item.type === query) {
                return item.amount++;
            }
        }
        return globalItems.push({type: query, amount: 1});
    }

    storage.children.iterate((child: WoodChest) => {
        for(const item of child.storage) {
            if(searchItem) {
                for(const query of searchItems) {
                    if(item.type === query) addItem(item.type);
                }
            } else {
                addItem(item.type);
            }
        }
    });

    return globalItems;
}

export function getGroundTotal(
    scene: Phaser.Scene,
    searchItem?: string | string[]
) {
    const groundItems = scene.registry.get("groundItems");
    const searchItems = Array.isArray(searchItem)
        ? searchItem
        : [searchItem];

    const globalItems: {type: string, amount: number}[] = [];
    const addItem = (query: string) => {
        for(const item of globalItems) {
            if(item.type === query) {
                return item.amount++;
            }
        }
        return globalItems.push({type: query, amount: 1});
    }

    groundItems.children.iterate((item: Item) => {
         if(searchItem) {
            for(const query of searchItems) {
                if(item.type === query) addItem(item.type);
            }
        } else {
            addItem(item.type);
        }
    });

    return globalItems;
}