import Item from "../nodes/items/item";
import WoodChest from "../nodes/buildables/wood_chest";
import Buildable from "../nodes/buildables/buildable";

export function getClosest(
        startPoint: { x: number, y: number },
        group: Phaser.Physics.Arcade.Group | any,
        searchItem: string | string[] | null,
    ) {
        const { x, y } = startPoint;
        const searchItems = Array.isArray(searchItem)
            ? searchItem
            : [searchItem];
        const closest = { ind: 0, distance: 10000, item: <Item | Buildable | null> null, query: '' };
        group.children.iterate((item: Item, ind: number) => {
            const distance = Math.abs(Math.abs(x - item.x) + Math.abs(y - item.y));
            for(const query of searchItems) {
                    if((item.type === searchItem
                    || query === 'ANY')
                    && distance < closest.distance) {
                    closest.distance = distance;
                    closest.ind = ind;
                    closest.item = item;
                    closest.query = query ?? '';
                }
            }

        });
        if(!closest.item) return {item: null};
        else return closest;
}

export function getClosestFromArray(
        startPoint: { x: number, y: number },
        group: Phaser.Physics.Arcade.Group | any,
        searchItem: string | null,
    ) {
        const { x, y } = startPoint;
        const closest = { ind: 0, distance: 10000, item: <Item | Buildable | null> null };
        group.children.forEach((item: Item, ind: number) => {
            const distance = Math.abs(Math.abs(x - item.x) + Math.abs(y - item.y));
            if((item.type === searchItem
            || searchItem === 'ANY')
            && distance < closest.distance) {
                closest.distance = distance;
                closest.ind = ind;
                closest.item = item;
            }
        });
        if(!closest.item) return {item: null};
        else return closest;
}

interface Options {
    checkFull?: boolean,
    checkForResource?: boolean,
}

export function getClosestStorage(
        startPoint: { x: number, y: number },
        group: Phaser.Physics.Arcade.Group | any,
        searchItem: string | string[] | null,
        options: Options = { checkFull: false, checkForResource: false },
    ) {
        const { x, y } = startPoint;
        const searchItems = Array.isArray(searchItem)
            ? searchItem
            : [searchItem];
        const closest = { ind: 0, distance: 10000, item: <WoodChest | null> null, query: '' };
        group.children.iterate((item: WoodChest, ind: number) => {
            const distance = Math.abs(Math.abs(x - item.x) + Math.abs(y - item.y));
            for(const query of searchItems) {
                if((item.getItem(query)
                && options.checkForResource) 
                || (!item.checkStorageIfFull()
                && options.checkFull)
                && distance < closest.distance) {
                    closest.distance = distance;
                    closest.ind = ind;
                    closest.item = item;
                    closest.query = query ?? '';
                }
            }
        });
        if(!closest.item) return { item: null };
        else return closest;
}