import Phaser from "phaser";

interface TilePosition {
    x: number,
    y: number,
}

interface PathOptions {
    race: string | null,
}

const toKey = (x: number, y: number) => `${x}x${y}`;

const findPath = (
        start: Phaser.Math.Vector2, 
        target: Phaser.Math.Vector2, 
        groundLayer: Phaser.Tilemaps.TilemapLayer, 
        wallsLayer: Phaser.Tilemaps.TilemapLayer | null,
        options: PathOptions = {race: null}
    ) => {
        if(!groundLayer.getTileAtWorldXY(target.x, target.y)) return [];
        if(wallsLayer?.getTileAtWorldXY(target.x, target.y)) return [];
        if(groundLayer.getTileAt(target.x, target.y).properties.terrain === 'water'
        && options.race !== 'harpy') return [];
        if(groundLayer.getTileAt(target.x, target.y).properties.collides) return [];
        
        const queue: TilePosition[] = [];
        const parentForKey: { [key: string]: {key: string, position: TilePosition } } = {};

        const startKey = toKey(start.x, start.y);
        const targetKey = toKey(target.x, target.y);

        parentForKey[startKey] = {
            key: '',
            position: { x: -1, y: -1 }
        }

        queue.push(start);

        while(queue.length > 0) {
            const lastItemInQueue = queue.shift();
            if(!lastItemInQueue) break;
            const { x, y } = lastItemInQueue;

            const currentKey = toKey(x, y);

            if(currentKey === targetKey) break;
            
            const neighbours = [
                {x, y: y - 1,},
                {x: x - 1, y,},
                {x, y: y + 1,},
                {x: x + 1, y,},
                {x: x - 1, y: y - 1,},
                {x: x + 1, y: y + 1,},
                {x: x - 1, y: y + 1,},
                {x: x + 1, y: y - 1,},
            ];

            for(let i = 0; i < neighbours.length; i++) {
                const neighbour = neighbours[i];
                const tile = groundLayer.getTileAtWorldXY(neighbour.x, neighbour.y);
                const tileAt = groundLayer.getTileAt(neighbour.x, neighbour.y);
                if(!tile || !tileAt) continue;
                if(wallsLayer?.getTileAtWorldXY(neighbour.x, neighbour.y)) continue;
                if(tileAt.properties.terrain === 'water'
                && options.race !== 'harpy') continue;
                if(tileAt.properties.collides) continue;
                const key = toKey(neighbour.x, neighbour.y);
                if(key in parentForKey) continue;

                parentForKey[key] = {
                    key: currentKey,
                    position: { x, y },
                };

                queue.push(neighbour);  
            }
        }
        
        const path: Phaser.Math.Vector2[] = [];

        let currentKey = targetKey;
        let currentPos = parentForKey[targetKey]?.position;

        while(currentKey !== startKey) {
            const pos = groundLayer.tileToWorldXY(currentPos?.x, currentPos?.y);
            pos.x += groundLayer.tilemap.tileWidth * 0.5;
            pos.y += groundLayer.tilemap.tileHeight * 0.5;
            
            path.push(pos);
            if(!parentForKey[currentKey]) return [];
            const { key, position } = parentForKey[currentKey];
            currentKey = key;
            currentPos = position;
        }
        
        return path.reverse();
}

export default findPath;