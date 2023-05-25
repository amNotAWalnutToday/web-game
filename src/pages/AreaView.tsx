import { useState, useMemo } from "react";

enum MapSizes {
    TINY   =  1000,
    SMALL  =  5000,
    MEDIUM =  7600,
    LARGE  =  10000,
}

enum Terrains {
    PLAINS = 0,
    WATER
}

type TileSchema = {
    terrain: Terrains,
    temperature: number,
    contains: {
        structure: {},
        unit: {},
        item: {},
    }
}

interface AreaSettingsSchema {
    tiles: TileSchema[],
    temperature: number,
    size: MapSizes,
}

export default function AreaView() {
    const loadSettings = () => {
        const temperature = 20;
        const size = 1000;
        const tiles = loadTiles(temperature, size);
        const settings: AreaSettingsSchema = { tiles, temperature, size }
        return settings;
    }

    const loadTiles = (temperature: number, size: number) => {
        const tiles = [];
        const plainTile: TileSchema = {
            terrain: 0,
            temperature,
            contains: {
                structure: {},
                unit: {},
                item: {},
            }
        }
        for(let i = 0; i < size; i++) {
            tiles.push({...plainTile, terrain: Math.floor(Math.random() * 2)});
        }
        return tiles;
    }
    
    const [areaSettings, setAreaSettings] = useState<AreaSettingsSchema>({
        ...loadSettings(),
    });

    const mapGrid = () => {
        return areaSettings.tiles.map((item, ind) => {
            return (
                <div key={`tile-${ind}`} className={`tile ${item.terrain === 0 ? 'plains' : 'water'}`} >
                    <p>{ind}</p>
                </div>
            )
        });
    }
    return (
        <>
            <main className="page">
                <div className="game_view">
                        <div
                            className="world_view tiny"
                        >
                            {mapGrid()}
                        </div>
                    </div>
            </main>
        </>
    )
}
