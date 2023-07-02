export default function checkForEmptyTile(
    scene: Phaser.Scene,
    x: number,
    y: number,
    ) {
    const map = scene.registry.get("map");
    const tileCoords = map.map.worldToTileXY(x, y);
    const positions = [
        {x: tileCoords.x, y: tileCoords.y},
        {x: tileCoords.x, y: tileCoords.y + 1},
        {x: tileCoords.x, y: tileCoords.y - 1},
        {x: tileCoords.x + 1, y: tileCoords.y},
        {x: tileCoords.x - 1, y: tileCoords.y},
    ];
    for(const pos of positions) {
        const tileAt = map.map.getTileAt(pos.x, pos.y);
        if(!tileAt.properties.collides
        && tileAt.properties.terrain !== 'water') return pos;
    }
    return null;
}