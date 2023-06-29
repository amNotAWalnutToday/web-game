import Item from "../nodes/item";
import WoodChest from "../nodes/buildables/wood_chest";

export function getClosest(
        startPoint: { x: number, y: number },
        group: Phaser.Physics.Arcade.Group | any,
        searchItem: string | null,
    ) {
        const { x, y } = startPoint;
        const closest = { ind: 0, distance: 1000, item: <Item | null> null };
        group.children.iterate((item: Item, ind: number) => {
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
        searchItem: string | null,
        options: Options = { checkFull: false, checkForResource: false },
    ) {
        const { x, y } = startPoint;
        const closest = { ind: 0, distance: 1000, item: <WoodChest | null> null };
        group.children.iterate((item: WoodChest, ind: number) => {
            const distance = Math.abs(Math.abs(x - item.x) + Math.abs(y - item.y));
            if((item.getItem(searchItem)
            && options.checkForResource) 
            || (!item.checkStorageIfFull()
            && options.checkFull)
            && distance < closest.distance) {
                closest.distance = distance;
                closest.ind = ind;
                closest.item = item;
            }
        });
        if(!closest.item) return { item: null };
        else return closest;
}