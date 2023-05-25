import { useState, useContext } from "react";
import { UserContext } from "../RouteSwitch";
import CharacterCard from "../components/CharacterCard";
import Character from "../components/Character";

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

interface UnitSchema { 
    owner?: string,
    race?: string,
    memberNum: number,
    spd?: number,
    location: [number, number]
    hasArrived: boolean,
}

type TileSchema = {
    terrain: Terrains,
    temperature: number,
    contains: {
        structure: {},
        unit: UnitSchema | null,
        item: {},
    }
}

interface AreaSettingsSchema {
    tiles: TileSchema[][],
    temperature: number,
    size: MapSizes,
}

export default function AreaView() {
    const { user, setUser } = useContext(UserContext);
    const [selectedUnit, setSelectedUnit] = useState<UnitSchema>();

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
                unit: null,
                item: {},
            }
        }
        for(let j = 0; j < (size === 1000 ? 50 : 100); j++ ) {
            const tileArr = [];
            for(let i = 0; i < (size === 1000 ? 100 : 200); i++) {
                const contains = { unit: null, structure: {}, item: {} };
                for(const unit of user.units) {
                    if(unit.location[0] === i && unit.location[1] === j) {
                        contains.unit = unit;
                    }
                }  
                tileArr.push({...plainTile, terrain: Math.floor(Math.random() * 2),
                    contains,
                });
            }
            tiles.push(tileArr);
        }
        return tiles;
    }
    
    const [areaSettings, setAreaSettings] = useState<AreaSettingsSchema>({
        ...loadSettings(),
    });

    const mapGrid = () => {
        return areaSettings.tiles.map((item, rowInd) => {
            return item.map ((item, ind) => {
                return (
                    <div 
                        key={`tile-${ind}`} 
                        className={`tile ${item.terrain === 0 ? 'plains' : 'water'}`} 
                        onClick={(e) => moveUnit(e, selectedUnit)}
                        coord-key={[rowInd, ind]}
                    >
                        <p>[{rowInd},{ind}]</p>
                        {item.contains.unit ? <Character /> : ''}
                    </div>
                )
            }
            )
        });
    }

    const mapUnits = (player: any) => {
        return user.units.map((unit, ind) => {
            return (
                <CharacterCard
                    key={ind}
                    unit={unit}
                    setSelectedUnit={setSelectedUnit}
                />
            )
        });
    }

    const getDistance = (e: MouseEventHandler<HTMLDivElement>) => {
        const [ty, tx] = [...user.units[0].location]; 
        const [dy, dx] = [...e.target.getAttribute('coord-key').split(',')];
        const distanceY = Math.abs(tx - Number(dx)); 
        const distanceX = Math.abs(ty - Number(dy));
        console.log(distanceY, distanceX);
        return distanceX + distanceY;
    }

    const syncUnit = (unit) => {
        setUser((prev) => {
            const units = prev.units;
            units[unit.memberNum - 1] = unit;
            return {...prev, units }
        })
    }

    const moveUnit = (e: any, unit: any) => {
        if(!selectedUnit || !selectedUnit.hasArrived) return;
        const thisArea = {...areaSettings};
        const distance = getDistance(e);
        setSelectedUnit((prev) => prev ? ({...prev, hasArrived: false}) : undefined);

        setTimeout(() => {
            const newLocation = e.target.getAttribute('coord-key').split(',')
            const here = thisArea.tiles[unit.location[0]][unit.location[1]];
            const dest = thisArea.tiles[newLocation[0]][newLocation[1]];
            setSelectedUnit((prev) => {
                return prev ? ({
                        ...prev,
                        location: [newLocation[0], newLocation[1]],
                        hasArrived: true,
                    }) : undefined
                }
            )
            here.contains.unit = null;
            dest.contains.unit = unit;
            setAreaSettings((prev) => ({...prev, thisArea}));
        }, (distance * 1000) - (unit.spd * 100))
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
                <ul className="character_cards__list" >
                    <li>
                        {mapUnits(user)}
                    </li>
                </ul>
            </main>
        </>
    )
}
